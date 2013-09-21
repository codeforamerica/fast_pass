'use strict';

// Declare app level module which depends on filters, and services

var app = angular.module('dof', ['dof.controllers', 'ui.bootstrap']);

app.config(['$routeProvider', function($routeProvider) {
	$routeProvider.
		when('/',                   {templateUrl: '/partials/start.html', controller: 'sectionStart'}).
		when('/section/:sectionId', {templateUrl: _getSectionTemplate,    controller: 'sectionGo'}).
		otherwise({redirectTo: '/'});
}]);

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
			input: null,
			code: null,
			title: null,
			year: '2012'
		},
		property: {
			parcelNumber: null,
			address: null,
			ward: null
		}
	}
})

var directives = {}
app.directive(directives)

directives.showMap = function () {
	return function (scope, element) {
		// Actions to be done when loading a part-screen section with map

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
	return function () {
		// Actions to be done when loading a full-screen section with map

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
	// Currently only used on Step 10 (NAICS search results)
	return function (scope, element, attrs) {

		var isSelected = false

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
			element.parent().parent().children().find('button').text(originalText).removeClass('selected')
			element.parent().parent().children().removeClass('selected')

			// Set current select box to Selected
			element.text(text).addClass('selected')
			element.parent().addClass('selected')
		})

	}
}

directives.scrollfix = function () {
	return {
		restrict: 'C',
		link: function (scope, element, $window) {

			var $el   = angular.element(element[0])
			var $page = angular.element(window)
			var scrollTemp

			$page.bind('scroll', function () {

				if ( $page.pageYOffset > $el.offsetTop - 40) {
					scrollTemp = $el.offsetTop - 40
			        $el.css('position', 'fixed').css('top', '40px').css('margin-left', '10px');
				}
				else if ( $page.pageYOffset < scrollTemp) {
					$el.css('position', 'relative').css('top', '0').css('margin-left', '7px');
				}
			})

		}
	}
}

directives.externalLink = function () {
	return function (scope, element, attrs) {

		var url = attrs.externalLink

		element.bind('mouseup', function () {
			if (url) {
				window.open(url, '_blank')
			}			
		})

	}
}

var controllers = {}
app.controller(controllers)

controllers.sectionStart = function ($scope) {

	// Ensure that main element is set to fullscreen class (useful if starting over from partscreen view)
//	_initFullscreenSection()
}

controllers.sectionGo = function ($scope, $routeParams) {
	
	$scope.sectionId = $routeParams.sectionId

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

	// Manually focus on autofocus form elements
	$('[autofocus]').focus()

}

// Dynamically fetch the section template from the URL
function _getSectionTemplate($routeParams) {
	return '/partials/sections/' + $routeParams.sectionId + '.html'
}
