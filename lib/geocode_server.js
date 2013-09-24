var http = require('http');
var querystring = require('querystring');

var HOST   = 'mapdata.lasvegasnevada.gov'
var PATH   = '/clvgis/rest/services/LASVEGAS_Address_Locator/GeocodeServer'
var PORT   = 80
var METHOD = 'POST'

var GeocodeServer  = {};

GeocodeServer.geocodeAddress = function (address, cb) {

  var path = PATH + '/geocodeAddresses';

  var addressData = {
    "records": [{
      "attributes": { "STREET": address.get('street') }
    }]
  }

  var data = {
    "addresses": JSON.stringify(addressData),
    "outSR": 4326,
    "f": "pjson"
  }

  var dataStr = querystring.stringify(data)

  var headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Content-Length': Buffer.byteLength(dataStr)
  }

  var options = {
    host:   HOST,
    port:   PORT,
    method: METHOD,
    headers: headers,
    path: path
  };

  createRequest(options, dataStr, cb);
}

GeocodeServer.reverseGeocode = function (point, cb) {

  point.toESRI102707();

  var path = '/clvgis/rest/services/CCParcel_Address_Locator/GeocodeServer/';

  var locationData = { x: point.get('x'), y: point.get('y') }

  var data = {
    "location": JSON.stringify(locationData),
    "outSR": 4326,
    "f": "pjson"
  }

  var dataStr = querystring.stringify(data)

  var headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Content-Length': Buffer.byteLength(dataStr)
  }

  var options = {
    host:   HOST,
    port:   PORT,
    method: METHOD,
    headers: headers,
    path: path
  };

  createRequest(options, dataStr, cb);
}

GeocodeServer.findAddressCandidates = function (address, cb) {

  var path = PATH + '/findAddressCandidates';

  var data = {
    "Street": address.get('street'),
    "outSR": 4326,
    "f": "pjson"
  }

  console.log(data)

  var dataStr = querystring.stringify(data)

  var headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Content-Length': Buffer.byteLength(dataStr)
  }

  var options = {
    host:   HOST,
    port:   PORT,
    method: METHOD,
    headers: headers,
    path: path
  };

  createRequest(options, dataStr, cb);
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

  req.write(dataStr);
  req.end();
}

module.exports = GeocodeServer;
