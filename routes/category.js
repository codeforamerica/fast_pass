var Category = require(process.cwd() + '/models/category');
var NAICSClient = require(process.cwd() + '/lib/naics_client');

module.exports.naics_search = function (req, res) {
  var keywords = req.query.keywords;

  NAICSClient.search(keywords, function (data) {
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.write(JSON.stringify(data));
    res.end();
  });
}
