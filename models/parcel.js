var Model = require('./model');

var Parcel = Model.extend({
  attributes: {
    code: undefined,
    zone_codes: undefined
  }
}, {
  table: 'parcels'
});


module.exports = Parcel
