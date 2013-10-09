var Score = require(process.cwd() + '/models/score');

var ParcelIndexer = function () {};

ParcelIndexer.index = function (parcels, categories, rules) {
  Score.query('TRUNCATE TABLE scores;', [], console.log);

  for (var i = 0; i < parcels.length; i++) {
    var parcel = parcels[i];

    for (var j = 0; j < categories.length; j++) {
      var category = categories[j];

      var session = new Session({
        category_code: category.get('code'),
        parcel_code: parcel.get('code')
      })

      var score = ParcelIndexer.score(session, rules);

      Score.create({
        category_code: category_code,
        parcel_code: parcel_code,
        score: score
      }, console.log);

      console.log('Score indexed for session: ' + JSON.stringify(session.toJSON()));
    }

  }
}

ParcelIndexer.score = function (session, rules) {
  var score = 0;

  for (var i = 0; i < rules.length; i++) {
    var rule = rules[i];
    if (rule.doesApplyToObject(session)) score += rule.get('score');
  }

  return score;
}

module.exports = ParcelIndexer;
