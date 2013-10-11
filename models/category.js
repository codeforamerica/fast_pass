var DBModel = require('./db_model');

var Category = DBModel.extend({

  defaults: {
    'code': undefined,
    'title': undefined,
    'description': undefined,
    'type': undefined
  }

}, {

  table: 'categories'

})

module.exports = Category
