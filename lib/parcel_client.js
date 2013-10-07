var http = require('http');
var querystring = require('querystring');

var HOST   = 'clvplaces.appspot.com'
var PATH   = '/maptools/rest/services/agsquery'
var PORT   = 80
var METHOD = 'GET'

var ParcelClient = function () {}

ParcelClient.search = function (position, cb) {

  var query = {
    latlng: position,
  }

  var queryStr = querystring.stringify(query);

  var path = PATH + '?' + queryStr

  var options = {
    host: HOST,
    port: PORT,
    method: METHOD,
    path: path
  }

  createRequest(options, cb);
}

function createRequest (options, cb) {
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

module.exports = ParcelClient;
