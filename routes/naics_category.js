var NAICSCategory = require( process.cwd() + '/models/naics_category' )

exports.search = function (req, res) {
  var query = req.query.q;
  var matches = [];
  if (query !== undefined) matches = Category.search(query);
  res.writeHead(200, {'Content-Type': 'application/json'});
  res.write(JSON.stringify(matches));
  res.end();
}
