var DBModel = require('./db_model');
var RuleValidator = require(process.cwd() + '/lib/rule_validator')

var Rule = DBModel.extend({

  defaults: {
    'attribute': undefined,
    'operator': undefined,
    'value': undefined
  },

  doesApplyToObject: function (object) {
    return RuleValidator.doesRuleApply(this, object);
  }

}, {

  table: 'rules'

})

module.exports = Rule
