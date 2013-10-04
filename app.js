/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , geocoder = require('./routes/geocoder')
  , category = require('./routes/category')
  , parcel = require('./routes/parcel') , http = require('http')
  , path = require('path')
  , lessMiddleware = require('less-middleware');

var app = express();

process.env.NODE_ENV = process.env.NODE_ENV || "development"

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(lessMiddleware({
    src: __dirname + '/views/stylesheets',
    dest: __dirname + '/public/stylesheets',
    prefix: '/stylesheets',
    once: true,
    compress: true,
    debug: true
}));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);

//
// Parcel Routes
//
app.get('/parcels', parcel.index);
app.get('/parcels/search', parcel.search);
app.get('/parcels/:id', parcel.find)

//
// Geocode Routes
//
app.get('/address/geocode', geocoder.geocodeAddress);
app.get('/address/suggest', geocoder.findAddressCandidates);
app.get('/point/reverse_geocode', geocoder.reverseGeocode);

//
// Category Routes
//
app.get('/categories/search', category.search);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
