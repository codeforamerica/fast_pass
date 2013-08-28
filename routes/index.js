
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Las Vegas DOF Work-in-Progress' });
};