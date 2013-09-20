'use strict';

// Declare app level module which depends on filters, and services

var app = angular.module('dof', ['dof.controllers', 'ui.bootstrap']);

app.config(['$routeProvider', function($routeProvider) {
	$routeProvider.
		when('/',                   {templateUrl: '/partials/start.html', controller: 'sectionStart'}).
		when('/section/:sectionId', {templateUrl: _getSectionTemplate,    controller: 'sectionGo'}).
		otherwise({redirectTo: '/'});
}]);

app.factory('Data', function () {
	return { 
		primaryBusinessType: null
	}
})

app.directive('showMap', function () {
	return {
		restrict: 'A',
		link: function (scope, element) {
			// Actions to be done when loading a part-screen section with map

			var mainEl = document.getElementById('main')
			var el = element[0]

			// Check to make sure it's not already part-screen
			if (mainEl.className != 'partscreen') {

				// Set the appropriate CSS classes
				mainEl.className = 'partscreen'
				el.className += ' section-map'
		
				// Activate map
				document.getElementById('map').style.display = 'block'
				map.invalidateSize()
			}

		}
	}
});

app.directive('hideMap', function () {
	return {
		restrict: 'A',
		link: function () {
			// Actions to be done when loading a full-screen section with map

			var mainEl = document.getElementById('main')

			// Check to make sure it's not already full-screen
			if (mainEl.className != 'fullscreen') {

				// Set the appropriate CSS classes
				mainEl.className = 'fullscreen'
		
				// Deactivates map so it doesn't interfere with other things on the page (.e.g. scrollfix)
				document.getElementById('map').style.display = 'none'
			}
		}
	}
});


function sectionStart($scope) {

	// Ensure that main element is set to fullscreen class (useful if starting over from partscreen view)
//	_initFullscreenSection()
}

function sectionGo($scope, $routeParams) {
	
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
