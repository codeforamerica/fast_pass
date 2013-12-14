var DBModel = require('./db_model');

var Session = DBModel.extend({
  attributes: {
    id: null,
    data: null
  }
}, {
  table: 'sessions',
});


module.exports = Session;
