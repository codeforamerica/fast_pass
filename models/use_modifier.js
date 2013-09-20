var Model = require('./model')

var UseModifier = Model.extend({
  attributes: {
    'title': undefined,
    'description': undefined,
    'prompt': undefined
  }
}, {
  table: 'use_modifiers'
})

module.exports = UseModifier
