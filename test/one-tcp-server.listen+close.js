const NetworkActivityCollector = require('../')
const net = require('net')
const save = require('./util/save')
const BUFFERLENGTH = 18

// eslint-disable-next-line no-unused-vars
function inspect(obj, depth) {
  console.error(require('util').inspect(obj, false, depth || 5, true))
}

const collector = new NetworkActivityCollector({
    start            : process.hrtime()
  , captureArguments : true
  , captureSource    : false
  , bufferLength     : BUFFERLENGTH
}).enable()

const server = net.createServer()
server
  .on('connection', onconnection)
  .on('error', onerror)
  .on('listening', onlistening)
  .listen()

function onconnection(socket) { }
function onerror(err) { console.error(err) }
function onlistening() {
  server.close(onclosed)
}

function onclosed() {
  collector
    .disable()
    .cleanAllResources()
    .processStacks()
  const activities = collector.networkActivities
  save('one-server.listening', Array.from(activities), { inspect: true })
}
