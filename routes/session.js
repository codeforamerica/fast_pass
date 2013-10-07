var Session = require(process.cwd() + '/models/session');

//
// Updates a Session instance
// Method: PUT
// Arguments:
//  * ID - Session id
//  * Object - session attributes
// Returns:
//  * Code - Status code
//  * Object - persisted session attributes or error message
//
module.exports.update = function (req, res) {
  var id = req.params.id;
  var attrs = req.body;

  Sessions.find(id, function (session) {
    if (session) {
      session.set(attrs);
      session.save(function (session, result) {
        if (result) {
          sendJSONResponse(res, 200, session.toJSON());
        } else {
          sendJSONResponse(res, 404, { error: 'Item was not successfully saved.' });
        }
      })
    } else {
      sendJSONResponse(res, 404, { error: 'Invalid ID. No session found.' });
    }
  })
}

//
// Finds a Session instance
// Method: GET
// Arguments:
//  * ID - Session id
// Returns:
//  * Code - Status code
//  * Object - persisted session attributes or error message
//
module.exports.find = function (req, res) {
  var id = req.params.id;

  Session.find(id, function (session) {
    if (session) {
      sendJSONResponse(res, 200, session.toJSON());
    } else {
      sendJSONResponse(res, 404, { error: 'Invalid ID. No session found.' });
    }
  });
}

//
// Creates a new Session instance
// Method: POST
// Arguments:
//  * Object - Session attributes
// Returns:
//  * Code - Status code
//  * Object - persisted session attributes or error message
//
module.exports.create = function (req,res) {
  var attrs = req.body;
  var session = new Session(attrs);

  session.save(function (session, result) {
    if (result) {
      sendJSONResponse(res, 200, s.toJSON());
    } else {
      sendJSONResponse(res, 404, { error: 'Item was not successfully created.' });
    }
  })
}

function sendJSONResponse(res, code, data) {
  res.writeHead(code, { 'Content-Type': 'application/json' });
  res.write(JSON.stringify(data));
  res.end();
}
