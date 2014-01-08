// Raise error unless environment variable is set
if (typeof(process.env.NODE_ENV) === 'undefined') {
  throw('The application environment must be set as an environment variable by the name of `NODE_ENV`');
} else {
  console.log('The application environment is set to: ' + process.env.NODE_ENV);
}

var MODELS = '/models/'

//
// DEPENDENCIES
//

// Module dependencies
var express = require('express')
  , routes = require('./routes')
  , api = require('./routes/api')
  , http = require('http')
  , path = require('path')
  , less = require('less-middleware');

//
// APPLICATION CONFIGURATION
//

var app = express();
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(less({
    src: __dirname + '/public/less',
    dest: __dirname + '/public/css',
    prefix: '/css',
    once: true,
    compress: true,
    optimization: 2,
    debug: true
}));

app.use(express.static(path.join(__dirname, 'public')));

// Turn error handler on for the development environment.
if (app.get('env') === 'development') {
  app.use(express.errorHandler());
}

//
// ROUTING
//

// Visible Routes
app.get('/', routes.pages);
app.get('/partials/:name', routes.partials);
app.get('/pages/:name', routes.pages)

// TODO: MAKE ROUTES CLEANER

// Parcel Routes
app.get('/api/parcels/search', api.parcels.search);
app.get('/api/parcels', api.parcels.index);

// Category Routes
app.get('/api/categories/naics', api.categories.naics_search);
app.get('/api/categories/business_licensing', api.categories.business_licensing_search)

// Session Routes
app.get('/api/sessions/:id', api.sessions.find);
app.put('/api/sessions/:id', api.sessions.update);
app.post('/api/sessions', api.sessions.create);

// Geo Routes

app.get('/api/geo/geocode', api.geo.geocode);
app.get('/api/geo/reverse_geocode', api.geo.reverse_geocode);
app.get('/api/geo/neighborhoods', api.geo.neighborhoods);
app.get('/api/geo/city', api.geo.city);

//
// INITIALIZE SERVER
//
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
