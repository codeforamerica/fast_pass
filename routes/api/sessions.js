var Session = require( process.cwd() + '/models/session' );

module.exports.find = function (req, res) {
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
    res.write(JSON.stringify({ "data": data }));
    res.end();
  }

  Session.find(id, onSuccess, onError);
}

module.exports.update = function (req, res) {
  var id    = req.params.id;
  var attrs = req.body.data;

  console.log(attrs)

  var onError = function (err) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.write(JSON.stringify({ "error": err }));
    res.end();
  }

  var onSaveSuccess = function (session) {
    var data;

    if (session) {
      data = session.toJSON(); 
    } else {
      data = {}; 
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.write(JSON.stringify({ "data": data }));
    res.end();
  }

  var onFindSuccess = function (session) {
    if (session) {
      session.set({ "data": attrs });
      session.save(onSaveSuccess, onError);
    } else {
      // do something here
    }
  }

  Session.find(id, onFindSuccess, onError);
}

module.exports.create = function (req, res) {

  var attrs = req.body || {};

  var onSuccess = function (session) {
    var data;

    if (session) {
      data = session.toJSON(); 
    } else {
      data = {}; 
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.write(JSON.stringify({ "data": data }));
    res.end();
  }

  var onError = function (err) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.write(JSON.stringify({ "error": err }));
    res.end();
  }

  Session.create({ "data": attrs }, onSuccess, onError);
}
