'use strict';

// Declare app level module which depends on filters, and services

angular.module('dof', ['dof.controllers']).
	config(['$routeProvider', function($routeProvider) {
		$routeProvider.
			when('/',                   {templateUrl: '/partials/start.html', controller: 'sectionStart'}).
			when('/section/:sectionId', {templateUrl: _getSectionTemplate,    controller: 'sectionGo'}).
			otherwise({redirectTo: '/'});
	}]);

function _getSectionTemplate($routeParams) {
	return '/partials/sections/' + $routeParams.sectionId + '.html'
}

function sectionStart($scope) {

	// Ensure that main element is set to fullscreen class (useful if starting over from partscreen view)
	document.getElementById('main').className = 'fullscreen'

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
		document.getElementById('main').className = 'partscreen'
	} else {
		document.getElementById('main').className = 'fullscreen'
	}

	// Auto forward loading screens (FOR DEMO PURPOSES ONLY)
	if ($section.find('.loading').length > 0) {
		var spinner = window.setTimeout(function() {
			window.location.href = window.location.origin + $section.find('a.next').attr('href')
		}, 800)
	}

	// Focus on first form input, textarea, or select, if it exists
	$section.find('input[type=text],textarea,select').filter(':visible:first').focus()

	// Special needs input box
	if ($('#primary-business-input').is(':visible')) {
		$('#primary-business-input').focus()
	}

}