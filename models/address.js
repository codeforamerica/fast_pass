var Model = require('./model')

var Address = Model.extend({
  getStreet: function () {
    return '107  South Las Vegas Boulevard';
  }
});

module.exports = Address;
