var utils = require( process.cwd() + '/utils')

var ATTRIBUTES = [ 'foo' ]

var Rule = function (attributes) {

  if (typeof(attributes) !== 'undefined' && typeof(attributes) !== 'object') {
    throw("'attributes' must be an instance of 'object'") 
  }

  for (key in attributes) {
    if (utils.includes.call(ATTRIBUTES, key)) {
      this[key] = attributes[key]
    }
  }

}

module.exports = Rule
