var Model = require('./model')

var Address = Model.extend({
  defaults: {
    "street": undefined
  }
});

module.exports = Address;
