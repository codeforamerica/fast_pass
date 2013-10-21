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
  , http = require('http')
  , path = require('path')
  , lessMiddleware = require('less-middleware');

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
app.use(lessMiddleware({
    src: __dirname + '/public/less',
    dest: __dirname + '/public/css',
    prefix: '/css',
    once: true,
    compress: true,
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
app.get('/parcels/search', routes.parcel.search);
app.get('/parcels', routes.parcel.index);
app.get('/parcels/:id', routes.parcel.find)

// Geocode Routes
app.get('/geocode/address', routes.geo.geocodeAddress);
app.get('/geocode/position', routes.geo.geocodePosition);

// Category Routes
app.get('/categories/naics_search', routes.category.naics_search);
app.get('/categories/business_licensing', routes.category.business_licensing)

// Session Routes
app.put('/sessions/:id', routes.session.update);
app.post('/sessions', routes.session.create);
app.get('/sessions/:id', routes.session.find);

//
// INITIALIZE SERVER
//
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
