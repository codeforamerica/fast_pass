var Model = require('./model')
var DB    = require('./db');
var utils = require(process.cwd() + '/lib/utils')

var DBModel = Model.extend({

  save: function (cb) {
    cb = cb || function () {}

    var klass = this.constructor;
        attrs = utils.defaults({}, this.attributes),
        that  = this;

    if (this.persisted()) {
      var id = attrs.id;
      delete attrs.id;

      var keys = utils.keys(attrs),
          vals = utils.values(attrs),
          tmp  = [];

      for (var i = 0; i < keys.length; i++) {
        tmp.push('' + keys[i] + ' = $' + (i + 1));
      }

      var query = 'UPDATE ' + klass.table + ' SET ' + tmp.join(', ') + ' WHERE id = ' + id + ';';

      klass.query(query, vals, cb);
    } else {
      var cols = utils.keys(attrs),
          vals = utils.values(attrs),
          tmp  = [];

      for (var i = 0; i < vals.length; i++) { tmp.push('$' + (i+1)) }

      var query = 'INSERT INTO ' + klass.table + ' (' + cols.join(', ') + ') VALUES(' + tmp.join(', ') + ') RETURNING *;';

      klass.query(query, vals, function (rows) { that.set(rows[0]); cb(that) });
    }
  },

  destroy: function (cb) {
    cb = cb || function () {}
    var klass = this.constructor;
    if (this.persisted) {
      DB.query('DELETE FROM ' + klass.table + ' WHERE id = ' + this.get('id'), [], cb);
    }
  },

  persisted: function () {
    return !!(this.get('id'));
  }

}, {

  table: undefined,

  query: function (q,v,cb) {
    var klass = this;
    DB.query(q, v, function (rows) {
      cb( utils.map(rows, function (row) { return new klass(row); }) );
    });
  },

  all: function (cb) {
    this.query('SELECT * FROM ' + this.table, [], cb);
  },

  find: function (id,cb) {
    this.query('SELECT * FROM ' + this.table + ' WHERE id = $1;', [id], cb);
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
    var record = new this(attrs);
    return record.save(cb);
  }

})

module.exports = DBModel;
