var Category = require(process.cwd() + '/models/category');

module.exports.search = function (req, res) {
  console.log(process.env.NODE_ENV)
  var keywords = req.query.keywords;
  Category.query('SELECT * FROM categories;', ['NAICS', keywords], function (rows) {
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.write(JSON.stringify(data));
    res.end();
  });
}
