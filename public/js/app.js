'use strict';

var appName = 'fastpass'

/*************************************************************************
// 
// INITIALIZE JAVASCRIPT
//
// ***********************************************************************/

// String.capitalize() that does the equivalent of text-transform: capitalize
// Works on strings that begin as all caps
String.prototype.capitalize = function() {
	var string = this.toLowerCase().split(' ')
	for (var i = 0; i < string.length; i++) {
		string[i] = string[i].charAt(0).toUpperCase() + string[i].slice(1)
	}
    return string.join(' ')
}

// Array.clean() removes from the array all values that are 'falsy'
// e.g. undefined, null, 0, false, NaN and '' (empty string)
Array.prototype.clean = function() {
	for (var i = 0; i < this.length; i++) {
		if (!this[i]) {
			this.splice(i, 1);
			i--;
		}
	}
	return this;
};

// Array.isArray polyfill (necessary for < IE9)
// reference: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray
if(!Array.isArray) {
  Array.isArray = function (vArg) {
    return Object.prototype.toString.call(vArg) === "[object Array]";
  };
}

// Google maps - give maps.Polygon object a getBounds() method
// see here: http://stackoverflow.com/questions/2177055/how-do-i-get-google-maps-to-show-a-whole-polygon
google.maps.Polygon.prototype.getBounds = function() {
    var bounds = new google.maps.LatLngBounds();
    var paths = this.getPaths();
    var path;        
    for (var i = 0; i < paths.getLength(); i++) {
        path = paths.getAt(i);
        for (var ii = 0; ii < path.getLength(); ii++) {
            bounds.extend(path.getAt(ii));
        }
    }
    return bounds;
}

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
// INITIALIZE ANGULAR
//
// ***********************************************************************/


// Declare app level module which depends on filters, and services
var app = angular.module(appName, [appName+'.controllers', 'dof.ui.modal', 'dof.ui.collapse', 'ui.map', 'ui.event', 'ngSanitize', 'ngRoute', 'ngResource']);

// Set up application routes
app.config(['$routeProvider', function ($routeProvider) {
	$routeProvider.
		when('/', {
			templateUrl: '/partials/start',
			controller: 'sectionStart'
		}).
		when('/section/:sectionId', {
			templateUrl: _getSectionTemplate,
			controller: 'sectionGo'
		}).
		when('/print', {
			templateUrl: '/partials/print'
		}).
		otherwise({
			// redirectTo: '/'
			templateUrl: '/partials/404'
		});
}]);

app.config(['$locationProvider', function ($location) {
	// This removes the hashbang within URLs for browers that support HTML5 history
	// This should degrade gracefully for non-HTML5 browsers.
	// Note: this also requires the server side routes to be rewritten to accept this.
	// Currently this is disabled because server side routes are not configured.
	// $location.html5Mode(true)
}]);

/*************************************************************************
// 
// SERVICES
//
// ***********************************************************************/

app.factory('WebStorage', [
  function () {

    var driver = new Persist.Store(appName);

    var WebStorage = Model.extend({
      save: function () {
        return driver.set('data', JSON.stringify(this.toJSON()));
      },
      remove: function () {
        return driver.remove('data');
      }
    });

    WebStorage.load = function () {
      var data = driver.get('data');

      if (data) {
        data = JSON.parse(data);
      }

      return new WebStorage(data || {});
    }

    return WebStorage.load();
  }
]);

app.factory('NAICSClassification', ['$resource',
  function ($resource) {
    return $resource('api/categories/naics_search', {}, {
      search: { method: 'GET', params: { keywords: null }, isArray: true }
    });
  }
]);

app.factory('Session', ['$resource', 'WebStorage',
  function ($resource, WebStorage) {

    var API = $resource('api/sessions/:id', { }, {
      find:   { method: 'GET', params: { id: '@id' } },
      update: { method: 'PUT', params: { id: '@id' } },
      create: { method: 'POST' }
    });

    var onSaveSuccess = function (response) {
      session.set(response.data);
      WebStorage.set({ session: session.toJSON() })
      WebStorage.save();
    }

    var onSaveError = function (error) {
      console.log('An error occurred when saving the session');
    }

    var Session = Model.extend({
      defaults: {
        naics_classification: null,
        planning_use: null,
        business_category: null 
      },
      reset: function () {
        this.attributes = utils.defaults(this.defaults, {});
        this.save();
      },
      save: function () {
        var session = this;

        if (this.isPersisted()) {
          API.update({ id: 1 }, onSaveSuccess, onSaveError); 
        } else {
          API.create({ id: 1 }, onSaveSuccess, onSaveError);
        }

        return session;
      },
      isPersisted: function () {
        return typeof(this.get('id')) !== 'undefined';
      }
    });

    Session.findOrCreate = function () {
      var sessionData;

      sessionData = WebStorage.get('session');

      return new Session( sessionData || {} );
    }

    return Session.findOrCreate();
  }
]);

// This sets up a 'UserData' service so that information collected by
// user input can be carried across the application
app.factory('UserData', function () {
	// Only create this empty object if there's no localStorage in place
	if (_checkLocalStorage() == false) {
		return _resetUserData()
	} else {
		// return the thing in localStorage
		return _loadLocalStorage()
	}
})

app.factory('MapService', function () {
	return {
		showMap: false,
		map: null,
		neighborhood: null,
		parcel: {
			lat: null,
			lng: null,
			geometry: null
		},
		clicked: {
			latLng: null,
			lat: null,
			lng: null
		},
		point: {
			latlng: [],
			lat: null,
			lng: null
		},
		viewportBounds: [
			[36.16671, -115.14953],
			[36.16794, -115.14744]
		]
	}
})


/*************************************************************************
// 
// FILTERS
//
// ***********************************************************************/

app.filter('newlines', function () {
    return function(text) {
    	if (text) {
	        return text.replace(/\n/g, '<br>');
	  	}
    }
})

app.filter('no-html', function () {
    return function(text) {
        return text
                .replace(/&/g, '&amp;')
                .replace(/>/g, '&gt;')
                .replace(/</g, '&lt;');
    }
})

/*************************************************************************
// 
// DIRECTIVES
//
// ***********************************************************************/

// Alternate way of declaring directives (and controllers, below). 
// See: http://egghead.io/lessons/angularjs-thinking-differently-about-organization
var directives = {}
app.directive(directives)

// Actions to be done when loading a part-screen section with map
directives.showMap = function (MapService) {
	return function (scope, element) {

		// Retrieve elements and wrap as jQLite
		var $mainEl = angular.element(document.getElementById('left'))

		// Check to make sure it's not already part-screen
		// .hasClass is used because other classes might be on the element
		if (!$mainEl.hasClass('partscreen')) {

			// Set the appropriate CSS classes
			$mainEl.addClass('partscreen').removeClass('fullscreen')
			element.addClass('section-map')
	
			// Activate map
			MapService.showMap = true
		}

	}
}

// Actions to be done when loading a full-screen section with map
directives.hideMap = function (MapService) {
	return function () {

		// Retrieve elements and wrap as jQLite
		var $mainEl = angular.element(document.getElementById('left'))

		// Check to make sure it's not already full-screen
		if (!$mainEl.hasClass('fullscreen')) {

			// Set the appropriate CSS classes
			$mainEl.addClass('fullscreen').removeClass('partscreen')
	
			// Deactivates map so it doesn't interfere with other things on the page (.e.g. scrollfix)
			MapService.showMap = false
		}
	}
}

// Make a modal
directives.modalLink = function () {
	return {
		restrict: 'A',
		scope: {
			title: '@',
			text: '@'
		},
		// templateUrl: '/partials/_modal.html',
		link: function (scope, element) {
			element.bind('click', function() {
				// This gets bound to the contents of the modal window, not the link itself.
//				alert('Open a modal')
			})
			// ?????
		}
	}
}


// Use with an a.button element where it needs to be given the class 
// 'disabled' until some condition is true
directives.buttonDisable = function () {
	return function (scope, element, attrs) {

		scope.$watch(attrs.buttonDisable, function (value) {
			if (value) {
				element.removeClass('disabled')
			} else {
				element.addClass('disabled')				
			}
		})
	}
}

directives.radioSelect = function () {
	// Used on:
	// - Step 10 (NAICS search results)
	// - Step 40 (Address search results)
	return {
		restrict: 'A',
		link: function (scope, element, attrs) {

			// This directive allows for custom text to be displayed when it is clicked,
			// provided in the form of a 'selected-text' attribute.
			// If custom text is not provided, it will default to 'Selected'
			var text = attrs.selectedText
			if (!text) {
				text = 'Selected'
			}

			// Store the original text of the button
			var originalText = element.text()

			// Action to perform when the button is clicked
			element.bind('click', function () {

				// Clear all previous select boxes
				// This is super messy, as it relies on DOM traversal to succeed

				// Probably better to figure out how to do isolate scope on this 
				element.parent().parent().children().find('button').text(originalText).removeClass('selected')
				element.parent().parent().children().removeClass('selected')

				// Set current select box to Selected
				element.text(text).addClass('selected')
				element.parent().addClass('selected')
			})

		}
	}
}

directives.scrollfix = function () {
	// Elements with 'scrollfix' directive (placed on the class, for additional CSS)
	// will be fixed in place in the window once its top scrolls to a certain point
	// in the window.
	return {
		restrict: 'C',
		link: function (scope, element, $window) {

			var $page  = angular.element(window)
			var $el    = element[0]
			var margin = 40         // # of pixels to keep as a margin for scrollfix'd element
			var windowScrollTop     = window.pageYOffset   
									// # of pixels that page has scrolled above viewport
			var elScrollTop         = $el.getBoundingClientRect().top
									// # of pixels between top of element and top of viewport
			var elScrollTopOriginal = elScrollTop
									// Remember this for later

			$page.bind('scroll', function () {

				windowScrollTop = window.pageYOffset
				elScrollTop     = $el.getBoundingClientRect().top

				if (elScrollTop <= margin) {
					// if element has scrolled to a point less than the margin,
					// make it a fixed element.
			        element.css('position', 'fixed').css('top', '40px').css('margin-left', '3px');
				}
				if ( windowScrollTop <= elScrollTopOriginal) {
					// if window has scrolled to a point below the original position
					// convert it back to a relatively positioned element.
					element.css('position', 'relative').css('top', '0').css('margin-left', '0');
				}
			})

		}
	}
}

directives.externalLink = function () {
	// Buttons with 'data-external-link' attribute will go to the provided
	// URL when clicked.
	return function (scope, element, attrs) {

		var url = attrs.externalLink

		element.bind('mouseup', function () {
			if (url) {
				window.open(url, '_blank')
			}			
		})

	}
}

directives.progressbar = function () {
	// Show a basic progress bar.
	// Write it in the templates as <progressbar step='X'></progressbar>
	// where X is the position of the bar
	return {
		restrict: 'E',
		replace: true,
		scope: {
			step: '@'
		},
		templateUrl: '/partials/_progressbar',
		link: function (scope, element) {
			var item = element.find('li')

			// remove highlight from all steps
			item.removeClass('highlight')

			// add highlight to the one that matches the given step
			for (var i = 0; i < item.length; i++) {
				if (scope.step == i + 1) {
					// addClass() doesn't work on these, which is SO DUMB
					item[i].className = 'highlight'
				}
			}
		}
	}
}

directives.maxWords = function () {
	return function (scope, element, attrs) {

		var limit       = attrs.maxWords
		scope.count     = 0
		scope.countdown = limit - scope.count

		// Count words on each input event (better than keyup, which doesn't include things like shift/ctrl keys)
		element.bind('input', function () {
			var text = element.val().trim()

			// Find the number of words
			if (text == '') {
				scope.count = 0
			}
			else {
				// Split text on all whitespace
				var array = text.split(/\s+/)
				scope.count = array.length
			}

			// Update the 'words remaining' countdown
			scope.countdown = limit - scope.count

			// Set warning message class
			if (scope.countdown <= 0) {
				scope.warning = 'warning'
			} else {
				scope.warning = null
			}

			// Force a refresh of the view - so it remains up-to-date
			scope.$digest()
		})
	}
}

directives.returnDialog = function () {
	return {
		restrict: 'A',
		templateUrl: '/partials/_return',
		link: function(scope, element, attrs) {
		}
	}
}

directives.staticMap = function () {
	return {
		restrict: 'A',
		template: "<img src='{{staticMapImageUrl}}' alt='Map'>"
	}
}

/* // Might not actually be needed
directives.autofocus = function () {
	return function (scope, element, attrs) {
		// element.focus()
	}
}
*/


/*************************************************************************
// 
// GENERAL CONTROLLERS
// For section-specific controllers, see controllers.js
//
// ***********************************************************************/

var controllers = {}
app.controller(controllers)

controllers.sectionStart = function ($scope) {
	// Nothing
}

controllers.sectionGo = function ($scope, $routeParams, UserData) {
	
	$scope.sectionId = $routeParams.sectionId

	$scope.userdata = UserData

	// Record the current and previous sectionId
	// This allows section controllers to perform logic based on 'back' navigation, if necessary
	// Only do this if the current Id is different (otherwise reloads can mess with this)

	// Hacky thing where it doesn't autosave when you just show up on section 10 (because user
	// hasn't done anything yet)
	if ($scope.sectionId != 10) {
		//_saveLocalStorage(UserData)
	}

}

/*************************************************************************
// 
// FUNCTIONS
//
// ***********************************************************************/


// Dynamically fetch the section template from the URL
function _getSectionTemplate($routeParams) {
	return '/pages/' + $routeParams.sectionId
}

// Callback function for Google Maps API
// Required by this documentation: https://github.com/angular-ui/ui-map
// But it hasn't worked...
/*
function onMapReady() {
	angular.bootstrap(document, [appName]);
}	
*/

/**
*    Get query string for various options
*/ 

function _getQueryStringParams(sParam) {

	// The proper URL formation places the hash AFTER the query string
	// e.g. http://server.com/?key=value#hash
	// so the following does not work with this application
	// var sPageURL = window.location.search.substring(1);

	// The workaround is to parse the hash separately, like so:
	var sPageURL = window.location.href.split('?')[1]
	if (!sPageURL) {
		return
	}

	var sURLVariables = sPageURL.split('&');
	for (var i = 0; i < sURLVariables.length; i++) {
		var sParameterName = sURLVariables[i].split('=');
		if (sParameterName[0] == sParam) {
			return sParameterName[1];
		}
	}
}

function _resetUserData () {
	return { 
		reportId: _generateReportId(),
		businessCategory: {
			code: null,
			name: null,
			description: null
		},
		businessDescription: null,
		additionalBusiness: null,
		naics: {
			code: null,
			title: null,
			year: '2012'
		},
		neighborhood: null,
		property: {
			parcelNumber: null,
			address: null,
			master_address: null,
			ward: null,
			location: {},
			score: null
		},
		rawInputs: {
			businessSearch: [],
			addressSearch: []
		},
		nav: {
			pathTo50: null,
			previous: null,
			current: null
		}
	}
}

function _generateReportId () {
	var id
	var date = new Date()

	// Generate a "report ID" based on date / time
	// Hopefully these are unique!
	var year = date.getUTCFullYear().toString()
	var month = date.getUTCMonth() + 1
	month = month.toString()
	if (month.length == 1) { month = '0' + month }
	var day = date.getUTCDate().toString()
	if (day.length == 1) { day = '0' + day }
	var msec = date.getTime().toString().substring(7,12)

	var string = year + month + day + msec
	string = string.substring(2)
	id = string.replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3")

	// Example ID number:    # 131-010-86260

	return id
}

// localStorage functions
function _checkLocalStorage () {

	// Check for localStorage
	if (!window['localStorage']) {
		console.log('localStorage is not supported on this browser.')
		return false
	}

	// Check to see if this app has previously stored anything in localStorage
	if (window.localStorage.getItem(appName)) {
		return true
	}
	else {
		return false
	}

}

function _loadLocalStorage () {
	console.log('Loading local storage.')
	return JSON.parse(window.localStorage.getItem(appName))
}

function _saveLocalStorage (obj) {
	// Save to localStorage
	if (window['localStorage']) {
		console.log('Saving to local storage.')
		window.localStorage.setItem(appName, JSON.stringify(obj))
	}
}

function _clearLocalStorage () {
	// Clear localStorage
	if (window['localStorage']) {
		console.log('Clearing local storage.')
		window.localStorage.removeItem(appName)
	}
}
