var Session = require( process.cwd() + '/models/session' );

var find = module.exports.find = function (req, res) {
  var id = req.params.id;

  var onError = function (err) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.write(JSON.stringify({ "error": err }));
    res.end();
  }

  var onSuccess = function (session) {
    var data;

    if (session) {
      data = session.toJSON(); 
    } else {
      data = {}; 
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.write(JSON.stringify(data));
    res.end();
  }

  Session.find(id, onSuccess, onError);
}


var update = module.exports.update = function (req, res) {
  var id    = req.params.id;
  var attrs = req.body.data;

  var session = new Session({ id: id, data: attrs });

  var onError = function (err) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.write(JSON.stringify({ "error": err }));
    res.end();
  }

  var onSuccess = function (session) {
    var data;

    if (session) {
      data = session.toJSON(); 
    } else {
      data = {}; 
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.write(JSON.stringify(data));
    res.end();
  }

  var onFindSuccess = function (session) {
    if (session) {
      session.set({ 'data': attrs });
      session.save(onSaveSuccess, onError);
    } else {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.write(JSON.stringify({ 'error': 'Session could not be found' }));
      res.end();
    }
  }

  session.save(onSuccess, onError);
}

var create = module.exports.create = function (req, res) {

  var attrs = req.body || {};

  var onSuccess = function (session) {
    var data;

    if (session) {
      data = session.toJSON(); 
    } else {
      data = {}; 
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.write(JSON.stringify(data));
    res.end();
  }

  var onError = function (err) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.write(JSON.stringify({ "error": err }));
    res.end();
  }

  Session.create({ "data": attrs }, onSuccess, onError);
}
