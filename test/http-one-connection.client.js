const http = require('http')
const test = require('tape')
const tick = require('./util/tick')
const spok = require('spok')
const devNull = require('dev-null')
const filterSortFunctions = require('./util/filter-sort-functions')
const userFunctions = require('./common/http-one-connection.client.user-functions')

/* eslint-disable no-unused-vars */
const ocat = require('./util/ocat')
const save = require('./util/save')
/* eslint-enable no-unused-vars */

const BUFFERLENGTH = 60
const STRINGLENGTH = 60
const NetworkActivityCollector = require('../')

const collector = new NetworkActivityCollector({
    start            : process.hrtime()
  , captureArguments : true
  , captureSource    : false
  , bufferLength     : BUFFERLENGTH
  , stringLength     : STRINGLENGTH
}).enable()

test('\none client performing an http request that does shutdown', function(t) {
 const client = http.get('http://google.com')
  client
    .on('connect', onconnect)
    .on('error', onerror)
    .on('response', onresponse)

  function onconnect() {}
  function onerror(err) { console.error(err) }
  function onresponse(res) {
    res.pipe(devNull()).on('finish', onend)
  }

  function onend() {
    tick(3, () => {
      collector
        .disable()
        .cleanAllResources()
        .processStacks()

      // save('http-one-connection.client', Array.from(collector.networkActivities), { json: true })
      // save('http-one-connection.client.all', Array.from(collector.activities), { json: true })
      runTest(collector.networkActivities)
    })
  }

  function runTest(activities) {
    const values = activities.values()
    const socket = values.next().value

    spok(t, socket,
      { $topic: 'socket'
      , id: spok.gtz
      , type: 'TCPWRAP'
      , triggerId: spok.gtz
      , init: spok.arrayElements(1)
      , initStack: spok.arrayElementsRange(5, 6)
        , resource:
          { owner:
            { connecting: false
            , _hadError: false
            , _handle:
                { bytesRead: spok.gt(200)
                , _externalStream: { type: 'object', proto: null, val: '<deleted>' }
                , fd: spok.gtz
                , reading: true
                , owner: { type: 'object', proto: 'Socket', val: '<deleted>' }
                , onread: { type: 'function', proto: null, val: '<deleted>' }
                , onconnection: null
                , writeQueueSize: spok.gez
                , proto: 'TCP' }
            , _parent: null
            , _host: { type: 'string', len: 10, included: 10, val: 'google.com' }
            , _readableState: { type: 'object', proto: 'ReadableState', val: '<deleted>' }
            , readable: true
            , domain: null
            , _events: { type: 'object', proto: null, val: '<deleted>' }
            , _eventsCount: spok.ge(2)
            , _writableState: { type: 'object', proto: 'WritableState', val: '<deleted>' }
            , writable: true
            , allowHalfOpen: false
            , _bytesDispatched: spok.gtz
            , _sockname: null
            , _pendingData: null
            , _pendingEncoding: { type: 'string', len: 0, included: 0, val: '' }
            , server: null
            , _httpMessage: { type: 'object', proto: 'ClientRequest', val: '<deleted>' }
            , read: { type: 'function', proto: null, val: '<deleted>' }
            , _consuming: true
            , proto: 'Socket' } }
      , before: spok.arrayElements(2)
      , beforeStacks: spok.arrayElements(2)
      , after: spok.arrayElements(2)
      , afterStacks: spok.arrayElements(2)
      , destroy: spok.arrayElements(1)
      , destroyStack: spok.arrayElements(0) })

    spok(t, filterSortFunctions(socket.resource.functions), userFunctions)

    const addrinfo = values.next().value
    spok(t, addrinfo,
      { $topic: 'addrinfo'
      , id: spok.gtz
      , type: 'GETADDRINFOREQWRAP'
      , triggerId: socket.id
      , init: spok.arrayElements(1)
      , initStack: spok.arrayElementsRange(5, 6)
      , resource: null
      , before: spok.arrayElements(1)
      , beforeStacks: spok.arrayElements(1)
      , after: spok.arrayElements(1)
      , afterStacks: spok.arrayElements(1)
      , destroy: spok.arrayElements(1)
      , destroyStack: spok.arrayElements(0) })

    // Here we see two http parsers as well with the second one holding all the info.
    // This is no different than what we saw for the server:
    //  ./http-one-connection.server.js

    const parser1 = values.next().value
    spok(t, parser1,
      { $topic: 'http parser 1'
      , id: spok.gtz
      , type: 'HTTPPARSER'
      , triggerId: spok.gtz
      , init: spok.arrayElements(1)
      , initStack: spok.arrayElementsRange(5, 6)
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
      { $topic: 'http parser 2'
      , id: spok.gtz
      , type: 'HTTPPARSER'
      , triggerId: spok.gtz
      , init: spok.arrayElements(1)
      , initStack: spok.arrayElementsRange(3, 4)
      , resource:
        { socket:
           { connecting: false
           , _hadError: false
           , _handle: { type: 'object', proto: 'TCP', val: '<deleted>' }
           , _parent: null
           , _host: { type: 'string', len: 10, included: 10, val: 'google.com' }
           , _readableState: { type: 'object', proto: 'ReadableState', val: '<deleted>' }
           , readable: true
           , _events: { type: 'object', proto: null, val: '<deleted>' }
           , _eventsCount: spok.ge(2)
           , _writableState: { type: 'object', proto: 'WritableState', val: '<deleted>' }
           , writable: true
           , allowHalfOpen: false
           , _bytesDispatched: spok.gtz
           , _sockname: null
           , _pendingData: null
           , _pendingEncoding: { type: 'string', len: 0, included: 0, val: '' }
           , server: null
           , _server: null
           , parser: { type: 'object', proto: 'HTTPParser', val: '<deleted>' }
           , _httpMessage:
              { domain: null
              , _events: { type: 'object', proto: null, val: '<deleted>' }
              , _eventsCount: spok.ge(2)
              , output: { type: 'object', proto: 'Array', val: '<deleted>' }
              , outputEncodings: { type: 'object', proto: 'Array', val: '<deleted>' }
              , outputCallbacks: { type: 'object', proto: 'Array', val: '<deleted>' }
              , outputSize: 0
              , writable: true
              , _last: true
              , upgrading: false
              , chunkedEncoding: false
              , shouldKeepAlive: false
              , useChunkedEncodingByDefault: false
              , sendDate: false
              , _removedConnection: false
              , _removedContLen: false
              , _removedTE: false
              , _contentLength: 0
              , _hasBody: true
              , _trailer: { type: 'string', len: 0, included: 0, val: '' }
              , finished: true
              , _headerSent: true
              , socket: { type: 'object', proto: 'Socket', val: '<deleted>' }
              , connection: { type: 'object', proto: 'Socket', val: '<deleted>' }
              , _header:
                 { type: 'string'
                 , len: 55
                 , included: 55
                 , val: 'GET / HTTP/1.1\r\nHost: google.com\r\nConnection: close\r\n\r\n' }
              , agent: { type: 'object', proto: 'Agent', val: '<deleted>' }
              , method: { type: 'string', len: 3, included: 3, val: 'GET' }
              , path: { type: 'string', len: 1, included: 1, val: '/' }
              , _ended: false
              , res: { type: 'object', proto: 'IncomingMessage', val: '<deleted>' }
              , timeoutCb: null
              , upgradeOrConnect: false
              , parser: { type: 'object', proto: 'HTTPParser', val: '<deleted>' }
              , maxHeadersCount: null
              , proto: 'ClientRequest' }
           , read: { type: 'function', proto: null, val: '<deleted>' }
           , _consuming: true
           , proto: 'Socket' }
        , incoming:
           { _readableState: { type: 'object', proto: 'ReadableState', val: '<deleted>' }
           , readable: true
           , _events: { type: 'object', proto: null, val: '<deleted>' }
           , _eventsCount: spok.ge(1)
           , socket: { type: 'object', proto: 'Socket', val: '<deleted>' }
           , connection: { type: 'object', proto: 'Socket', val: '<deleted>' }
           , httpVersionMajor: 1
           , httpVersionMinor: 1
           , httpVersion: { type: 'string', len: 3, included: 3, val: '1.1' }
           , complete: false
           , headers:
              { 'cache-control': { type: 'string', len: 7, included: 7, val: 'private' }
              , 'content-type':
                 { type: 'string'
                 , len: 24
                 , included: 24
                 , val: 'text/html; charset=UTF-8' }
              , location:
                 { type: 'string'
                 , len: spok.gt(30)
                 , included: spok.gt(30)
                 , val: spok.startsWith('http://www.google') }
              , 'content-length': { type: 'string', len: 3, included: 3, val: spok.string }
              , date:
                 { type: 'string'
                 , len: 29
                 , included: 29
                 , val: spok.string }
              , connection: { type: 'string', len: 5, included: 5, val: 'close' }
              , proto: 'Object' }
           , rawHeaders: { type: 'object', proto: 'Array', val: '<deleted>' }
           , trailers: { type: 'object', proto: 'Object', val: '<deleted>' }
           , rawTrailers: { type: 'object', proto: 'Array', val: '<deleted>' }
           , upgrade: false
           , url: { type: 'string', len: 0, included: 0, val: '' }
           , method: null
           , statusCode: 302
           , statusMessage: { type: 'string', len: 5, included: 5, val: 'Found' }
           , client: { type: 'object', proto: 'Socket', val: '<deleted>' }
           , _consuming: false
           , _dumped: false
           , req: { type: 'object', proto: 'ClientRequest', val: '<deleted>' }
           , proto: 'IncomingMessage' } }
      , before: spok.arrayElements(3)
      , beforeStacks: spok.arrayElements(3)
      , after: spok.arrayElements(3)
      , afterStacks: spok.arrayElements(3)
      , destroy: spok.arrayElements(1)
      , destroyStack: spok.arrayElements(0) })

    spok(t, filterSortFunctions(parser2.resource.functions), userFunctions)

    const connect = values.next().value
    spok(t, connect,
      { $topic: 'connect'
      , id: spok.gtz
      , type: 'TCPCONNECTWRAP'
      , triggerId: socket.id
      , init: spok.arrayElements(1)
      , initStack: spok.arrayElementsRange(3, 4)
      , resource: null
      , before: spok.arrayElements(1)
      , beforeStacks: spok.arrayElements(1)
      , after: spok.arrayElements(1)
      , afterStacks: spok.arrayElements(1)
      , destroy: spok.arrayElements(1)
      , destroyStack: spok.arrayElements(0)
    })

    const shutdown = values.next().value
    spok(t, shutdown,
      { $topic: 'shutdown'
      , id: spok.gtz
      , type: 'SHUTDOWNWRAP'
      , triggerId: socket.id
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
