var Model = require('./model')

var Session = Model.extend({

  attributes: {
    'id': undefined,
    'category_ids': undefined,
    'use_modifier_ids': undefined,
    'parcel_id': undefined
  }

}, {

  table: 'sessions'

})

module.exports = Parcel
