var indexOf = module.exports.indexOf = function (item) {

  if (typeof Array.prototype.indexOf === 'function') {
    indexOf = Array.prototype.indexOf 
  } else {
    indexOf = function (item) {
      var i = -1, index = -1 

      for (i = 0; i < this.length; i++) {
        if (this[i] === item) {
          index = i
          break
        }
      }

      return index;
    } 
  }

  return indexOf.call(this, item)
}

var includes = module.exports.includes = function (item) {
  return (indexOf.call(this, item) !== -1)
}
