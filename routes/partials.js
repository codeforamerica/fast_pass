module.exports = function (req, res) {
  var partial = 'partials/' + req.params.name;
  res.render(partial);
}
