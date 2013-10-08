var DBModel = require('./db_model');
var Rule = require('./rule');

var RuleSet = DBModel.extend({

  defaults: {
    'rule_ids': undefined,
    'score': undefined
  },

  getRules: function (cb) {
    var klass = this.constructor;        
    var rule_ids = (this.get('rule_ids') || [0])
    var query = 'SELECT * FROM rules WHERE id IN (' + rule_ids.join(', ') + ');'
    console.log(query);
    Rule.query(query, [], cb);
  },

  isMatch: function (object, cb) {
    this.getRules(function (rules) {
      for (var i = 0; i < rules.length; i++) {
        var rule = rules[i];
        if (rule.isMatch(object)) {
          cb(true)
          return;
        }
      }
      cb(false);
    });
  }

}, {

  table: 'rule_sets'

})

module.exports = RuleSet
