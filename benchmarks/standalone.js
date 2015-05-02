var fs = require('fs')
var path = require('path')
var schema = fs.readFileSync(path.join(__dirname, 'bench.proto'))
var p2p = require('../')
var level = require('level')
var emitter = p2p({
  concurrency: 10,
  schema: schema,
  db: level('db')
})
var total = 100000
var written = 0
var received = 0
var timerKey = 'time for sending ' + total + ' messages'

function write () {
  if (written === total) {
    return
  }

  emitter.emit({
    topic: 'hello',
    payload: 'world',
    counter: written++
  }, write)
}

emitter.on('hello', function (msg, cb) {
  received++
  if (received === total) {
    console.timeEnd(timerKey)
  }
  setImmediate(cb)
})

console.time(timerKey)

emitter.status.on('ready', function () {
  write()
  write()
  write()
  write()
  write()
  write()
  write()
  write()
  write()
  write()
  write()
  write()
})
