var DBDriver = require( process.cwd() + '/db/driver' );
var Model    = require( './model' );
var sql = require('sql');

var DBModel = Model.extend({

  save: function (successCb, errorCb) {
    var instance = this;
    var klass = this.constructor;
    var data  = this.toJSON();

    var onSuccess = function (rows) {
      instance.set(rows[0]);
      successCb(instance);
    }

    var onError = function (err) {
      errorCb(err);
    }

    if (this.persisted()) {
      DBDriver.update(klass.table, { "id": this.get('id') }, data, onSuccess, onError);
    } else {
      DBDriver.create(klass.table, data, onSuccess, onError);
    }
  },

  //
  // Removes an items from the database
  // Arguments:
  //  * Function - Callback
  // Returns:
  //  * Boolean - success of deletion
  //
  destroy: function (successCb, errorCb) {
    var klass = this.constructor;

    var onSuccess = function () {
      successCb(true);
    }

    var onError = function (err) {
      errorCb(err) 
    }

    DBDriver.destroy(klass.table, { "id": this.get('id') }, onSuccess, onError);
  },

  //
  // Whether an instance is persisted in the DB
  // Arguments: None
  // Returns:
  //  * Boolean - whether an item is persisted in the DB
  persisted: function () {
    return !!(this.get('id'));
  }

}, {

  //
  // The table name of the DBModel
  //
  table: undefined,

  //
  // Base query function
  // Arguments:
  //  * String - query
  //  * Array - values to insert in query string
  //  * Function - callback
  // Returns:
  //  * Array - results
  //
  where: function (conditions, successCb, errorCb) {
    var klass = this;

    var onSuccess = function (rows) {
      successCb( utils.map(rows, klass.new )) 
    }

    var onError = function (err) {
      errorCb(err) 
    }

    DBDriver.where(this.table, conditions, onSuccess, onError);
  },

  //
  // All query function
  // Arguments:
  //  * Function - callback
  // Returns:
  //  * Array - results
  //
  all: function (cb) {
    this.query('SELECT * FROM ' + this.table, [], cb);
  },

  //
  // Single query function
  // Arguments:
  //  * ID - row id
  //  * Function - callback
  // Returns:
  //  * DBModel instance - instance or null
  //
  find: function (id,cb) {
    this.query('SELECT * FROM ' + this.table + ' WHERE id = $1;', [id], function (results) {
      if (results.length > 0) {
        cb(results[0]);
      } else {
        cb();
      }
    });
  },

  //
  // More intelligent query function - constructs string from query object
  // Arguments:
  //  * Object - query arguments
  // Returns:
  //  * Array - results
  //
  search: function (parameters, cb) {
    var query = [];
    var keys  = utils.keys(parameters);

    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      var str = '(' + [ key, '=', '$' + (i+1)].join(' ') + ')';
      query.push(str);
    }

    query = 'SELECT * FROM ' + this.table + ' WHERE ' + query.join(' AND ');

    this.query(query, utils.values(parameters), cb);
  },


  //
  // Class level update function
  // Arguments:
  //  * ID - row id
  //  * Object - item attributes
  //  * Function - callback
  // Returns:
  //  * DBModel instance - results
  //  * Boolean - whether the item was updated
  //
  update: function (id, attrs, cb) {
    var klass = this;
    this.find(id, function (row) {
      var instance = new klass(row);
      instance.set(attrs);
      instance.save(cb);
    });
  },

  //
  // Class level create function
  // Arguments:
  //  * Object - item attributes
  // Returns:
  //  * DBModel instance - results
  //  * Boolean - whether the item was updated
  //
  create: function (attrs, cb) {
    var klass = this;
    var record = new klass(attrs);
    return record.save(cb);
  }

})

DBModel.define = function (childProto, parentProto) {
  var model = DBModel.extend(childProto, parentProto);

  model.extend(sql.define({
    name: model.table, 
    columns: model.columns
  }));

  return model;
}

module.exports = DBModel;
