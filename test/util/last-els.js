module.exports = function lastEls(els) {
  return function(arr) {
    while (true) {
      const actual = arr.pop()
      const expected = els.pop()
      if (expected == null) return true
      if (actual !== expected) return false
    }
  }
}

