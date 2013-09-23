var utils = require( process.cwd() + '/lib/utils');
var func = function () {}

//
// Base model class
//
var Model = function (attributes) {
  if (typeof(attributes) !== 'undefined' && typeof(attributes) !== 'object') {
    throw("'attributes' must be an instance of 'object'") 
  }
  attributes = attributes || {}
  this.attributes = {}
  attributes = utils.defaults(attributes, this.defaults);
  this.set(attributes)
  this.initialize.apply(this, arguments);
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
  }
});

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
