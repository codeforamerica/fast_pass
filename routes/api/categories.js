var Category = require(process.cwd() + '/models/category');
var NAICSClient = require(process.cwd() + '/lib/naics_client');
var dummyData = require( process.cwd() + '/data/business_licensing_categories');

module.exports.naics_search = function (req, res) {
  var keywords = req.query.keywords;
  NAICSClient.search(keywords, function (data) {
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.write(data);
    res.end();
  });
}

module.exports.business_licensing_search = function (req, res) {
  res.writeHead(200, {'Content-Type': 'application/json'});
  res.write(JSON.stringify(dummyData));
  res.end();
}
