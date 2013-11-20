var Session = require( process.cwd() + '/models/session' );

module.exports.find = function (req, res) {
  res.send('{}');
}

module.exports.update = function (req, res) {
  var attributes = req.body.session;
  var id = attributes.id;

  delete attributes.id;

  try {
    Session.find(id, function (session) {
      if (session) {
        session.set(attributes);
        session.save(function () {
        
        });
      }
    });
  } catch(error) {
  
  }

  Session.find(req.id, function (session) {
    if (session) {
      data = session.toJSON(); 
    } else {
      data = {};
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.write(JSON.stringify({ "data": data }));
    res.end();
  });

}

module.exports.create = function (req, res) {

  Session.create(req.body, function (session) {
    if (session) {
      data = session.toJSON(); 
    } else {
      data = {};
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.write(JSON.stringify({ "data": data }));
    res.end();
  });
}
