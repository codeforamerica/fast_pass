var Model = require('./model');

var Parcel = Model.extend({

  attributes: {
    'code': undefined,
    'zone_codes': undefined
  },

  equal: function (other) {
    return this.get('code')  == other.get('code');
  }

}, {
  table: 'parcels'
});


module.exports = Parcel
