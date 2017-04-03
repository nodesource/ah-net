const NetworkActivityCollector = require('../')
const test = require('tape')
const tick = require('./util/tick')
const { exec } = require('child_process')
const spok = require('spok')
const tls = require('tls')
const filterSortFunctions = require('./util/filter-sort-functions')
const getPort = require('gport')
const BUFFERLENGTH = 18
const STRINGLENGTH = 60

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
})

const tlsOptions = {
    pipe: spok.notDefined
  , secureContext: {
      context: x => x == null || x.proto === 'SecureContext'
    , singleUse: true
    , proto: 'SecureContext'
    }
  , isServer: false
  , requestCert: true
  , rejectUnauthorized: false
  , session: spok.notDefined
  , NPNProtocols: spok.notDefined
  , ALPNProtocols: spok.notDefined
  , requestOCSP: spok.notDefined
  , proto: 'Object' }

test('\none tls.connect', function(t) {
  getPort(prepareTest)

  function prepareTest(port) {
    const ciphers = 'AECDH-NULL-SHA'
    const server = `
      const server = tls.createServer({ ciphers: '${ciphers}' })
      server.on('connection', onconnection)
      server.on('listening', onlistening)
      server.listen(${port}, '::1')

      function onconnection(socket) { socket.write('Hello')
        socket.on('finish', onsocketEnd).end()
      }
      function onsocketEnd() { server.close(onclosed) }
      function onclosed() { process.exit(0) }
      function onlistening() { console.log('listening') }
    `.split(/\n/).join(';')

    const serverProcess = exec(`${process.execPath} -e "${server}"`, onserverExit)
    serverProcess.stdout.on('data', onserverListening)

    function onserverExit(err, stdout, stderr) {
      t.ifErr(err, 'server has no error')
      t.equal(stderr.length, 0, 'server finished without error')
      t.ok(stdout.toString().startsWith('listening'), 'server listened')

      tick(5, () => {
        collector
          .disable()
          .cleanAllResources()
          .processStacks()

        // save('one-connection.tls.client', Array.from(collector.networkActivities), { json: true })
        // save('one-connection.tls.client.all', Array.from(collector.activities), { json: true })
        runTest(collector.networkActivities)
      })
    }

    function onserverListening(data) {
      collector.enable()
      // client
      const opts = {
          host: 'localhost'
        , port
        , family: 6
        , rejectUnauthorized: false
        , ciphers
      }
      tls
        .connect(opts)
        .once('connect', onconnected)

      function onconnected() {
        this.on('data', ondata)
        this.destroy()
      }

      function ondata() {}
    }
  }

  function runTest(activities) {
    t.equal(activities.size, 4, '4 network activities')
    const xs = activities.values()

    const socket = xs.next().value
    spok(t, socket,
      { $topic: 'socket'
      , id: spok.gtz
      , type: 'TCPWRAP'
      , triggerId: spok.gtz
      , init: spok.arrayElements(1)
      , initStack: spok.arrayElements(5)
      , resource:
        { owner:
           { _tlsOptions: tlsOptions
           , _secureEstablished: false
           , _securePending: false
           , _newSessionPending: false
           , _controlReleased: true
           , _SNICallback: spok.notDefined
           , servername: spok.notDefined
           , npnProtocol: spok.notDefined
           , alpnProtocol: spok.notDefined
           , authorized: false
           , authorizationError: spok.notDefined
           , encrypted: true
           , _events: { type: 'object', proto: null, val: '<deleted>' }
           , _eventsCount: spok.gt(3)
           , connecting: false
           , _asyncId: spok.gtz
           , _hadError: false
           , _host: { type: 'string', len: 9, included: 9, val: 'localhost' }
           , _readableState: { type: 'object', proto: 'ReadableState', val: '<deleted>' }
           , readable: false
           , _writableState: { type: 'object', proto: 'WritableState', val: '<deleted>' }
           , writable: false
           , allowHalfOpen: false
           , destroyed: true
           , _bytesDispatched: 0
           , _pendingEncoding: { type: 'string', len: 0, included: 0, val: '' }
           , server: spok.notDefined
           , _server: spok.notDefined
           , ssl: spok.notDefined
           , _requestCert: true
           , _rejectUnauthorized: false
           , proto: 'TLSSocket' } }
      , before: spok.arrayElements(1)
      , beforeStacks: spok.arrayElements(1)
      , after: spok.arrayElements(1)
      , afterStacks: spok.arrayElements(1)
      , destroy: spok.arrayElements(1)
      , destroyStack: spok.arrayElements(0)
    })

    const socketUserFunctions =
      [ { path: [ 'owner', '_events', 'data' ]
       , key: 'data'
       , info: {
            file: spok.endsWith('tls-one-connection.client.js')
          , line: spok.gtz
          , column: spok.gtz
          , name: 'ondata' }
       , arguments: null } ]
    socketUserFunctions.$topic = 'socketUserFunctions'
    spok(t, filterSortFunctions(socket.resource.functions), socketUserFunctions)

    const tls = xs.next().value
    spok(t, tls,
      { $topic: 'tls'
      , id: spok.gtz
      , type: 'TLSWRAP'
      , triggerId: socket.triggerId
      , init: spok.arrayElements(1)
      , initStack: spok.arrayElements(5)
      , resource:
        { owner:
           { _tlsOptions: tlsOptions
           , _secureEstablished: false
           , _securePending: false
           , _newSessionPending: false
           , _controlReleased: true
           , _SNICallback: spok.notDefined
           , servername: spok.notDefined
           , npnProtocol: spok.notDefined
           , alpnProtocol: spok.notDefined
           , authorized: false
           , authorizationError: spok.notDefined
           , encrypted: true
           , _events: { type: 'object', proto: null, val: '<deleted>' }
           , _eventsCount: spok.gt(4)
           , connecting: false
           , _asyncId: tls.id
           , _hadError: false
           , _handle:
              { bytesRead: 0
              , _externalStream: { type: 'object', proto: null, val: '<deleted>' }
              , fd: spok.gtz
              , _parent: { type: 'object', proto: 'TCP', val: '<deleted>' }
              , _parentWrap: spok.notDefined
              , _secureContext:
                { context: { proto: 'SecureContext' }
                , singleUse: true
                , proto: 'SecureContext' }
              , reading: false
              , owner: { type: 'object', proto: 'TLSSocket', val: '<deleted>' }
              , onread: { type: 'function', proto: null, val: '<deleted>' }
              , writeQueueSize: 1
              , onhandshakestart: { type: 'function', proto: null, val: '<deleted>' }
              , onhandshakedone: { type: 'function', proto: null, val: '<deleted>' }
              , onocspresponse: { type: 'function', proto: null, val: '<deleted>' }
              , onerror: { type: 'function', proto: null, val: '<deleted>' }
              , proto: 'TLSWrap' }
           , _host: { type: 'string', len: 9, included: 9, val: 'localhost' }
           , _readableState: { type: 'object', proto: 'ReadableState', val: '<deleted>' }
           , readable: true
           , _writableState: { type: 'object', proto: 'WritableState', val: '<deleted>' }
           , writable: true
           , allowHalfOpen: false
           , destroyed: false
           , _bytesDispatched: 0
           , _sockname: spok.notDefined
           , _pendingData: spok.notDefined
           , _pendingEncoding: { type: 'string', len: 0, included: 0, val: '' }
           , server: spok.notDefined
           , ssl: { type: 'object', proto: 'TLSWrap', val: '<deleted>' }
           , _requestCert: true
           , _rejectUnauthorized: false
           , proto: 'TLSSocket' } }
      , before: spok.arrayElements(1)
      , beforeStacks: spok.arrayElements(1)
      , after: spok.arrayElements(1)
      , afterStacks: spok.arrayElements(1)
    })

    const addrinfo = xs.next().value
    spok(t, addrinfo,
      { $topic: 'addrinfo'
      , id: spok.gtz
      , type: 'GETADDRINFOREQWRAP'
      , triggerId: tls.id
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
    const tcpconnect = xs.next().value
    spok(t, tcpconnect,
      { $topic: 'tcpconnect'
      , id: spok.gtz
      , type: 'TCPCONNECTWRAP'
      , triggerId: socket.id
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

    t.end()
  }
})
