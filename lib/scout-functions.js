const functionScout = require('function-scout')

module.exports = function scoutFunctions(
    ctx
  , uid
  , { captureSource, captureArguments, cloner, name = null }) {
  const capture = captureArguments || captureSource
  const { functions }  = functionScout(ctx, { referenceFunction: capture })

  function adjustInfo(info) {
    // Point out to the user that these were attached to a specific property
    // of an activity with a specific id
    if (name !== null) info.path.unshift(name)
    info.id = uid

    if (!capture) return

    // attach extra info if so required
    const fn = info.info && info.info.function
    if (fn == null) return

    try {
      info.arguments = cloner.clone(fn.arguments)
    } catch (e) {
      // We aren't allowed to access function arguments, if they
      // were created in 'use strict' mode. This affects all core functions.
      info.arguments = '<Inaccessible>'
    }
    if (this._captureSource) info.source = fn.toString()

    // Make sure we loose the function reference
    // Is delete expensive here? Not passing this into a function,
    // so the Object Map isn't that important.
    // Assigning to undefined is alternative, but clutters return value.
    delete info.info.function
  }

  functions.forEach(adjustInfo, this)
  return functions
}

