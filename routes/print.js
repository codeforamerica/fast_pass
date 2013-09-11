
/*
 * GET print page.
 */

exports.view = function(req, res){
  res.render('print', { title: 'City of Las Vegas Development FastPass' });
};