var utils = require( process.cwd() + '/lib/utils')

var ATTRIBUTES = [ 'name', 'description', 'geom' ]

var Zone = function (attributes) {

  if (typeof(attributes) !== 'undefined' && typeof(attributes) !== 'object') {
    throw("'attributes' must be an instance of 'object'") 
  }

  for (key in attributes) {
    if (utils.includes.call(ATTRIBUTES, key)) {
      this[key] = attributes[key]
    }
  }

}

module.exports = Zone
