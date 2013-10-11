
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', {
    title: 'Development FastPass - City of Las Vegas, Nevada',
    description: 'Find the best location for your Las Vegas-based business'
  });
};
