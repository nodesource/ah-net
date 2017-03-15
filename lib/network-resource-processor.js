const { scoutFunctions, ResourceProcessor } = require('ah-preprocessors')

class NetworkResourceProcessor extends ResourceProcessor {
  // @override
  _processResource(uid, resource, { collectFunctionInfo }) {
    if (resource == null) return null

    // The server is attached as `owner` to the TCPWRAP resource.
    // It is also the first in args array of related tick objects, but since
    // those contain no more info, we ignore them.

    if (resource.owner == null) return null
    const owner = this._cloner.clone(resource.owner)
    const functions = scoutFunctions(
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
    return { owner, functions }
  }
}

module.exports = NetworkResourceProcessor
