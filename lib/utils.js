var noop = module.exports.noop = function () {}

//
// Allows one to determine the index of an item included in an Array
//
var indexOf = module.exports.indexOf = function (item) {
  if (typeof Array.prototype.indexOf === 'function') {
    indexOf = Array.prototype.indexOf 
  } else {
    indexOf = function (item) {
      var i = -1, index = -1 
      for (i = 0; i < this.length; i++) {
        if (this[i] === item) {
          index = i
          break
        }
      }
      return index;
    } 
  }
  return indexOf.call(this, item)
}

//
// Allows one to determine inclusion of an item in an array
//
var includes = module.exports.includes = function (item) {
  return (indexOf.call(this, item) !== -1)
}

//
// Allows one to iterate over an Array - Ripped from Underscore.js
//
var each = module.exports.each = function(obj, iterator, context) {
  if (obj == null) return;
  if (Array.prototype.forEach && obj.forEach === Array.prototype.forEach) {
    obj.forEach(iterator, context);
  } else if (obj.length === +obj.length) {
    for (var i = 0, length = obj.length; i < length; i++) {
      if (iterator.call(context, obj[i], i, obj) === breaker) return;
    }
  } else {
    var keys = _.keys(obj);
    for (var i = 0, length = keys.length; i < length; i++) {
      if (iterator.call(context, obj[keys[i]], keys[i], obj) === breaker) return;
    }
  }
};


//
// Allows one to iterate over an array and create a new array from returns values - _
//
var map = module.exports.map = function(obj, iterator, context) {
  var results = [];
  if (obj == null) return results;
  if (Array.prototype.map && obj.map === Array.prototype.map) return obj.map(iterator, context);
  each(obj, function(value, index, list) {
    results.push(iterator.call(context, value, index, list));
  });
  return results;
};

//
//
//
var defaults = module.exports.defaults = function(obj) {
  each(Array.prototype.slice.call(arguments, 1), function(source) {
    if (source) {
      for (var prop in source) {
        if (obj[prop] === void 0) obj[prop] = source[prop];
      }
    }
  });
  return obj;
};

//
// Allows one extend an object - Ripped from Underscore.js
//
var extend = module.exports.extend = function(obj) {
  each(Array.prototype.slice.call(arguments, 1), function(source) {
    if (source) {
      for (var prop in source) {
        obj[prop] = source[prop];
      }
    }
  });

  return obj;
};

//
// Allows one to extract keys from an object
//
var keys = module.exports.keys = function (obj) {
  var keys = [];
  for (var k in obj) keys.push(k);
  return keys;
}

//
// Allows one to extract values from an object
//
var values = module.exports.values = function (obj) {
  var values = [];
  for (var k in obj) values.push(obj[k]);
  return values;
}

// Shorthand for hasOwnProperty

var has = module.exports.has = function(obj, key) {
  return hasOwnProperty.call(obj, key);
};
