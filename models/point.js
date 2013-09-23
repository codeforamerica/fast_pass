var Model = require('./model')

var Point = Model.extend({

  defaults: {
    'latitude': undefined,
    'longitude': undefined
  }

});

module.exports = Point
