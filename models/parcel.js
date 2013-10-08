var DBModel = require('./db_model');

var Parcel = DBModel.extend({

  defaults: {
    'code': undefined,
    'zone_ids': undefined
  }

}, {

  table: 'parcels'

});


module.exports = Parcel
