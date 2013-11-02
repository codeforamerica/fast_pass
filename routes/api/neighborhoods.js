var dummyData = require(process.cwd() + '/data/neighborhoods');

module.exports.index = function (req, res) {
  res.writeHead(200, {'Content-Type': 'application/json'});
  res.write(JSON.stringify(dummyData));
  res.end();
}
