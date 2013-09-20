var Model = require('./model');
var Zone  = require('./models/zone');
var BusinessCategory = require('./models/business_category');

var ZoneRule = Model.extend({

  attributes: {
    business_category_code: undefined,
    zone_code: undefined,
    operator: undefined
  },

  getBusinessCategory: function () {
    return BusinessCategory.find( this.get('business_category_code') );
  },

  getZone: function () {
    return Zone.find( this.get('zone_code') );
  },

  allowsBusinessCategory: function (category) {
    switch ( this.get('operator') )
    {
      case '=':
        return category.equal( this.getBusinessCategory() );
        break;
      case '!=':
        return !category.equal( this.getBusinessCategory() );
      default:
        return true;
    }
  }

})

module.exports = ZoneRule
