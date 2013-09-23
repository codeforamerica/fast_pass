var DBModel = require('./db_model')

var UseModifier = DBModel.extend({

  defaults: {
    'id': undefined,
    'title': undefined,
    'description': undefined,
    'question': undefined,
    'category_ids': undefined
  }

}, {

  table: 'use_modifiers'

})

module.exports = UseModifier
