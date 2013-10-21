module.exports = function (req, res) {
  var page = 'pages/' + (req.params.name || 'index');
  res.render(page, {
    title: 'Development FastPass - City of Las Vegas, Nevada',
    description: 'Find the best location for your Las Vegas-based business'
  })
}
