var fs = require('fs')
var path = require('path')
var schema = fs.readFileSync(path.join(__dirname, 'test.proto'))
var test = require('tape').test
var p2p = require('./')
var memdb = require('memdb')
var abstractTests = require('mqemitter/abstractTest.js')

function build (opts) {
  opts = opts || {}
  opts.db = memdb()
  opts.schema = schema

  var instance = p2p(opts)
  var emit = instance.emit

  // idiot quirk because it is slowish in delivering my message
  instance.emit = function (obj, cb) {
    emit.call(instance, obj, function (err) {
      setTimeout(function () {
        if (cb) {
          cb(err)
        }
      }, 10)
    })
  }

  return instance
}

abstractTests({
  builder: build,
  test: test
})

test('two peers', function (t) {
  t.plan(6)

  var a = build()
  var b = build()
  var msg = {
    topic: 'hello',
    payload: null
  }

  a.listen(9001, 'localhost', function (err) {
    t.error(err)
    b.connect(9001, 'localhost', function (err) {
      t.error(err)
    })
  })

  a.emit(msg)
  b.on('hello', function (received, cb) {
    cb()
    t.deepEqual(received, msg, 'msg matches')
    a.close(function (err) {
      t.error(err)
      b.close(function (err) {
        t.error(err)
        t.pass('closed successfully')
      })
    })
  })
})
