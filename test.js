var fs = require('fs')
var path = require('path')
var schema = fs.readFileSync(path.join(__dirname, 'test.proto'))
var test = require('tape').test
var p2p = require('./')
var memdb = require('memdb')
var abstractTests = require('mqemitter/abstractTest.js')

abstractTests({
  builder: function (opts) {
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
  },
  test: test
})
