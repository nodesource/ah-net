const ActivityCollector = require('ah-collector')
const StackCapturer = require('ah-stack-capturer')
const { Cloner } = require('ah-preprocessors')
const NetworkResourceProcessor = require('./lib/network-resource-processor')
const prune = require('ah-prune')

/* eslint-disable no-unused-vars */
const util = require('util')
const print = obj => process._rawDebug(util.inspect(obj, true, 100, true))
/* eslint-enable no-unused-vars */

const types = new Set([ 'TCPWRAP', 'TCPCONNECTWRAP', 'PIPEWRAP', 'PIPECONNECTWRAP', 'SHUTDOWNWRAP', 'GETADDRINFOREQWRAP' ])

function isnetType(type) {
  // TODO: when implementing further examples make sure to consider TickObjects
  // as they maybe more important in those cases.
  // return true
  return types.has(type)
}

const defaultStackCapturer = new StackCapturer({
  shouldCapture(event, type, activity) {
    // could include stream tick objects here, but those stacks
    // are useless as they just contain two traces of process/next_tick.js
    return isnetType(type)
  }
})

class NetworkActivityCollector extends ActivityCollector {
  constructor({
      start
    , stackCapturer = defaultStackCapturer
    , bufferLength = 0
    , stringLength = 0
    , captureArguments = false
    , captureSource = false
  }) {
    super({ start, stackCapturer, requireInit: true })

    const cloner = new Cloner({ bufferLength, stringLength })
    this._resourceProcessor = new NetworkResourceProcessor(
      { cloner, captureArguments, captureSource }
    )
  }

  get networkActivities() {
    return prune({
        activities: this.activities
      , keepFn(type, activity) {
          return isnetType(type)
        }
    })
  }

  cleanAllResources(collectFunctionInfo) {
    this._resourceProcessor
      .cleanAllResources(this.activities, { collectFunctionInfo })
    return this
  }

  // @override
  _init(uid, type, triggerId, resource) {
    const activity = super._init(uid, type, triggerId, resource)
    activity.resource = resource
    return activity
  }

  // @override
  _after(uid) {
    const h = super._after(uid)
    this._resourceProcessor
      .cleanupResource(uid, this.activities, { collectFunctionInfo: true })
    return h
  }

  // @override
  _destroy(uid) {
    const h = super._destroy(uid)
    this._resourceProcessor
      .cleanupResource(uid, this.activities, { collectFunctionInfo: true })
    return h
  }
}

module.exports = NetworkActivityCollector
