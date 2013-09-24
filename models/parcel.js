var DBModel = require('./db_model');

var Parcel = DBModel.extend({

  defaults: {
    'id': undefined,
    'code': undefined,
    'zone_ids': undefined
  }

}, {

  table: 'parcels'

});


module.exports = Parcel
