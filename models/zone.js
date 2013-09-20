var Model = require('./model')

var Zone = Model.extend({

  attributes: {
    'name': undefined,
    'description': undefined,
    'geom': undefined,
    'code': undefined
  },

  equal: function (other) {
    return this.get('code') == other.get('code')
  }

})

module.exports = Zone
