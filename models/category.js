var DBModel = require('./db_model');

var Category = DBModel.extend({

  defaults: {
    'code': undefined,
    'title': undefined,
    'description': undefined,
    'type': undefined
  },

  equal: function (other) {
    return other.get('id') == this.get('id');
  }

}, {

  table: 'categories'

})

module.exports = Category
