var RuleValidator = function () {}

//
// Determines whether a rule's subconditions apply to an object
//
RuleValidator.doesRuleApply = function (rule, object) {

  if (typeof(object) === 'undefined') return false;
  if (typeof(rule) === 'undefined') return false;

  return RuleValidator.doesConditionApply(rule.condition, object);
}

//
// Determines whether a condition (complex or simple) applies to an object
//
RuleValidator.doesConditionApply = function (condition, object) {
  if (typeof(condition) === 'undefined') return false;

  if (condition.operator === 'AND') {
    return RuleValidator.doesConjunctiveConditionApply(condition, object);
  }

  if (condition.operator === 'OR') {
    return RuleValidator.doesDisjunctiveConditionApply(condition, object);
  }

  return RuleValidator.doesSimpleConditionApply(condition, object);
}

//
// Determines whether a conjunctive condition (AND) applies to an object
//
RuleValidator.doesConjunctiveConditionApply = function (condition, object) {
  var doesApply = true;
  var subconditions = condition.subconditions;
  for (var i = 0; i < subconditions.length; i++) {
    if (!RuleValidator.doesConditionApply(subconditions[i], object)) doesApply = false;
    if (doesApply === false) break;
  }
  return doesApply;
}

//
// Determines whether a disjunctive condition (OR) applies to an object
//
RuleValidator.doesDisjunctiveConditionApply = function (condition, object) {
  var doesApply = false;
  var subconditions = condition.subconditions;
  for (var i = 0; i < subconditions.length; i++) {
    if (RuleValidator.doesConditionApply(subconditions[i], object)) doesApply = true;
    if (doesApply === true) break;
  }
  return doesApply;
}


//
// Determines whether a simple condition (equivalence, relations, inclusion)
// applies to an object.
//
RuleValidator.doesSimpleConditionApply = function (condition, object) {
  var doesApply = false;
  var objectValue = object.get(condition.attribute);
  var conditionValue = condition.value;

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
      objectValue + '' // Ensure value is a string
      regex = new RegExp(conditionValue.match(/\/?(.*)\/?/)[1]);
      if (objectValue.match(regex)) doesApply = true;
      break;
    default:
      break;
  }

  return doesApply;
}

module.exports = RuleValidator;
