'use strict';

// Declare app level module which depends on filters, and services
var app = angular.module('dof', ['dof.controllers', 'ui.bootstrap']);

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

// This sets up a global 'UserData' object so that information collected by
// user input can be carried across the application
app.factory('UserData', function () {
	return { 
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
		templateUrl: '/partials/_modal.html',
		link: function (scope, element, attrs) {

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
	return function (scope, element, attrs) {

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
			element.parent().parent().children().find('button').text(originalText).removeClass('selected')
			element.parent().parent().children().removeClass('selected')

			// Set current select box to Selected
			element.text(text).addClass('selected')
			element.parent().addClass('selected')
		})

	}
}

directives.scrollfix = function () {
	// Elements with 'scrollfix' directive (placed on the class, for additional CSS)
	// will be fixed in place in the window once its top scrolls to a certain point
	// in the window.
	return {
		restrict: 'C',
		link: function (scope, element, $window) {

			var $page = angular.element(window)
			var $el   = element[0]
			var elScrollTopOriginal = $($el).offset().top - 40

			$page.bind('scroll', function () {

				var windowScrollTop = $page[0].pageYOffset
				var elScrollTop     = $($el).offset().top
				// FUCK YEAH JQUERY

				if ( windowScrollTop > elScrollTop - 40) {
					elScrollTopOriginal = elScrollTop - 40
			        element.css('position', 'fixed').css('top', '40px').css('margin-left', '3px');
				}
				else if ( windowScrollTop < elScrollTopOriginal) {
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
