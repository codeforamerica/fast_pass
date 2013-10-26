module.exports.find = function (req, res) {
  res.send('ok');
}

module.exports.update = function (req, res) {
  res.send('ok');
}

module.exports.create = function (req, res) {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.write(JSON.stringify({ data: { id: 1, business_category: 'A1', planning_use: 'B1' } }));
  res.end();
}
