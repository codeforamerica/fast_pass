
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'City of Las Vegas Development Opportunity Finder' });
};