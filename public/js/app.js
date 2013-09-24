'use strict';

// Declare app level module which depends on filters, and services
var app = angular.module('dof', ['dof.controllers', 'dof.ui.modal', 'dof.ui.collapse', 'ngSanitize']);

// Set up application routes
app.config(['$routeProvider', function($routeProvider) {
	$routeProvider.
		when('/', {
			templateUrl: '/partials/start.html',
			controller: 'sectionStart'
		}).
		when('/section/:sectionId', {
			templateUrl: _getSectionTemplate,
			controller: 'sectionGo'
		}).
		when('/print', {
			templateUrl: '/partials/print.html'
		}).
		otherwise({
			// redirectTo: '/'
			templateUrl: '/partials/404.html'
		});
}]);

// This sets up a 'UserData' service so that information collected by
// user input can be carried across the application
app.factory('UserData', function () {
	return { 
		reportId: Math.floor(Math.random() * 100000000),
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
			prev: null
		}
	}
})

app.factory('MapService', function () {
	return {
		clicked: {
			latlng: [],
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

app.factory('ModalService', function () {
	// Create a service for a modal???
	return {
		title: null,
		text: null
	}
})

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


// Alternate way of declaring directives (and controllers, below). See: http://egghead.io/lessons/angularjs-thinking-differently-about-organization
var directives = {}
app.directive(directives)

directives.showMap = function () {
	// Actions to be done when loading a part-screen section with map
	return function (scope, element) {

		// Retrieve elements and wrap as jQLite
		var $mainEl = angular.element(document.getElementById('main'))

		// Check to make sure it's not already part-screen
		// .hasClass is used because other classes might be on the element
		if (!$mainEl.hasClass('partscreen')) {

			// Set the appropriate CSS classes
			$mainEl.addClass('partscreen').removeClass('fullscreen')
			element.addClass('section-map')
	
			// Activate map
			document.getElementById('map').style.display = 'block'
			map.invalidateSize()
		}

	}
}

directives.hideMap = function () {
	// Actions to be done when loading a full-screen section with map
	return function () {

		// Retrieve elements and wrap as jQLite
		var $mainEl = angular.element(document.getElementById('main'))

		// Check to make sure it's not already full-screen
		if (!$mainEl.hasClass('fullscreen')) {

			// Set the appropriate CSS classes
			$mainEl.addClass('fullscreen').removeClass('partscreen')
	
			// Deactivates map so it doesn't interfere with other things on the page (.e.g. scrollfix)
			document.getElementById('map').style.display = 'none'
		}
	}
}

directives.modal = function () {
	// Make a modal
	return {
		restrict: 'A',
		scope: {
			title: '@',
			text: '@'
		},
		templateUrl: '/partials/_modal.html',
		link: function (scope, element) {

			// ?????
		}
	}
}


directives.buttonDisable = function () {
	// Use with an a.button element where it needs to be given the class 
	// 'disabled' until some condition is true
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
		templateUrl: '/partials/_progressbar.html',
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


/* // Might not actually be needed
directives.autofocus = function () {
	return function (scope, element, attrs) {
		// element.focus()
	}
}
*/

var controllers = {}
app.controller(controllers)

controllers.sectionStart = function ($scope) {
	// Nothing
}

controllers.sectionGo = function ($scope, $routeParams, UserData) {
	
	$scope.sectionId = $routeParams.sectionId
	$scope.userdata = UserData

	// Somewhere in here should be the logic for saving to LocalStorage or retrieving it

	// DOM id for jQuery
	var sectionId = '#section' + $scope.sectionId,
		$section = $(sectionId)

	// Note: this DOM manipulation after the template has loaded may not be the most Angular-friendly way of
	// doing this and may not even work in IE8

	// Auto forward loading screens (FOR DEMO PURPOSES ONLY)
	if ($section.find('.loading').length > 0) {
		var spinner = window.setTimeout(function() {
			window.location.href = window.location.origin + $section.find('a.next').attr('href')
		}, 800)
	}
}

// Dynamically fetch the section template from the URL
function _getSectionTemplate($routeParams) {
	return '/partials/sections/' + $routeParams.sectionId + '.html'
}
