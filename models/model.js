var utils = require( process.cwd() + '/lib/utils');
var Database = require('./database');

var func = function () {}

//
// Base model class
//
var Model = function (attributes) {
  if (typeof(attributes) !== 'undefined' && typeof(attributes) !== 'object') {
    throw("'attributes' must be an instance of 'object'") 
  }

  utils.extend(this.attributes, attributes);
}

//
// Model prototype
//
utils.extend(Model.prototype, {
  initialize: func,
  attributes: {},
  set: function (attrs) {
    utils.extend(this.attributes, attrs);
    return attrs;
  },
  get: function (attr) {
    return this.attributes[attr]    
  },
  valid: function () {
    var valid = true;
    var attrs = this.attributes;
    utils.each(utils.keys(attrs), function (key) {
      if (attrs[key] === undefined) valid = false;
    });
    return valid;
  },
  save: func
});

//
// Model database table name
//
Model.table = undefined;

//
// Delegate query to Database
//
Model.query = function (q, v, cb) {
  Database.query(q, v, cb);
}

//
// Select all from database
//
Model.all = function (cb) {
  this.query('SELECT * FROM ' + this.table, [], cb);
}

//
// Select one from database by id
//
Model.find = function (id, cb) {
  this.query('SELECT * FROM ' + this.table + ' WHERE id = $1;', [id], cb)
}

//
// Concatenate search parameters into query string
//
Model.search = function (parameters, cb) {
  var query = [];
  var keys  = utils.keys(parameters);

  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    var str = '(' + [ key, '=', '$' + (i+1)].join(' ') + ')';
    query.push(str);
  }

  query = 'SELECT * FROM ' + this.table + ' WHERE ' + query.join(' AND ');

  this.query(query, utils.values(parameters), cb);
}

//
// Update item
//
Model.update = function (id, attrs, cb) {
  var klass = this;
  this.find(id, function (row) {
    var instance = new klass(row);
    instance.set(attrs);
    instance.save(cb);
  })
}

//
// Persist model in database
//
Model.create = function (attrs, cb) {
  var record = new this(attrs);
  return record.save(cb);
}

//
// Extend function for model
//
Model.extend = function(protoProps, staticProps) {
  var parent = this;
  var child;

  if (protoProps && utils.has(protoProps, 'constructor')) {
    child = protoProps.constructor;
  } else {
    child = function(){ return parent.apply(this, arguments); };
  }

  utils.extend(child, parent, staticProps);

  var Surrogate = function(){ this.constructor = child; };
  Surrogate.prototype = parent.prototype;
  child.prototype = new Surrogate;

  if (protoProps) utils.extend(child.prototype, protoProps);

  child.__super__ = parent.prototype;

  return child;
};

module.exports = Model;
