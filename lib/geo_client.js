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

GeoClient.geocodeAddress = function (address, onSuccess, onError) {

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
  
  var onSuccessWrapper = function (cb) {
    if (result && result.response) {
      result = utils.map(result.response, function (r) { return ( new AddressParser(r) ).toJSON() });
    }
    cb(result);
  }

  createRequest(options, onSuccessWrapper, onError);
}

GeoClient.geocodePosition = function (position, onSuccess, onError) {

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

  createRequest(options, onSuccess, onError);
}

function createRequest (options, onSuccess, onError) {

  var req = http.request(options, function (res) {
    var str = '';

    res.setEncoding('utf-8');

    res.on('data', function (chunk) {
      str += chunk;
    });

    res.on('end', function () {
      try {
        onSuccess( JSON.parse(str) );
      } catch (err) {
        onError(err);
      }
    });
  });

  req.on('error', function (err) {
    onError(err);
  });

  req.end();
}

module.exports = GeoClient;
