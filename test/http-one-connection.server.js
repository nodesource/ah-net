const http = require('http')
const test = require('tape')
const tick = require('./util/tick')
const spok = require('spok')
const filterSortFunctions = require('./util/filter-sort-functions')
const lastEls = require('./util/last-els')
const { exec } = require('child_process')

/* eslint-disable no-unused-vars */
const ocat = require('./util/ocat')
const save = require('./util/save')
/* eslint-enable no-unused-vars */

const userFunctions = [
  { path: lastEls([ '_events', 'request' ])
  , key: 'request'
  , level: spok.ge(2)
  , info: {
        file: spok.endsWith('http-one-connection.server.js')
      , line: spok.gtz
      , column: spok.gtz
      , inferredName: ''
      , name: 'onrequest' }
  , id: spok.gtz
  , arguments: null }
  , { path: lastEls([ '_events', 'error' ])
    , key: 'error'
    , level: spok.ge(2)
    , info: {
          file: spok.endsWith('http-one-connection.server.js')
        , line: spok.gtz
        , column: spok.gtz
        , inferredName: ''
        , name: 'onerror' }
    , id: spok.gtz
    , arguments: null }
  , { path: lastEls([ '_events', 'listening' ])
    , key: 'listening'
    , level: spok.ge(2)
    , info: {
          file: spok.endsWith('http-one-connection.server.js')
        , line: spok.gtz
        , column: spok.gtz
        , inferredName: ''
        , name: 'onlistening' }
    , id: spok.gtz
    , arguments: null } ]
userFunctions.$topic = 'user functions'

const BUFFERLENGTH = 100
const STRINGLENGTH = 100
const NetworkActivityCollector = require('../')

let port
const collector = new NetworkActivityCollector({
    start            : process.hrtime()
  , captureArguments : true
  , captureSource    : false
  , bufferLength     : BUFFERLENGTH
  , stringLength     : STRINGLENGTH
}).enable()

test('\none http server with shutdown route that is called by external client immediately', function(t) {
  const server = http.createServer()
  server
    .on('request', onrequest)
    .on('error', onerror)
    .on('listening', onlistening)
    .listen()

  function serveShutdown(res) {
    res.writeHead(200)
    res.end()
    server.close(onclosed)
  }

  function onrequest(req, res) {
    if (req.url === '/shutdown') return serveShutdown(res)

    res.writeHead(404)
    res.end()
  }

  function onerror(err) { console.error(err) }
  function onlistening() {
    port = server.address().port
    exec(`node -e 'require("http").get("http://localhost:${port}/shutdown")'`)
  }

  function onclosed() {
    tick(2, () => {
      collector
        .disable()
        .cleanAllResources()
        .processStacks()

      // save('http-one-connection.server', Array.from(collector.networkActivities), { json: true })
      // save('http-one-connection.server.all', Array.from(collector.activities), { json: true })
      runTest(collector.networkActivities)
    })
  }

  function runTest(activities) {
    const values = activities.values()
    const server = values.next().value
    spok(t, server,
      { id: spok.number
      , type: 'TCPWRAP'
      , triggerId: spok.number
      , init: spok.arrayElements(1)
      , initStack: spok.arrayElements(5)
      , resource:
        { owner:
          { domain: null
          , _events: { type: 'object', proto: null, val: '<deleted>' }
          , _eventsCount: spok.gtz
          , _connections: 1
          , _asyncId: spok.number
          , _handle:
              { bytesRead: 0
              , _externalStream: { type: 'object', proto: null, val: '<deleted>' }
              , fd: spok.gtz
              , reading: false
              , owner: { type: 'object', proto: 'Server', val: '<deleted>' }
              , onread: null
              , onconnection: { type: 'function', proto: null, val: '<deleted>' }
              , writeQueueSize: spok.number
              , proto: 'TCP' }
          , _slaves: { type: 'object', proto: 'Array', val: '<deleted>' }
          , _unref: false
          , allowHalfOpen: true
          , pauseOnConnect: false
          , httpAllowHalfOpen: false
          , timeout: spok.number
          , _connectionKey: { type: 'string', len: 6, included: 6, val: '6::::0' }
          , proto: 'Server'
          , server: spok.notDefined }
        }
      , before: spok.arrayElements(1)
      , beforeStacks: spok.arrayElements(1)
      , after: spok.arrayElements(1)
      , afterStacks: spok.arrayElements(1)
      , destroy: spok.arrayElements(1)
      , destroyStack: spok.arrayElements(0) })

    spok(t, filterSortFunctions(server.resource.functions), userFunctions)

    // Next few are the pipewrap we pick up, but they are of the child process
    // we created for the client, so we'll ignore it.
    // Could be argued that we should filter them out here, but we'd have to
    // look at the stacktrace to determine if a pipewrap is related to net or
    // a child process. Therefore we'll leave that to the processors.
    let val
    while (val == null || val.type === 'PIPEWRAP') {
      val = values.next().value
    }

    // Here we encounter a very similar listen tcp to the first one.
    // It is the socket triggered by the server one and has no init stack trace.
    const socket = val
    spok(t, socket,
      { id: spok.number
      , type: 'TCPWRAP'
      , triggerId: server.id
      , init: spok.arrayElements(1)
      , initStack: []
      , resource:
        { owner:
          { connecting: false
          , _asyncId: spok.number
          , _hadError: false
          , _handle: null
          , _parent: null
          , _host: null
          , _readableState: { type: 'object', proto: 'ReadableState', val: '<deleted>' }
          , readable: false
          , domain: null
          , _events: { type: 'object', proto: null, val: '<deleted>' }
          , _eventsCount: spok.ge(5)
          , _writableState: { type: 'object', proto: 'WritableState', val: '<deleted>' }
          , writable: false
          , allowHalfOpen: true
          , destroyed: true
          , _bytesDispatched: spok.number
          , _sockname: null
          , _pendingData: null
          , _pendingEncoding: { type: 'string', len: 0, included: 0, val: '' }
          , server:
              { domain: null
              , _events: { type: 'object', proto: null, val: '<deleted>' }
              , _eventsCount: spok.ge(4)
              , _connections: 0
              , _asyncId: server.id
              , _handle: null
              , _usingSlaves: false
              , _slaves: { type: 'object', proto: 'Array', val: '<deleted>' }
              , _unref: false
              , allowHalfOpen: true
              , pauseOnConnect: false
              , httpAllowHalfOpen: false
              , timeout: spok.number
              , _pendingResponseData: 0
              , maxHeadersCount: null
              , _connectionKey: { type: 'string', len: 6, included: 6, val: '6::::0' }
              , proto: 'Server' }
          , _server: { type: 'object', proto: 'Server', val: '<deleted>' }
          , parser: null
          , on: { type: 'function', proto: null, val: '<deleted>' }
          , _paused: false
          , read: { type: 'function', proto: null, val: '<deleted>' }
          , _consuming: true
          , proto: 'Socket' } }
      , before: spok.arrayElements(1)
      , beforeStacks: spok.arrayElements(1)
      , after: spok.arrayElements(1)
      , afterStacks: spok.arrayElements(1)
      , destroy: spok.arrayElements(1)
      , destroyStack: spok.arrayElements(0) })

    spok(t, filterSortFunctions(socket.resource.functions), userFunctions)

    // Following we see two http parser resources. Both stack traces just point to core
    // The first one has no info at all, it also has only an init which makes me think
    // it might be some sort of resource only there to create other http parsers.
    // The second http parser has all the info we are looking for.
    const parser1 = values.next().value
    spok(t, parser1,
      { $topic: 'http parser 1'
      , id: spok.gtz
      , type: 'HTTPPARSER'
      , triggerId: server.id
      , init: spok.arrayElements(1)
      , initStack: spok.arrayElements(5)
      , resource: null
      , before: spok.notDefined
      , beforeStacks: spok.notDefined
      , after: spok.notDefined
      , afterStacks: spok.notDefined
      , destroy: spok.notDefined
      , destroyStack: spok.notDefined
    })

    const parser2 = values.next().value
    spok(t, parser2,
      { $topic: 'http parser 1'
      , id: spok.number
      , type: 'HTTPPARSER'
      , triggerId: server.id
      , init: spok.arrayElements(1)
      , initStack: spok.arrayElements(4)
      , resource:
        { socket:
          { connecting: false
          , _asyncId: spok.number
          , _hadError: false
          , _handle: { type: 'object', proto: 'TCP', val: '<deleted>' }
          , _parent: null
          , _host: null
          , _readableState: { type: 'object', proto: 'ReadableState', val: '<deleted>' }
          , readable: true
          , domain: null
          , _events: { type: 'object', proto: null, val: '<deleted>' }
          , _eventsCount: spok.gt(5)
          , _writableState: { type: 'object', proto: 'WritableState', val: '<deleted>' }
          , writable: true
          , allowHalfOpen: true
          , destroyed: false
          , _bytesDispatched: 108
          , _pendingEncoding: { type: 'string', len: 0, included: 0, val: '' }
          , server:
              { domain: null
              , _events: { type: 'object', proto: null, val: '<deleted>' }
              , _eventsCount: spok.ge(5)
              , _connections: 1
              , _asyncId: server.id
              , _handle: null
              , _usingSlaves: false
              , _slaves: { type: 'object', proto: 'Array', val: '<deleted>' }
              , _unref: false
              , allowHalfOpen: true
              , pauseOnConnect: false
              , httpAllowHalfOpen: false
              , timeout: spok.number
              , maxHeadersCount: null
              , _connectionKey: { type: 'string', len: 6, included: 6, val: '6::::0' }
              , proto: 'Server' }
          , _server: { type: 'object', proto: 'Server', val: '<deleted>' }
          , _idleTimeout: spok.gtz
          , _idleNext: { type: 'object', proto: 'TimersList', val: '<deleted>' }
          , _idlePrev: { type: 'object', proto: 'TimersList', val: '<deleted>' }
          , _idleStart: spok.gtz
          , parser: { type: 'object', proto: 'HTTPParser', val: '<deleted>' }
          , on: { type: 'function', proto: null, val: '<deleted>' }
          , _paused: false
          , read: { type: 'function', proto: null, val: '<deleted>' }
          , _consuming: true
          , _httpMessage:
              { _events: { type: 'object', proto: null, val: '<deleted>' }
              , output: { type: 'object', proto: 'Array', val: '<deleted>' }
              , outputEncodings: { type: 'object', proto: 'Array', val: '<deleted>' }
              , outputCallbacks: { type: 'object', proto: 'Array', val: '<deleted>' }
              , outputSize: 0
              , writable: true
              , _last: true
              , upgrading: false
              , chunkedEncoding: true
              , shouldKeepAlive: false
              , useChunkedEncodingByDefault: true
              , sendDate: true
              , _removedConnection: false
              , _removedContLen: false
              , _removedTE: false
              , _contentLength: null
              , _hasBody: true
              , _trailer: { type: 'string', len: 0, included: 0, val: '' }
              , finished: true
              , _headerSent: true
              , socket: { type: 'object', proto: 'Socket', val: '<deleted>' }
              , connection: { type: 'object', proto: 'Socket', val: '<deleted>' }
              , _header:
                { type: 'string'
                , len: 103
                , included: 100
                , val: spok.startsWith('HTTP/1.1 200 OK\r\nDate:') }
              , _onPendingData: { type: 'function', proto: null, val: '<deleted>' }
              , _sent100: false
              , _expect_continue: false
              , statusMessage: { type: 'string', len: 2, included: 2, val: 'OK' }
              , statusCode: 200
              , proto: 'ServerResponse' }
          , proto: 'Socket' }
        , incoming:
          { _readableState: { type: 'object', proto: 'ReadableState', val: '<deleted>' }
          , readable: true
          , domain: null
          , _events: { type: 'object', proto: null, val: '<deleted>' }
          , _eventsCount: 0
          , socket: { type: 'object', proto: 'Socket', val: '<deleted>' }
          , connection: { type: 'object', proto: 'Socket', val: '<deleted>' }
          , httpVersionMajor: 1
          , httpVersionMinor: 1
          , httpVersion: { type: 'string', len: 3, included: 3, val: '1.1' }
          , complete: false
          , headers:
              { host: { type: 'string', len: 15, included: 15, val: 'localhost:' + port }
              , connection: { type: 'string', len: 5, included: 5, val: 'close' }
              , proto: 'Object' }
          , rawHeaders: { type: 'object', proto: 'Array', val: '<deleted>' }
          , trailers: { type: 'object', proto: 'Object', val: '<deleted>' }
          , rawTrailers: { type: 'object', proto: 'Array', val: '<deleted>' }
          , upgrade: false
          , url: { type: 'string', len: 9, included: 9, val: '/shutdown' }
          , method: { type: 'string', len: 3, included: 3, val: 'GET' }
          , statusCode: null
          , statusMessage: null
          , client: { type: 'object', proto: 'Socket', val: '<deleted>' }
          , _consuming: false
          , _dumped: false
          , proto: 'IncomingMessage' } }
      , before: spok.arrayElements(3)
      , beforeStacks: spok.arrayElements(3)
      , after: spok.arrayElements(3)
      , afterStacks: spok.arrayElements(3)
      , destroy: spok.arrayElements(1)
      , destroyStack: spok.arrayElements(0)
    })

    spok(t, filterSortFunctions(parser2.resource.functions), userFunctions)

    const shutdown = values.next().value
    spok(t, shutdown,
      { $topic: 'shutdown'
      , id: spok.number
      , type: 'SHUTDOWNWRAP'
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
