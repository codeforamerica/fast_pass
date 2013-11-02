// Raise error unless environment variable is set
if (typeof(process.env.NODE_ENV) === 'undefined') {
  throw('The application environment must be set as an environment variable by the name of `NODE_ENV`');
} else {
  console.log('The application environment is set to: ' + process.env.NODE_ENV);
}

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
app.use(express.bodyParser());
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

// Geocode Routes
app.get('/api/geocode/address', api.geo.geocodeAddress);
app.get('/api/geocode/position', api.geo.geocodePosition);

// Category Routes
app.get('/api/categories/naics', api.categories.naics_search);
app.get('/api/categories/business_licensing', api.categories.business_licensing_search)

// Session Routes
app.get('/api/sessions/:id', api.sessions.find);
app.put('/api/sessions/:id', api.sessions.update);
app.post('/api/sessions', api.sessions.create);

// Neighborhood Routes
app.get('/api/neighborhoods', api.neighborhoods.index);

//
// INITIALIZE SERVER
//
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
