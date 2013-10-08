var DBModel = require('./db_model');

var Rule = DBModel.extend({

  defaults: {
    'attribute': undefined,
    'operator': undefined,
    'value': undefined
  },

  isMatch: function (object) {
    if (typeof(object) === 'undefined') return false;

    var attribute  = this.get('attribute');
    var operator   = this.get('operator');
    var value      = this.get('value');
    var comparator = object.get(attribute);

    if (typeof(comparator) === 'undefined') return false;

    switch(operator)
    {
      case '=':
        return (comparator + '') === (value + '');
        break;
      case '!=':
        return (comparator + '') !== (value + '');
        break;
      case '>':
        return parseFloat(comparator) > parseFloat(value);
        break;
      case '<':
        return parseFloat(comparator) < parseFloat(value);
        break;
      case '>=':
        return parseFloat(comparator) >= parseFloat(value);
        break;
      case '<=':
        return parseFloat(comparator) <= parseFloat(value);
        break;
      default:
        return false;
    }
  }

}, {

  table: 'rules'

})

module.exports = Rule
