module.exports = function filterSortFunctions(fns) {
  function filterCore(fn) {
    if (fn.arguments === '<Inaccessible>') return false
    return true
  }
  function byLine(a, b) {
    return a.info.line < b.info.line ? -1 : 1
  }
  const filtered = fns.filter(filterCore)

  const dedupedByLoation = new Map()
  for (let i = 0; i < filtered.length; i++) {
    const fn = filtered[i]
    const loc = fn.info.file + ':' + fn.info.line
    if (!dedupedByLoation.has(loc)) dedupedByLoation.set(loc, fn)
  }

  return Array.from(dedupedByLoation.values()).sort(byLine)
}
