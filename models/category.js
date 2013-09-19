var utils = require( process.cwd() + '/lib/utils');
var naics = require( process.cwd() + '/data/naics-2012.json' );

var ATTRIBUTES = [ 'title', 'description', 'code' ];

var Category = function (attributes) {

  if (typeof(attributes) !== 'undefined' && typeof(attributes) !== 'object') {
    throw("'attributes' must be an instance of 'object'");
  }

  for (key in attributes) {
    if (utils.includes.call(ATTRIBUTES, key)) {
      this[key] = attributes[key];
    }
  }

}

Category.prototype.isValid = function () {
  var valid = true;

  for (var i = 0; i < ATTRIBUTES.length; i++) {
    if (this[ATTRIBUTES[i]] == undefined) valid = false;
  }

  return valid;
}

Category.search = function (query) {
  var records = Category.records;
  var matches = [];

  query = query.toLowerCase();

  for (var i = 0; i < records.length; i++) {
    var record = records[i];
    var title  = record.title.toLowerCase();
    var description = record.description.join(' ').toLowerCase();

    if (title.indexOf(query) !== -1) matches.push(record);
    if (description.indexOf(query) !== -1) matches.push(record);
  }

  return matches;
}

_setCategories = function () {
  var items = naics.items;
  var records = [];

  for (var i = 0; i < items.length; i++) {
    var record = new Category(items[i]);
    if (record.isValid()) records.push(record)
  }

  Category.records = records;
}

_setCategories();

module.exports = Category;
