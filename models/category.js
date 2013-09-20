var Model = require('./model');

var Category = Model.extend({

  attributes: {
    'id': undefined,
    'code': undefined,
    'title': undefined,
    'description': undefined,
    'type': undefined,
    'related_category_ids': undefined
  },

  equal: function (other) {
    return other.get('code') == this.get('code');
  }

}, {

  table: 'categories'

})

module.exports = Category
