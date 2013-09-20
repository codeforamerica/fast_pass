var Model = require('./model');

var BusinessCategory = Model.extend({

  attributes: {
    code: undefined,
    title: undefined,
    description: undefined,
    type: undefined
  },

  equal: function (other) {
    return other.get('code') == this.get('code');
  }

})

module.exports = BusinessCategory
