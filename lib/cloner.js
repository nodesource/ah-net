const facileClone = require('facile-clone')
class Cloner {
  constructor({ bufferLength, stringLength }) {
    this._bufferLength = bufferLength
    this._stringLength = stringLength
  }

  clone(x) {
    if (x == null) return x
    return facileClone(
        x
      , { bufferLength: this._bufferLength, stringLength: this._stringLength }
    )
  }
}

module.exports = Cloner
