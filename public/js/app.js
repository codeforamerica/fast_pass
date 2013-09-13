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
	// Nothing
}

function sectionGo($scope, $routeParams) {
	
	$scope.sectionId = $routeParams.sectionId

	// DOM id for jQuery
	var sectionId = '#section' + $scope.sectionId

	// Change width of screen based on class
	if ($(sectionId).attr('class') == 'section-map') {
		$('#main').removeClass('fullscreen').addClass('partscreen')
	} else {
		$('#main').removeClass('partscreen').addClass('fullscreen')
	}

	// _initSection()
}