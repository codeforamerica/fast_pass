var DBModel = require('./db_model');

var Score = DBModel.extend({

  defaults: {
    'score': undefined,
    'category_code': undefined,
    'parcel_code': undefined
  }

}, {

  table: 'scores'

});

module.exports = Score
