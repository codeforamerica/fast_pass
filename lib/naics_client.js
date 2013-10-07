var http = require('http');
var querystring = require('querystring');

var HOST   = 'api.naics.us'
var PATH   = '/v0/s'
var PORT   = 80
var METHOD = 'GET'

var DEFAULT_YEAR = 2012

var NAICSClient = function () {}

NAICSClient.search = function (keywords, cb) {
  year = DEFAULT_YEAR;

  var query = {
    terms: keywords,
    year: year
  }

  var queryStr = querystring.stringify(query);

  var headers = {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(queryStr)
  }

  var path = PATH + '?' + queryStr

  var options = {
    host: HOST,
    port: PORT,
    method: METHOD,
    path: path
  }

  createRequest(options, queryStr, cb);
}

function createRequest (options, dataStr, cb) {
  var req = http.request(options, function (res) {
    res.setEncoding('utf-8');
    var str = '';
    res.on('data', function (chunk) {
      str += chunk;
    });
    res.on('end', function () {
      cb(str);
    });
  });

  req.on('error', function(e) {
    console.log(e);
    cb(undefined);
  });

  req.end();
}

module.exports = NAICSClient;
