var DBModel = require('./db_model');

var Parcel = DBModel.extend({
  defaults: {
    id: null,
    data: null,
    geom: null
  }
}, {
  table: 'parcels'
});


module.exports = Parcel
