const { scoutFunctions, ResourceProcessor } = require('ah-preprocessors')

/* eslint-disable no-unused-vars */
const save = require('../test/util/save')
const util = require('util')
const print = obj => process._rawDebug(util.inspect(obj, true, 100, true))
/* eslint-enable no-unused-vars */

/**
 * HTTPARSER has tons of properties attached to it.
 * Below is a condensed outline of the ones that are most relevant.
 *
 * ```
 * {
 *    socket: {
 *      _httpMessage {
 *            _header
 *          , statusMessage
 *          , statusCode
 *          , _headerSent
 *          , finished
 *            ...
 *       }
 *     , _handle: { fd, reading }
 *     , server: { _connectionKey }
 *   }
 *  , incoming {
 *      httpVersion*
 *    , headers: { host, connection }
 *    , upgrade
 *    , url
 *    , method
 *    , statusCode
 *    , statusMessage
 *   }
 * }
 * ```
 */
class NetworkResourceProcessor extends ResourceProcessor {
  // @override
  _processResource(uid, resource, { collectFunctionInfo }) {
    if (resource == null) return null

    const { owner, ownerFunctions } =  resource.owner != null
      ? this._processOwner(uid, resource, { collectFunctionInfo })
      : { owner: null, ownerFunctions: null }

    const { socket, socketFunctions } = resource.socket != null
      ? this._processSocket(uid, resource, { collectFunctionInfo })
      : { socket: null, socketFunctions: null }

    const { incoming, incomingFunctions } = resource.incoming != null
      ? this._processIncoming(uid, resource, { collectFunctionInfo })
      : { incoming: null, incomingFunctions: null }

    if (owner == null && socket == null && incoming == null) return null

    let res = { functions: [] }
    if (owner != null) {
      res.owner = owner
      res.functions = res.functions.concat(ownerFunctions)
    }

    if (socket != null) {
      res.socket = socket
      res.functions = res.functions.concat(socketFunctions)
    }

    if (incoming != null) {
      res.incoming = incoming
      res.functions = res.functions.concat(incomingFunctions)
    }

    return res
  }

  _processOwner(uid, resource, { collectFunctionInfo }) {
    const owner = this._cloner.clone(resource.owner)
    const ownerFunctions = scoutFunctions(
        resource.owner
      , uid
      , { captureArguments: this._captureArguments
        , captureSource: this._captureSource
        , name: 'owner'
        , cloner: this._cloner
        }
      )

    // The server is attached to the owner of a connection socket
    // It is the server that is serving that connection.
    // We mainly need it to glean the connection key from in order
    // to be able to link connections to the server.listen resources.
    if (resource.owner.server !==  null) {
      owner.server = this._cloner.clone(resource.owner.server)
    }

    if (resource.owner._handle !==  null) {
      owner._handle = this._cloner.clone(resource.owner._handle)
    }

    return { owner, ownerFunctions }
  }

  _processSocket(uid, resource, { collectFunctionInfo }) {
    // A socket is present for some resources, like HTTP Parser.
    // We can get a lot of info off the socket, including the _asyncId which
    // may help to group the parser resource with the related connection.
    const socket = this._cloner.clone(resource.socket)

    // We omit a bunch of info like _readableState and _writableState
    // as that is only relevant to core functionality (at least for now).
    // However the server gives us some interesting info, like the timeout and
    // connectionKey.
    if (resource.socket.server !==  null) {
      socket.server = this._cloner.clone(resource.socket.server)
    }

    // The _httpMessage (which is the server response) has a lot more interesting
    // info. Especially the response _header and statusCode are important here.
    if (resource.socket._httpMessage !==  null) {
      socket._httpMessage = this._cloner.clone(resource.socket._httpMessage)
    }

    const socketFunctions = scoutFunctions(
        resource.socket
      , uid
      , { captureArguments: this._captureArguments
        , captureSource: this._captureSource
        , name: 'socket'
        , cloner: this._cloner
        }
    )

    return { socket, socketFunctions }
  }

  _processIncoming(uid, resource, { collectFunctionInfo }) {
    const incoming = this._cloner.clone(resource.incoming)

    if (resource.incoming.headers !==  null) {
      incoming.headers = this._cloner.clone(resource.incoming.headers)
    }

    const incomingFunctions = scoutFunctions(
        resource.incoming
      , uid
      , { captureArguments: this._captureArguments
        , captureSource: this._captureSource
        , name: 'incoming'
        , cloner: this._cloner
        }
    )

    return { incoming, incomingFunctions }
  }
}

module.exports = NetworkResourceProcessor
