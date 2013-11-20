module.exports.find = function (req, res) {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.write(JSON.stringify({ data: { id: 1 } }));
  res.end();
}

module.exports.update = function (req, res) {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.write(JSON.stringify({ data: { id: 1 } }));
  res.end();
}

module.exports.create = function (req, res) {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.write(JSON.stringify({ data: { id: 1 } }));
  res.end();
}
