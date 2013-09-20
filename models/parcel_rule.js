var Model = require('./model')

var ParcelRule = Model.extend({
  attributes: {
    'parcel_code': undefined
  }
}, {
  table: 'parcel_rules'
})

module.exports = ParcelRule
