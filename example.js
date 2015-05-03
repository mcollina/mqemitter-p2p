var fs = require('fs')
var path = require('path')
var schema = fs.readFileSync(path.join(__dirname, 'test.proto'))
var p2p = require('./')
var memdb = require('memdb')
var assert = require('assert')

var a = p2p({
  db: memdb(),
  schema: schema
})

var b = p2p({
  db: memdb(),
  schema: schema
})

var msg = {
  topic: 'hello',
  payload: null
}

a.listen(9001, 'localhost', function (err) {
  assert(!err)
  b.connect(9001, 'localhost', function (err) {
    assert(!err)
  })
})

a.emit(msg)
b.on('hello', function (received, cb) {
  console.log(received)
  cb()
  assert.deepEqual(received, msg, 'msg matches')
  a.close(function (err) {
    assert(!err)
    b.close(function (err) {
      assert(!err)
      console.log('closed successfully')
    })
  })
})
