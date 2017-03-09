const fs = require('fs')
const path = require('path')
const stringify = require('json-stringify-safe')

function inspect(obj, depth) {
  return require('util').inspect(obj, false, depth || 55, false)
}

module.exports = function save(name, obj, { json = false }) {
  if (json) {
    const file = path.join(__dirname, '..', 'tmp', name + '.json')
    fs.writeFileSync(file, stringify(obj, null, 2), 'utf8')
    console.log('saved to ' + file)
  } else {
    const file = path.join(__dirname, '..', 'tmp', name + '.js')
    fs.writeFileSync(file, inspect(obj), 'utf8')
    console.log('saved to ' + file)
  }
}
