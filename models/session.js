var DBModel = require('./db_model');

var Session = DBModel.define({
   
}, {
  table: 'sessions',
  columns: [ 'id', 'data' ]
});


module.exports = Session;
