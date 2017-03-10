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

    return { owner, functions }
  }
}

module.exports = NetworkResourceProcessor
