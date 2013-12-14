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

  errors: {},

  attributes: {},

  set: function (attrs) {
    utils.extend(this.attributes, attrs);
    return attrs;
  },

  get: function (attr) {
    return this.attributes[attr]    
  },

  valid: function () {
    var attrs = this.attributes;
    var valid = true;
    var errors = {}

    utils.each(utils.keys(attrs), function (key) {
      if (attrs[key] === undefined) {
        if (!errors[key]) errors[key] = [];
        errors[key].push('must not be null');
        valid = false;
      }
    });

    this.errors = errors;

    return valid;
  },

  toJSON: function () {
    return utils.defaults({}, this.attributes);
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
