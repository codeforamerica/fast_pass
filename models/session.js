var DBModel = require('./db_model');

var Session = DBModel.extend({
  defaults: {
    id: null,
    data: null
  }
}, {
  table: 'sessions',
});


module.exports = Session;
