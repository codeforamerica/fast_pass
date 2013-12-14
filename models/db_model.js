var SQL = require('sql');
var DBDriver = require( process.cwd() + '/db/driver' );
var utils = require( process.cwd() + '/lib/utils' );
var Model = require('./model');

var DBModel = function () {}

var dbChildMethods = {
  persisted: function () {
    return !!this.get('id');
  },

  save: function () {
    if (this.persisted()) {
      this._update.apply(this, arguments);
    } else {
      this._create.apply(this, arguments);
    }
  },

  destroy: function (onSuccess, onError) {
    var klass = this.constructor;
    var query = klass.delete().where(klass.id.equals(this.get('id')));
    DBDriver.perform(query.text, query.value, onSuccess, onError);
  },

  _update: function (successCb, errorCb) {
    var instance = this;
    var klass = this.constructor; 
    var id    = this.get('id');
    var attrs = this.toJSON();

    delete attrs.id;

    var query = klass.update(attrs).where(klass.id.equals(id)).returning('*').toQuery()

    var onSuccess = function (results) {
      if (results.length == 1) instance.set(results[0]);
      successCb(instance);
    }

    var onError = errorCb;

    DBDriver.perform(query.text, query.values, onSuccess, onError);
  },

  _create: function (successCb, errorCb) {
    var instance = this;
    var klass = this.constructor; 
    var attrs = this.toJSON();
    
    delete attrs.id;

    var query = klass.insert(attrs).returning('*').toQuery();

    var onSuccess = function (results) {
      if (results.length == 1) instance.set(results[0]);
      successCb(instance);
    }

    var onError = errorCb;

    DBDriver.perform(query.text, query.values, onSuccess, onError);
  }

}

var dbParentMethods = {
  table: null,

  find: function (id, successCb, errorCb) {
    var query = this.where(this.id.equals(id)).limit(1).toQuery();

    var onSuccess = function (results) {
      successCb((results.length > 0) ? results[0] : null);
    }

    var onError = errorCb;

    this._performQuery(query, onSuccess, onError);
  },

  first: function (onSuccess, onError) {
    var query = this.select('*').limit(1).order('id ASC').toQuery();
    this._performQuery(query, onSuccess, onError);
  },

  last: function (onSuccess, onError) {
    var query = this.select('*').limit(1).order('id DESC').toQuery();
    this._performQuery(query, onSuccess, onError);
  },

  all: function (onSuccess, onError) {
    var query = this.select('*').toQuery();
    this._performQuery(query, onSuccess, onError);
  },

  create: function (attrs, onSuccess, onError) {
    var instance = new this(attrs);
    instance.set(attrs);
    instance.save(onSuccess, onError);
  },

  _performQuery: function (query, successCb, errorCb) {
    var klass = this;

    var onSuccess = function (results) {
      successCb(utils.map(results, function (attrs) { return new klass(attrs) })) 
    }

    var onError = errorCb;

    DBDriver.perform(query.text, query.values, onSuccess, onError);
  }

}

DBModel.extend = function (childMethods, parentMethods) {

  childMethods  = childMethods  || {};
  parentMethods = parentMethods || {};

  childMethods  = utils.defaults(childMethods, dbChildMethods);
  parentMethods = utils.defaults(parentMethods, dbParentMethods);

  var table   = parentMethods.table;
  var columns = utils.keys(childMethods.attributes);

  parentMethods = utils.defaults(
    parentMethods,
    SQL.define({ name: table, columns: columns })
  );

  return Model.extend(childMethods, parentMethods);
}


module.exports = DBModel;
