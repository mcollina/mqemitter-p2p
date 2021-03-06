# mqemitter-p2p

A P2P implementation of MQEmitter, based on [HyperEmitter](http://github.com/mcollina/hyperemitter) and a [Merkle DAG](http://npm.im/hyperlog)

HyperEmitter-powered [MQEmitter](http://github.com/mcollina/mqemitter).

See [MQEmitter](http://github.com/mcollina/mqemitter) for the actual
API.
The `listen` and `connect` function are exposed from the internal
`HyperEmitter`.

Install
-------

```bash
$ npm install mqemitter-p2p --save
```

Example
-------

```js
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
```


License
-------

ISC
