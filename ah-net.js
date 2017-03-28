const ActivityCollector = require('ah-collector')
const StackCapturer = require('ah-stack-capturer')
const { Cloner } = require('ah-preprocessors')
const NetworkResourceProcessor = require('./lib/network-resource-processor')
const prune = require('ah-prune')

/* eslint-disable no-unused-vars */
const util = require('util')
const print = obj => process._rawDebug(util.inspect(obj, true, 100, false))
/* eslint-enable no-unused-vars */

const types = new Set([
    'TCPWRAP'
  , 'TCPCONNECTWRAP'
  , 'PIPEWRAP'
  , 'PIPECONNECTWRAP'
  , 'SHUTDOWNWRAP'
  , 'GETADDRINFOREQWRAP'
  , 'HTTPPARSER'
])

function isnetType(type) {
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
  /**
   * Instantiates a NetworkActivityCollector.
   *
   * Most of the actual processing of resources is performed by th @see
   * NetworkResourceProcessor.
   *
   * Extends [ActivityCollector](https://github.com/nodesource/ah-collector) and thus
   * exposes the same [public
   * API](https://github.com/nodesource/ah-collector#api) with added
   * functionality.
   *
   * @param {Array.<number>} $0.start the start time of the process, i.e. the result of `process.hrtime()`
   * @param {StackCapturer} [$0.stackCapturer=StackCapturer] [see ah-stack-capturer](https://github.com/nodesource/ah-stack-capturer) which
   * configures how and when stacks traces are captured and processed.
   *
   * By default a StackCapturer is used that captures stacks for all events for
   * file system related types: `FSREQWRAP`, `FSREQUESTWRAP` and some others like
   * `TickObject`s that also are related, i.e. if they contain information related
   * to streams.
   *
   * @param {number} [$0.bufferLength=0] determines how many elements of Buffers are
   * captured. By default not Buffer data is captured.
   *
   * @param {number} [$0.stringLength=0] determines how much of each string is
   * captured. By default no string data is captured.
   *
   * @param {boolean} [$0.captureArguments=false] if `true` arguments of callbacks
   * are captured when they are processed.
   *
   * @param {boolean} [$0.captureSource=false] if `true` the source code of callbacks
   * is captured when they are processed.
   *
   * @constructor
   * @name NetworkActivityCollector
   */
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
