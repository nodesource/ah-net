const NetworkActivityCollector = require('../')
const test = require('tape')
const spok = require('spok')
const net = require('net')
const BUFFERLENGTH = 18
const STRINGLENGTH = 10

/* eslint-disable no-unused-vars */
const ocat = require('./util/ocat')
const save = require('./util/save')
/* eslint-enable no-unused-vars */
// eslint-disable-next-line no-unused-vars
function inspect(obj, depth) {
  console.error(require('util').inspect(obj, false, depth || 5, true))
}
const collector = new NetworkActivityCollector({
    start            : process.hrtime()
  , captureArguments : true
  , captureSource    : false
  , bufferLength     : BUFFERLENGTH
  , stringLength     : STRINGLENGTH
}).enable()

test('\none net.createServer listening', function(t) {
  const server = net.createServer()
  server
    .on('connection', onconnection)
    .on('error', onerror)
    .on('listening', onlistening)
    .listen()

  function onconnection(socket) { }
  function onerror(err) { console.error(err) }
  function onlistening() { server.close(onclosed) }

  function onclosed() {
    collector
      .disable()
      .cleanAllResources()
      .processStacks()

    const activities = collector.networkActivities
    // save('one-server.listening', Array.from(activities), { inspect: true })
    runTest(activities)
  }

  function runTest(activities) {
    t.equal(activities.size, 1, 'one network activity')
    const xs = activities.values()
    const createHandle = xs.next().value

    spok(t, createHandle,
      { $topic: 'createHandle'
      , id: spok.gtz
      , type: 'TCPWRAP'
      , triggerId: spok.gtz
      , init: spok.arrayElements(1)
      , initStack: spok.arrayElements(5)
      , resource:
        { owner:
          { _eventsCount: 3
          , _asyncId: spok.gtz
          , _connectionKey: { type: 'string', len: 6, included: 6, val: '6::::0' }
          , proto: 'Server' }
        , functions:
          [ { path: [ 'owner', '_events', 'connection' ]
            , key: 'connection'
            , level: 2
            , info: {
                  file: spok.endsWith('one-tcp-server.listen+close.js')
                , line: spok.gt(10)
                , column: spok.gtz
                , inferredName: ''
                , name: 'onconnection' }
            , id: createHandle.id
            , arguments: null }
          , { path: [ 'owner', '_events', 'error' ]
            , key: 'error'
            , level: 2
            , info: {
                  file: spok.endsWith('one-tcp-server.listen+close.js')
                , line: spok.gt(10)
                , column: spok.gtz
                , inferredName: ''
                , name: 'onerror' }
            , id: createHandle.id
            , arguments: null }
          , { path: [ 'owner', '_events', 'listening' ]
            , key: 'listening'
            , level: 2
            , info: {
                  file: spok.endsWith('one-tcp-server.listen+close.js')
                , line: spok.gt(10)
                , column: spok.gtz
                , inferredName: ''
                , name: 'onlistening' }
            , id: createHandle.id
            , arguments: null } ] } }
    )

    t.end()
  }
})
