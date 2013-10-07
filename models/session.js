var DBModel = require('./db_model');

var Session = DBModel.extend({

  defaults: {
    'category_id': undefined,
    'use_modifier_ids': [],
    'parcel_id': undefined
  }

}, {

  table: 'sessions'

});

module.exports = Session;
