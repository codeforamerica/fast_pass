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
      this.__update.apply(this, arguments);
    } else {
      this.__create.apply(this, arguments);
    }
  },

  delete: function (onSuccess, onError) {
    this.constructor.delete(this.get('id'), onSuccess, onError);
  },

  __update: function (successCb, errorCb) {
    var instance = this;
    var id    = this.get('id');
    var attrs = this.toJSON();

    delete attrs.id;

    var onError = errorCb;

    var onSuccess = function (result) {
      instance.set(result.toJSON());
      successCb(instance);
    }

    this.constructor.update(id, attrs, onSuccess, onError);
  },

  __create: function (successCb, errorCb) {
    var instance = this;
    var id    = this.get('id');
    var attrs = this.toJSON();

    delete attrs.id;

    var onError = errorCb;

    var onSuccess = function (result) {
      instance.set(result.toJSON());
      successCb(instance);
    }

    this.constructor.create(attrs, onSuccess, onError);
  }

}

var dbParentMethods = {
  table: null
}

DBModel.extend = function (childMethods, parentMethods) {

  childMethods  = childMethods  || {};
  parentMethods = parentMethods || {};

  childMethods  = utils.defaults(childMethods, dbChildMethods);
  parentMethods = utils.defaults(parentMethods, dbParentMethods);

  var klass;

  var table   = parentMethods.table;
  var columns = utils.keys(childMethods.attributes);
  var sql     = SQL.define({ name: table, columns: columns });

  var perform = function (query, successCb, errorCb) {
    var onError = errorCb;
    var onSuccess = function (results) {
      successCb(utils.map(results, function (result) { return new klass(result) })) 
    }
    DBDriver.perform(query.text, query.values, onSuccess, onError);
  }

  parentMethods.find = function (id, successCb, errorCb) {
    var onError = errorCb;
    var query = sql.where(sql.id.equals(id)).limit(1).toQuery();
    var onSuccess = function (results) {
      successCb((results.length > 0) ? results[0] : null);
    }
    perform(query, onSuccess, onError);
  }

  parentMethods.create = function (attrs, successCb, errorCb) {
    var onError = errorCb;
    var query = sql.insert(attrs).returning('*').toQuery();
    var onSuccess = function (results) {
      successCb((results.length > 0) ? results[0] : null);
    }
    perform(query, onSuccess, onError);
  }

  parentMethods.update = function (id, attrs, successCb, errorCb) {
    var onError = errorCb;
    var query = sql.update(attrs).where(sql.id.equals(id)).returning('*').toQuery();
    var onSuccess = function (results) {
      successCb((results.length > 0) ? results[0] : null);
    }
    perform(query, onSuccess, onError);
  }

  parentMethods.delete = function (id, successCb, errorCb) {
    var onError = errorCb;
    var query = sql.delete().where(sql.id.equals(id)).returning('*').toQuery();
    var onSuccess = function (results) {
      successCb((results.length > 0) ? results[0] : null);
    }
    perform(query, onSuccess, onError);
  }

  var klass = Model.extend(childMethods, parentMethods);

  return klass;
}


module.exports = DBModel;
