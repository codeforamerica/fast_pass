var DBModel = require('./db_model');

var Category = DBModel.extend({

  defaults: {
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
