var Model = require('./model')

var UseModifier = Model.extend({

  attributes: {
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
