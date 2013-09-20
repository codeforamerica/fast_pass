var Model = require('./model')

var NAICSCategory = Model.extend({
  attributes: {
    'title': undefined,
    'description': undefined,
    'code': undefined
  }
})

module.exports = NAICSCategory;
