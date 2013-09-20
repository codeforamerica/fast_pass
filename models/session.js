var Model = require('./model')

var Session = Model.extend({
  attributes: {
    business_category_codes: undefined,
    use_modifier_ids: undefined,
    parcel_code
  }
})

module.exports = Parcel
