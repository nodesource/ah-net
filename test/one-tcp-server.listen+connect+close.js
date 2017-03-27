const NetworkActivityCollector = require('../')
const test = require('tape')
const tick = require('./util/tick')
const spok = require('spok')
const net = require('net')
const filterSortFunctions = require('./util/filter-sort-functions')
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

  function onconnection(socket) {
    socket.end()
    server.close(onclosed)
  }
  function onerror(err) { console.error(err) }
  function onlistening() {
    const port = server.address().port
    net.connect(port, onconnected)
  }

  function onconnected() {}

  function onclosed() {
    tick(2, () => {
      collector
        .disable()
        .cleanAllResources()
        .processStacks()

      const activities = collector.networkActivities
      // save('one-server.listening+connect', Array.from(activities), { json: true })
      runTest(activities)
    })
  }

  function runTest(activities) {
    const xs = activities.values()
    t.equal(activities.size, 6, '6 network activities')

    const serverTcp = xs.next().value

    spok(t, serverTcp,
       { $topic: 'serverTcp'
       , id: spok.gtz
       , type: 'TCPWRAP'
       , triggerId: spok.number
       , init: spok.arrayElements(1)
       , initStack: spok.arrayElements(5)
       , resource:
         { owner:
            {  _eventsCount: spok.gt(2)
            , _connections: spok.gtz
            , _asyncId: spok.number
            , _connectionKey: { type: 'string', len: 6, included: 6, val: '6::::0' }
            , proto: 'Server' }
         , functions:
            [ { path: [ 'owner', '_events', 'connection' ]
              , key: 'connection'
              , level: 2
              , info: {
                   file: spok.endsWith('one-tcp-server.listen+connect+close.js')
                 , line: spok.gt(10)
                 , column: spok.number
                 , inferredName: ''
                 , name: 'onconnection' }
              , id: spok.number
              , arguments: null }
            , { path: [ 'owner', '_events', 'error' ]
              , key: 'error'
              , level: 2
              , info: {
                   file: spok.endsWith('one-tcp-server.listen+connect+close.js')
                 , line: spok.gt(10)
                 , column: spok.number
                 , inferredName: ''
                 , name: 'onerror' }
              , id: spok.number
              , arguments: null }
            , { path: [ 'owner', '_events', 'listening' ]
              , key: 'listening'
              , level: 2
              , info: {
                   file: spok.endsWith('one-tcp-server.listen+connect+close.js')
                 , line: spok.gt(10)
                 , column: spok.number
                 , inferredName: ''
                 , name: 'onlistening' }
              , id: spok.number
              , arguments: null } ] }
       , before: spok.arrayElements(1)
       , beforeStacks: spok.arrayElements(1)
       , after: spok.arrayElements(1)
       , afterStacks: spok.arrayElements(1)
       , destroy: spok.arrayElements(1)
       , destroyStack: spok.arrayElements(0)
    })

    const clientTcp = xs.next().value
    spok(t, clientTcp,
      { $topic: 'clientTcp'
      , id: spok.gtz
      , type: 'TCPWRAP'
      , triggerId: serverTcp.id
      , init: spok.arrayElements(1)
      , initStack: spok.arrayElements(5)
      , resource:
        { owner:
          { _host: { type: 'string', len: 9, included: 9, val: 'localhost' }
          , _eventsCount: 3
          , destroyed: true
          , _bytesDispatched: 0
          , proto: 'Socket' }
        , functions: spok.array
      }
      , before: spok.arrayElements(2)
      , beforeStacks: spok.arrayElements(2)
      , after: spok.arrayElements(2)
      , afterStacks: spok.arrayElements(2)
      , destroy: spok.arrayElements(1)
      , destroyStack: spok.arrayElements(0)
    })

    const getAddrInfo = xs.next().value
    spok(t, getAddrInfo,
      { $topic: 'addrinfo'
      , id: spok.gtz
      , type: 'GETADDRINFOREQWRAP'
      , triggerId: clientTcp.id
      , init: spok.arrayElements(1)
      , initStack: spok.arrayElements(5)
      , resource: null
      , before: spok.arrayElements(1)
      , beforeStacks: spok.arrayElements(1)
      , after: spok.arrayElements(1)
      , afterStacks: spok.arrayElements(1)
      , destroy: spok.arrayElements(1)
      , destroyStack: spok.arrayElements(0)
    })

    const connectWrap = xs.next().value
    spok(t, connectWrap,
      { $topic: 'connectWrap'
      , id: spok.gtz
      , triggerId: clientTcp.id
      , init: spok.arrayElements(1)
      , initStack: spok.arrayElements(4)
      , resource: null
      , before: spok.arrayElements(1)
      , beforeStacks: spok.arrayElements(1)
      , after: spok.arrayElements(1)
      , afterStacks: spok.arrayElements(1)
      , destroy: spok.arrayElements(1)
      , destroyStack: spok.arrayElements(0)
    })

    const connectionSocket = xs.next().value

    spok(t, connectionSocket,
      { $topic: 'connectionSocket'
      , id: spok.gtz
      , type: 'TCPWRAP'
      , triggerId: serverTcp.id
      , init: spok.arrayElements(1)
      , initStack: spok.arrayElements(0)
      , resource:
        { owner:
          { _parent: null
          , _host: null
          , _eventsCount: 3
          , destroyed: true
          , proto: 'Socket'
          , server:
            { domain: null
            , _events: { type: 'object', proto: null, val: '<deleted>' }
            , _eventsCount: spok.gtz
            , _connections: spok.number
            , _connectionKey: { type: 'string', len: 6, included: 6, val: '6::::0' }
            , proto: 'Server' }
          }
        }
      , before: spok.arrayElements(2)
      , beforeStacks: spok.arrayElements(2)
      , after: spok.arrayElements(2)
      , afterStacks: spok.arrayElements(2)
      , destroy: spok.arrayElements(1)
      , destroyStack: spok.arrayElements(0)
    })

    spok(t, filterSortFunctions(connectionSocket.resource.functions),
      [ { path: [ 'owner', 'server', '_events', 'connection' ]
        , key: 'connection'
        , info: {
              file: spok.endsWith('one-tcp-server.listen+connect+close.js')
            , line: spok.gtz
            , column: spok.gtz
            , inferredName: ''
            , name: 'onconnection' }
        , arguments: null }
      , { path: [ 'owner', 'server', '_events', 'error' ]
        , key: 'error'
        , info: {
              file: spok.endsWith('one-tcp-server.listen+connect+close.js')
            , line: spok.gtz
            , column: spok.gtz
            , inferredName: ''
            , name: 'onerror' }
        , arguments: null }
      , { path: [ 'owner', 'server', '_events', 'listening' ]
        , key: 'listening'
        , info: {
              file: spok.endsWith('one-tcp-server.listen+connect+close.js')
            , line: spok.gtz
            , column: spok.gtz
            , inferredName: ''
            , name: 'onlistening' }
        , arguments: null } ]
    )

    const shutdown = xs.next().value
    spok(t, shutdown,
      { $topic: 'shutdown'
      , id: spok.gtz
      , type: 'SHUTDOWNWRAP'
      , triggerId: connectionSocket.id
      , init: spok.arrayElements(1)
      , initStack: spok.arrayElements(5)
      , resource: null
      , before: spok.arrayElements(1)
      , beforeStacks: spok.arrayElements(1)
      , after: spok.arrayElements(1)
      , afterStacks: spok.arrayElements(1)
      , destroy: spok.arrayElements(1)
      , destroyStack: spok.arrayElements(0) }
    )

    t.ok(xs.next().done, 'shutdown is last network related activity')

    t.end()
  }
})
