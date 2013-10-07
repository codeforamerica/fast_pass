var utils  = require(process.cwd() + '/lib/utils');
var DBDriver = require(process.cwd() + '/db/driver');
var Model  = require('./model')

var DBModel = Model.extend({

  //
  // Saves the model instance to the database
  // Arguments:
  //  * Function - Callback
  // Returns:
  //  * DBModel - instance
  //  * Boolean - Success of save
  //
  save: function (cb) {
    cb = cb || function () {}

    if (!this.valid()) {
      cb(this, false);
    }

    this.persisted() ? this._update(cb) : this._create(cb);
  },

  //
  // Updates a persisted model instancs
  // Arguments:
  //  * Function - Callback
  // Returns:
  //  * DBModel - instance
  //  * Boolean - success of update
  //
  _update: function (cb) {
    var klass = this.constructor,
        attrs = utils.defaults({}, this.attributes),
        that  = this,
        id    = attrs.id;

    delete attrs.id;

    var keys = utils.keys(attrs),
        vals = utils.values(attrs),
        tmp  = [];

    for (var i = 0; i < keys.length; i++) {
      tmp.push('' + keys[i] + ' = $' + (i + 1));
    }

    var query = 'UPDATE ' + klass.table + ' SET ' + tmp.join(', ') + ' WHERE id = ' + id + ' RETURNING *;';

    klass.query(query, vals, function (rows) {
      if (rows.length > 0) {
        that.set(rows[0]);
        cb(that, true);
      } else {
        cb(that, false);
      }
    });
  },

  //
  // Saves a non-persisted model into the database
  // Arguments:
  //  * Function - Callback
  // Returns:
  //  * DBModel - instance
  //  * Boolean - success of create
  //
  _create: function (cb) {
    var klass = this.constructor;
        attrs = utils.defaults({}, this.attributes),
        that  = this;

    var cols = utils.keys(attrs),
        vals = utils.values(attrs),
        tmp  = [];

    for (var i = 0; i < vals.length; i++) { tmp.push('$' + (i+1)) }

    var query = 'INSERT INTO ' + klass.table + ' (' + cols.join(', ') + ') VALUES(' + tmp.join(', ') + ') RETURNING *;';

    klass.query(query, vals, function (rows) {
      if (rows.length > 0) {
        that.set(rows[0]);
        cb(that, true);
      } else {
        cb(that, false);
      }
    });
  },

  //
  // Removes an items from the database
  // Arguments:
  //  * Function - Callback
  // Returns:
  //  * Boolean - success of deletion
  //
  destroy: function (cb) {
    var klass = this.constructor;
    if (this.persisted) {
      DBDriver.query('DELETE FROM ' + klass.table + ' WHERE id = ' + this.get('id'), [], function (res) {
        if (res) cb(true);
      });
    }
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

  query: function (q,v,cb) {
    var klass = this;
    DBDriver.query(q, v, function (rows) {
      cb( utils.map(rows, function (row) { return new klass(row); }) );
    });
  },

  all: function (cb) {
    this.query('SELECT * FROM ' + this.table, [], cb);
  },

  find: function (id,cb) {
    this.query('SELECT * FROM ' + this.table + ' WHERE id = $1;', [id], function (sessions) {
      if (sessions.length > 0) {
        cb(sessions[0]);
      } else {
        cb();
      }
    });
  },

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

  update: function (id, attrs, cb) {
    var klass = this;
    this.find(id, function (row) {
      var instance = new klass(row);
      instance.set(attrs);
      instance.save(cb);
    });
  },

  create: function (attrs, cb) {
    var klass = this;
    var record = new klass(attrs);
    return record.save(cb);
  }

})

module.exports = DBModel;
