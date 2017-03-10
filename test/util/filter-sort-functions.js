module.exports = function filterSortFunctions(fns) {
  function filterCore(fn) {
    if (fn.arguments === '<Inaccessible>') return false
    return true
  }
  function byLine(a, b) {
    return a.info.line < b.info.line ? -1 : 1
  }
  const filtered = fns.filter(filterCore).sort(byLine)
  return filtered
}

