var Score = require(process.cwd() + '/models/score');
var Session = require(process.cwd() + '/models/session');
var RuleValidator = require(process.cwd() + '/lib/rule_validator');
var Driver = require(process.cwd() + '/db/driver')
var ParcelIndexer = function () {};

ParcelIndexer.index = function (parcels, categories, rules) {

  var secondsA = new Date().getTime() / 1000;

  for (var i = 0; i < parcels.length; i++) {
    var parcel = parcels[i];

    for (var j = 0; j < categories.length; j++) {
      var category = categories[j];
      var category_code = category.get('code');
      var parcel_code = parcel.get('code');
      var zone_code = parcel.get('zone_code')

      var session = new Session({
        category_code: category_code,
        parcel_code: parcel_code,
        zone_code: zone_code
      })

      var score = ParcelIndexer.score(session, rules);

      json = session.toJSON();
      json['score'] = score

    }
  }

  console.log(secondsA - (new Date().getTime() / 1000));
}

ParcelIndexer.score = function (session, rules) {
  var score = 0;

  for (var i = 0; i < rules.length; i++) {
    var rule = rules[i];
    if (RuleValidator.doesRuleApply(rule, session)) score += rule.score;
  }

  return score;
}

module.exports = ParcelIndexer;
