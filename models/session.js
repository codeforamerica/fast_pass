var DBModel = require('./db_model');

var Session = DBModel.extend({

  defaults: {
    'category_code': undefined,
    'parcel_code': undefined,
    'zone_code': undefined
  }

}, {

  table: 'sessions'

});

module.exports = Session;
