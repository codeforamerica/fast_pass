var http = require('http');
var querystring = require('querystring');
var utils = require('./utils');

var HOST   = 'clvplaces.appspot.com'
var PATH   = '/maptools/rest/services/geocode'
var PORT   = 80
var METHOD = 'GET'

var GeoClient = function () {}

var AddressParser = function (address) {
  this.record = address;
}

AddressParser.prototype = {
  latitude: function () {
    return this.latlng()[0];
  },
  longitude: function () {
    return this.latlng()[1];
  },
  city: function () {
    return this.record.city;
  },
  state: function () {
    return this.record.state;
  },
  zipcode: function () {
    return this.record.zip;
  },
  address: function () {
    return [this.record.streetno, this.record.streetname].join(' ');
  },
  latlng: function () {
    return (this.record.latlng || ',').split(',');
  },
  toJSON: function () {
    return {
      latitude:  this.latitude(),
      longitude: this.longitude(),
      address:   this.address(),
      city:      this.city(),
      state:     this.state(),
      zipcode:   this.zipcode()
    }         
  }
}

GeoClient.geocodeAddress = function (address, cb) {

  var query = {
    address: address,
    format: 'json',
    score: 20,
    crossstreets: 'Y'
  }

  var queryStr = querystring.stringify(query);

  var path = PATH + '?' + queryStr

  var options = {
    host: HOST,
    port: PORT,
    method: METHOD,
    path: path
  }

  var cbWrapper = function (result) {
    cb(utils.map(result.response, function (r) { return (new AddressParser(r)).toJSON() }));
  }

  createRequest(options, cbWrapper);
}

GeoClient.geocodePosition = function (position, cb) {

  var query = {
    latlng: position,
    format: 'json',
    score: 20,
    crossstreets: 'Y'
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
      cb( JSON.parse(str) );
    });
  });

  req.on('error', function(e) {
    console.log(e);
    cb(undefined);
  });

  req.end();
}

module.exports = GeoClient;
