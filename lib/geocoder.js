var http = require('http');
var querystring = require('querystring');

var HOST   = 'mapdata.lasvegasnevada.gov'
var PORT   = 80
var METHOD = 'POST'

var GeoCoder = {};

GeoCoder.geocode = function (address) {

  var path = '/clvgis/rest/services/CLVPARCELS_Address_Locator/GeocodeServer/geocodeAddresses';

  var addressData = {
    "records": [{
      "attributes": { "STREET": a.getStreet() }
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

  var req = http.request(options, function (res) {
    res.setEncoding('utf-8');
    var str = '';
    res.on('data', function (chunk) {
      str += chunk;
    });
    res.on('end', function () {
      console.log(str);
    });
  });

  req.on('error', function(e) {
    console.log(e)
  });

  req.write(dataStr);
  req.end();
}

GeoCoder.reverseGeocode = function (point) {

  var path = '/clvgis/rest/services/CCParcel_Address_Locator/GeocodeServer/reverseGeocode';

  var locationData = { x: 786874.84908136481, y: 26763375.367454067 }

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

  var req = http.request(options, function (res) {
    res.setEncoding('utf-8');
    var str = '';
    res.on('data', function (chunk) {
      str += chunk;
    });
    res.on('end', function () {
      console.log(str);
    });
  });

  req.on('error', function(e) {
    console.log(e)
  });

  req.write(dataStr);
  req.end();
}

module.exports = GeoCoder;
