var utils = require('./utils');

var DEFAULT_OPTIONS = {
  "enforceStrict": true
}

var RuleValidator = function (options) {
  options = options || {}
  utils.defaults(options, DEFAULT_OPTIONS);
  this.options = options;
}

utils.extend(RuleValidator.prototype, {
  //
  // Determines whether a rule's subconditions apply to an object
  //
  doesRuleApply: function (rule, object) {
    if (typeof(rule) === 'undefined') return false;
    if (typeof(object) === 'undefined') return false;
    return this._doesConditionApply(rule.condition, object);
  },

  //
  // Determines whether a condition (complex or simple) applies to an object
  //
  _doesConditionApply: function (condition, object) {
    if (typeof(condition) === 'undefined') return false;

    if (condition.operator === 'AND') {
      return this._doesConjunctiveConditionApply(condition, object);
    }

    if (condition.operator === 'OR') {
      return this._doesDisjunctiveConditionApply(condition, object);
    }

    return this._doesSimpleConditionApply(condition, object);
  },

  //
  // Determines whether a conjunctive condition (AND) applies to an object
  //
  _doesConjunctiveConditionApply: function (condition, object) {
    var doesApply = true;
    var subconditions = condition.subconditions;
    for (var i = 0; i < subconditions.length; i++) {
      if (!this._doesConditionApply(subconditions[i], object)) doesApply = false;
      if (doesApply === false) break;
    }
    return doesApply;
  },

  //
  // Determines whether a disjunctive condition (OR) applies to an object
  //
  _doesDisjunctiveConcitionApply: function (condition, object) {
    var doesApply = false;
    var subconditions = condition.subconditions;
    for (var i = 0; i < subconditions.length; i++) {
      if (this._doesConditionApply(subconditions[i], object)) doesApply = true;
      if (doesApply === true) break;
    }
    return doesApply;
  },

  //
  // Determines whether a simple condition (equivalence, relations, inclusion)
  // applies to an object.
  //
  _doesSimpleConditionApply: function (condition, object) {
    var doesApply = false;
    var objectValue = object[condition.attribute];
    var conditionValue = condition.value;

    if (typeof(objectValue) === 'undefined' && !this.options.enforceStrict) return true;

    switch (condition.operator) {
      case '=':
        doesApply = objectValue === conditionValue;
        break;
      case '!=':
        doesApply = objectValue !== conditionValue;
        break;
      case '>':
        doesApply = objectValue > conditionValue;
        break;
      case '<':
        doesApply = objectValue < conditionValue;
        break;
      case '>=':
        doesApply = objectValue >= conditionValue;
        break;
      case '<=':
        doesApply = objectValue <= conditionValue;
        break;
      case 'IN':
        if (typeof(conditionValue.indexOf) === 'undefined') break;
        doesApply = conditionValue.indexOf(objectValue) !== -1
        break;
      case 'NOT IN':
        if (typeof(conditionValue.indexOf) === 'undefined') break;
        doesApply = conditionValue.indexOf(objectValue) === -1
        break;
      case '=~':
        if (typeof(objectValue) !== 'string') objectValue = ''
        if (typeof(conditionValue) !== 'string') conditionValue = ''
        regex = new RegExp(conditionValue.match(/\/?(.*)\/?/)[1]);
        if (objectValue.match(regex)) doesApply = true;
        break;
      default:
        break;
    }

    return doesApply;
  }

});

module.exports = RuleValidator;
