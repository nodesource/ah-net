class ResourceProcessor {
  constructor({ cloner, captureArguments, captureSource }) {
    this._cloner = cloner
    this._processed = new Set()
    this._captureArguments = captureArguments
    this._captureSource = captureSource
  }

  cleanAllResources(activities, { collectFunctionInfo = false }) {
    for (const [ uid, h ] of activities) {
      this.cleanupResource(h, uid, activities, { collectFunctionInfo })
    }
  }

  cleanupResource(h, uid, activities, { collectFunctionInfo }) {
    if (h == null) return
    if (this._processed.has(uid)) return
    const activity = activities.get(uid)
    const processed = this._processResource(uid, activity.resource, { collectFunctionInfo })
    activity.resource = processed
    this._processed.add(uid)
  }

  // @abstract
  _processResource(uid, resource, { collectFunctionInfo }) {
    throw new Error('Not Implemented: _processResource')
  }
}

module.exports = ResourceProcessor
