var Model = require('./model');

var Parcel = Model.extend({

  attributes: {
    'id': undefined,
    'code': undefined,
    'zone_ids': undefined
  }

}, {

  table: 'parcels'

});


module.exports = Parcel
