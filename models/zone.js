var Model = require('./model')

var Zone = Model.extend({

  attributes: {
    name: undefined,
    description: undefined,
    geom: undefined
  }

})

module.exports = Zone
