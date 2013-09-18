'use strict';

// Declare app level module which depends on filters, and services

angular.module('dof', ['dof.controllers', 'ui.bootstrap']).
	config(['$routeProvider', function($routeProvider) {
		$routeProvider.
			when('/',                   {templateUrl: '/partials/start.html', controller: 'sectionStart'}).
			when('/section/:sectionId', {templateUrl: _getSectionTemplate,    controller: 'sectionGo'}).
			otherwise({redirectTo: '/'});
	}]);

function sectionStart($scope) {

	// Ensure that main element is set to fullscreen class (useful if starting over from partscreen view)
	_initFullscreenSection()
}

function sectionGo($scope, $routeParams) {
	
	$scope.sectionId = $routeParams.sectionId

	// DOM id for jQuery
	var sectionId = '#section' + $scope.sectionId,
		$section = $(sectionId)

	// Note: this DOM manipulation after the template has loaded may not be the most Angular-friendly way of
	// doing this and may not even work in IE8

	// Change width of screen based on class
	if ($section.attr('class') == 'section-map') {
		_initPartscreenSection()
	} else {
		_initFullscreenSection()
	}

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

// Actions to be done when loading a full-screen section
function _initFullscreenSection() {
	// Set the appropriate CSS class
	document.getElementById('main').className = 'fullscreen'

	// Deactivates map so it doesn't interfere with other things on the page (.e.g. scrollfix)
	document.getElementById('map').style.display = 'none'
}

// Actions to be done when loading a part-screen section
function _initPartscreenSection() {
	// Set the appropriate CSS class
	document.getElementById('main').className = 'partscreen'

	// Activate map
	document.getElementById('map').style.display = 'block'
	map.invalidateSize()
}
