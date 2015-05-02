var inherits = require('util').inherits
var assert = require('assert')
var hyperemitter = require('hyperemitter')
var MQEmitter = require('mqemitter')
var protobuf = require('protocol-buffers')
var schemaErr = 'only one message can be defined in schema'

function MQEmitterP2P (opts) {
  if (!(this instanceof MQEmitterP2P)) {
    return new MQEmitterP2P(opts)
  }

  assert(opts, 'missing opts')
  assert(opts.schema, 'missing schema')
  assert(opts.db, 'missing db (level)')

  var parsed = protobuf(opts.schema)
  assert(Object.keys(parsed).length, schemaErr)

  this._message = parsed[Object.keys(parsed)[0]]
  this._ready = false

  this._hyper = hyperemitter(opts.db, opts.schema, {
    reconnectTimeout: opts.reconnectTimeout
  })

  var that = this
  this._queue = []
  this._emit = MQEmitter.prototype.emit
  this._hyper.on(this._message.name, function p2pHandler (msg, cb) {
    if (!that.closed) {
      that._emit(msg, cb)
    } else {
      cb()
    }
  })

  MQEmitter.call(this, opts)

  this._hyper.status.on('ready', function () {
    that._ready = true
  })

  this.status = this._hyper.status
}

inherits(MQEmitterP2P, MQEmitter)

MQEmitterP2P.prototype.emit = function (msg, cb) {
  if (this.closed) {
    cb(new Error('closed'))
  } else {
    this._hyper.emit(this._message.name, msg, cb)
  }
  return this
}

MQEmitterP2P.prototype.close = function (cb) {
  var that = this

  if (!this._ready) {
    this._hyper.status.on('ready', close)
  } else {
    close()
  }

  return this

  function close () {
    that._hyper.close(function (err) {
      if (err) { return cb(err) }
      MQEmitter.prototype.close.call(that, cb)
    })
  }
}

MQEmitterP2P.prototype.listen = function () {
  this._hyper.listen.apply(this._hyper, arguments)
}

MQEmitterP2P.prototype.connect = function () {
  this._hyper.connect.apply(this._hyper, arguments)
}

module.exports = MQEmitterP2P
