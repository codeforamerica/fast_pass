var Zone     = require(process.cwd() + '/models/zone');
var RuleSet  = require(process.cwd() + '/models/rule_set');
var Category = require(process.cwd() + '/models/category');

var ruleSetsByZoneId = function (callback) {
  Zone.query('SELECT id FROM zones;', [], function (zoneIds) {
    var ruleSetsByZoneId = {};

    var ruleSetQuery = 'SELECT * FROM rule_sets WHERE (resource_id IN (' +
        zoneIds.join(', ') +
        ') AND (type = $1)';

    RuleSet.query(ruleSetQuery, ['CategoryZone'], function (ruleSets) {
      for (var i = 0; i < ruleSets.length; i++) {
        var ruleSet = ruleSets[i];
        var zoneId  = ruleSet.get('resource_id');
        (ruleSetByZoneId[zoneId] = ruleSetByZoneId[zoneId] || [0]).push(ruleSet);
      }

      callback(ruleSetsByZoneId)
    });
  });
}

Category.all(function (categories) {
  ruleSetsByZoneId(function (rsbzid) {
    var zoneIds = Object.keys(rsbzid);
    for (var i = 0; i < categories.length; i++) {
      var category = categories[i];
      for (var j = 0; j < zoneIds.length; j++) {
        var zoneId  = zoneIds[j];
        var ruleSet = rsbzid[zoneId];
        ruleSet.isMatch(category, function (match) {
          console.log(match) 
        })
      }
    }
  })
})
