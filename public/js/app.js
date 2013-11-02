'use strict';

/*************************************************************************
// 
// INITIALIZE JAVASCRIPT
//
// ***********************************************************************/

var func = function () {}

var Model = function (attributes) {
  if (typeof(attributes) !== 'undefined' && typeof(attributes) !== 'object') {
    throw("'attributes' must be an instance of 'object'") 
  }
  attributes = attributes || {}
  this.attributes = {}
  attributes = utils.defaults(attributes, this.defaults);
  this.set(attributes)
  this.initialize.apply(this, arguments);
}

utils.extend(Model.prototype, {
  initialize: func,

  attributes: {},

  set: function (attrs) {
    utils.extend(this.attributes, attrs);
    return attrs;
  },

  get: function (attr) {
    return this.attributes[attr]    
  },

  toJSON: function () {
    return this.attributes;
  }
});

Model.extend = function(protoProps, staticProps) {
  var parent = this;
  var child;

  if (protoProps && utils.has(protoProps, 'constructor')) {
    child = protoProps.constructor;
  } else {
    child = function(){ return parent.apply(this, arguments); };
  }

  utils.extend(child, parent, staticProps);

  var Surrogate = function(){ this.constructor = child; };
  Surrogate.prototype = parent.prototype;
  child.prototype = new Surrogate;

  if (protoProps) utils.extend(child.prototype, protoProps);

  child.__super__ = parent.prototype;

  return child;
};


/*************************************************************************
// 
// APPLICATION
//
// ***********************************************************************/

function _getSectionTemplate($routeParams) {
	return '/pages/' + $routeParams.sectionId
}

// Declare app level module which depends on filters, and services
var FastPass = angular.module(APPLICATION_NAME, [
    APPLICATION_NAME+'.controllers',
    APPLICATION_NAME + '.services',
    APPLICATION_NAME + '.directives',
    'ui.map',
    'ngRoute',
    'ngResource'
]);

// Set up application routes
FastPass.config(['$routeProvider', function ($routeProvider) {
	$routeProvider.
		when('/', {
			templateUrl: '/partials/start',
			controller: 'ApplicationCtrl'
		}).
		when('/section/:sectionId', {
			templateUrl: _getSectionTemplate,
			controller: 'ApplicationCtrl'
		}).
		when('/print', {
			templateUrl: '/partials/print'
		}).
		otherwise({
			// redirectTo: '/'
			templateUrl: '/partials/404'
		});
}]);
