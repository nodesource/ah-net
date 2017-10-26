const NetworkActivityCollector = require('../')
const test = require('tape')
const tick = require('./util/tick')
const { execSync } = require('child_process')
const spok = require('spok')
const tls = require('tls')
const filterSortFunctions = require('./util/filter-sort-functions')
const lastEls = require('./util/last-els.js')
const BUFFERLENGTH = 18
const STRINGLENGTH = 60

const userFunctions = [
  { path: lastEls([ '_events', 'error' ])
  , key: 'error'
  , info: {
      file: spok.endsWith('tls-one-connection.server.js')
    , name: 'onerror' }
  , arguments: null }
, { path: lastEls([ '_events', 'listening' ])
  , key: 'listening'
  , info: {
      file: spok.endsWith('tls-one-connection.server.js')
    , name: 'onlistening' }
  , arguments: null }
, { path: lastEls([ '_events', 'connection', '1' ])
  , key: '1'
  , info: {
      file: spok.endsWith('tls-one-connection.server.js')
    , name: 'onconnection' }
  , arguments: null } ]
userFunctions.$topic = 'userFunctions'

/* eslint-disable no-unused-vars */
const ocat = require('./util/ocat')
const save = require('./util/save')
/* eslint-enable no-unused-vars */

const collector = new NetworkActivityCollector({
    start            : process.hrtime()
  , captureArguments : true
  , captureSource    : false
  , bufferLength     : BUFFERLENGTH
  , stringLength     : STRINGLENGTH
}).enable()

test('\none tls.createServer', function(t) {
  const ciphers = 'AECDH-NULL-SHA'
  const server = tls.createServer({ ciphers })

  server
    .on('connection', onconnection)
    .on('error', onerror)
    .on('listening', onlistening)
    .listen(0, '::1')

  function onerror(err) { t.ifEror(err) }
  function onlistening() {
    // Start client in separate child process and have it connect to the server
    // Having it in separate process eliminates chance to confuse TCPWRAPS of client
    // with the ones of server.
    const port = server.address().port
    const client = `
    const tls = require('tls')
    const opts = { host: 'localhost', port: ${port}, family: 6, rejectUnauthorized: false, ciphers: '${ciphers}' }
    tls.connect(opts).once('connect', onconnected)
    function onconnected() { this.destroy() }`.split(/\n/).join(';')

    execSync(`${process.execPath} -e "${client}"`)
  }

  function onconnection(socket) {
    socket.write('Hello')
    socket
      .on('finish', onsocketEnd)
      .end()

    function onsocketEnd() {
      server.close(onclosed)
    }
  }

  function onclosed() {
    tick(2, () => {
      collector
        .disable()
        .cleanAllResources()
        .processStacks()

      // save('one-connection.tls.server', Array.from(collector.networkActivities), { json: true })
      // save('one-connection.tls.server.all', Array.from(collector.activities), { json: true })
      runTest(collector.networkActivities)
    })
  }
  function runTest(activities) {
    t.equal(activities.size, 4, '4 network activities')
    const xs = activities.values()

    const listen = xs.next().value

    spok(t, listen,
      { $topic: 'listen'
      , id: spok.gtz
      , type: 'TCPWRAP'
      , triggerId: spok.gtz
      , init: spok.arrayElements(1)
      , initStack: spok.arrayElementsRange(5, 6)
      , resource:
        { owner:
           { _contexts: 0
           , requestCert: false
           , rejectUnauthorized: true
           , ciphers: { type: 'string', len: 14, included: 14, val: 'AECDH-NULL-SHA' }
           , honorCipherOrder: true
           , sessionIdContext:
              { type: 'string'
              , len: 32
              , included: 32
              , val: spok.string }
           , _sharedCreds: { context: { proto: 'SecureContext' } }
           , domain: null
           , _events: { type: 'object', proto: null, val: '<deleted>' }
           , _eventsCount: spok.ge(2)
           , _connections: 1
           , _handle:
              { bytesRead: 0
              , _externalStream: { type: 'object', proto: null, val: '<deleted>' }
              , fd: spok.gtz
              , reading: false
              , owner: { type: 'object', proto: 'Server', val: '<deleted>' }
              , onread: null
              , onconnection: { type: 'function', proto: null, val: '<deleted>' }
              , writeQueueSize: 0
              , proto: 'TCP' }
           , _usingSlaves: false
           , _slaves: { type: 'object', proto: 'Array', val: '<deleted>' }
           , _unref: false
           , allowHalfOpen: false
           , pauseOnConnect: false
           , _connectionKey: { type: 'string', len: 7, included: 7, val: '6:::1:0' }
           , proto: 'Server' } }
      , before: spok.arrayElements(1)
      , beforeStacks: spok.arrayElements(1)
      , after: spok.arrayElements(1)
      , afterStacks: spok.arrayElements(1)
      , destroy: spok.arrayElements(1)
      , destroyStack: spok.arrayElements(0)
    })
    spok(t, filterSortFunctions(listen.resource.functions), userFunctions)

    const connection = xs.next().value

    spok(t, connection,
      { $topic: 'connection'
      , id: spok.gtz
      , type: 'TCPWRAP'
      , triggerId: listen.id
      , init: spok.arrayElements(1)
      , initStack: spok.arrayElements(0)
      , resource:
        { owner:
           { connecting: false
           , _hadError: false
           , _handle: null
           , _parent: null
           , _host: null
           , _readableState: { type: 'object', proto: 'ReadableState', val: '<deleted>' }
           , readable: false
           , domain: null
           , _events: { type: 'object', proto: null, val: '<deleted>' }
           , _eventsCount: spok.gt(2)
           , _writableState: { type: 'object', proto: 'WritableState', val: '<deleted>' }
           , writable: false
           , allowHalfOpen: false
           , _bytesDispatched: spok.gtz
           , _sockname: null
           , _pendingData: null
           , _pendingEncoding: { type: 'string', len: 0, included: 0, val: '' }
           , server:
              { _contexts: 0
              , requestCert: false
              , rejectUnauthorized: true
              , ciphers: { type: 'string', len: 14, included: 14, val: 'AECDH-NULL-SHA' }
              , honorCipherOrder: true
              , sessionIdContext:
                 { type: 'string'
                 , len: 32
                 , included: 32
                 , val: spok.string }
              , _sharedCreds: { context: { proto: 'SecureContext' } }
              , domain: null
              , _events: { type: 'object', proto: null, val: '<deleted>' }
              , _eventsCount: spok.gt(2)
              , _connections: 0
              , _handle: null
              , _usingSlaves: false
              , _slaves: { type: 'object', proto: 'Array', val: '<deleted>' }
              , _unref: false
              , allowHalfOpen: false
              , pauseOnConnect: false
              , _connectionKey: { type: 'string', len: 7, included: 7, val: '6:::1:0' }
              , proto: 'Server' }
           , _server: { type: 'object', proto: 'Server', val: '<deleted>' }
           , proto: 'Socket' } }
      , before: spok.arrayElements(1)
      , beforeStacks: spok.arrayElements(1)
      , after: spok.arrayElements(1)
      , afterStacks: spok.arrayElements(1)
      , destroy: spok.arrayElements(1)
      , destroyStack: spok.arrayElements(0)
    })

    spok(t, filterSortFunctions(connection.resource.functions), userFunctions)

    const tls = xs.next().value
    spok(t, tls,
      { $topic: 'tls'
      , id: spok.gtz
      , type: 'TLSWRAP'
      , triggerId: listen.id
      , init: spok.arrayElements(1)
      , initStack: spok.arrayElementsRange(5, 6)
      , resource:
        { owner:
           { _tlsOptions:
              { secureContext: {
                  context: x => x == null || x.proto === 'SecureContext'
                , singleUse: spok.notDefined
                , proto: 'SecureContext'
                }
              , isServer: true
              , server: { type: 'object', proto: 'Server', val: '<deleted>' }
              , requestCert: false
              , rejectUnauthorized: true
              , handshakeTimeout: spok.gtz
              , NPNProtocols: spok.notDefined
              , ALPNProtocols: spok.notDefined
              , SNICallback: { type: 'function', proto: null, val: '<deleted>' }
              , proto: 'Object' }
           , _secureEstablished: false
           , _securePending: false
           , _newSessionPending: false
           , _controlReleased: false
           , _SNICallback: spok.notDefined
           , servername: spok.notDefined
           , npnProtocol: spok.notDefined
           , alpnProtocol: spok.notDefined
           , authorized: false
           , authorizationError: spok.notDefined
           , encrypted: true
           , _events: { type: 'object', proto: null, val: '<deleted>' }
           , _eventsCount: 8
           , connecting: false
           , _hadError: false
           , _handle:
              { bytesRead: 0
              , _externalStream: { type: 'object', proto: null, val: '<deleted>' }
              , fd: spok.gtz
              , _parent: { type: 'object', proto: 'TCP', val: '<deleted>' }
              , _parentWrap: { type: 'object', proto: 'Socket', val: '<deleted>' }
              , _secureContext: {
                  context: x => x == null || x.proto === 'SecureContext'
                , singleUse: spok.notDefined
                , proto: 'SecureContext'
                }
              , reading: true
              , owner: { type: 'object', proto: 'TLSSocket', val: '<deleted>' }
              , onread: { type: 'function', proto: null, val: '<deleted>' }
              , writeQueueSize: 1
              , onhandshakestart: { type: 'function', proto: null, val: '<deleted>' }
              , onhandshakedone: { type: 'function', proto: null, val: '<deleted>' }
              , onclienthello: { type: 'function', proto: null, val: '<deleted>' }
              , oncertcb: { type: 'function', proto: null, val: '<deleted>' }
              , onnewsession: { type: 'function', proto: null, val: '<deleted>' }
              , lastHandshakeTime: spok.gtz
              , handshakes: 0
              , onerror: { type: 'function', proto: null, val: '<deleted>' }
              , proto: 'TLSWrap' }
           , _parent: { type: 'object', proto: 'Socket', val: '<deleted>' }
           , _host: spok.notDefined
           , _readableState: { type: 'object', proto: 'ReadableState', val: '<deleted>' }
           , readable: true
           , domain: spok.notDefined
           , _writableState: { type: 'object', proto: 'WritableState', val: '<deleted>' }
           , writable: true
           , allowHalfOpen: false
           , _bytesDispatched: 0
           , _sockname: spok.notDefined
           , _pendingData: spok.notDefined
           , _pendingEncoding: { type: 'string', len: 0, included: 0, val: '' }
           , server:
              { _contexts: 0
              , requestCert: false
              , rejectUnauthorized: true
              , ciphers: { type: 'string', len: 14, included: 14, val: 'AECDH-NULL-SHA' }
              , honorCipherOrder: true
              , sessionIdContext:
                 { type: 'string'
                 , len: 32
                 , included: 32
                 , val: spok.string }
              , _sharedCreds: { context: { proto: 'SecureContext' } }
              , _events: { type: 'object', proto: null, val: '<deleted>' }
              , _eventsCount: 4
              , _connections: 1
              , _usingSlaves: false
              , _slaves: { type: 'object', proto: 'Array', val: '<deleted>' }
              , _unref: false
              , allowHalfOpen: false
              , pauseOnConnect: false
              , _connectionKey: { type: 'string', len: 7, included: 7, val: '6:::1:0' }
              , proto: 'Server' }
           , ssl: { type: 'object', proto: 'TLSWrap', val: '<deleted>' }
           , _requestCert: false
           , _rejectUnauthorized: true
           , proto: 'TLSSocket' } }
      , before: spok.arrayElements(2)
      , beforeStacks: spok.arrayElements(2)
      , after: spok.arrayElements(2)
      , afterStacks: spok.arrayElements(2)
    })

    spok(t, filterSortFunctions(tls.resource.functions), userFunctions)

    const shutdown = xs.next().value
    spok(t, shutdown,
      { $topic: 'shutdown'
      , id: spok.gtz
      , type: 'SHUTDOWNWRAP'
      , triggerId: connection.id
      , init: spok.arrayElements(1)
      , initStack: spok.arrayElementsRange(5, 6)
      , resource: null
      , before: spok.arrayElements(1)
      , beforeStacks: spok.arrayElements(1)
      , after: spok.arrayElements(1)
      , afterStacks: spok.arrayElements(1)
      , destroy: spok.arrayElements(1)
      , destroyStack: spok.arrayElements(0)
    })

    t.end()
  }
})
