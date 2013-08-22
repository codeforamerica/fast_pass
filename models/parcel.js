var utils = require( process.cwd() + '/utils')

var ATTRIBUTES = []

var Parcel = function (attributes) {

  if (typof(attributes) !== 'object') {
    throw("'attributes' must be an instance of 'object'") 
  }

  for (key in attributes) {
    if (utils.includes.call(ATTRIBUTES, key)) {
      this[key] = attributes[key]
    }
  }

}

module.exports = Parcel
