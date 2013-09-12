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
}

 

AppCntl.$inject = ['$scope', '$route']
function AppCntl($scope, $route) {
 $scope.$route = $route;
 
 // initialize the model to something useful
 $scope.person = {
  name:'anonymous',
  contacts:[{type:'email', url:'anonymous@example.com'}]
 };
}
 
function WelcomeCntl($scope) {
 $scope.greet = function() {
  alert("Hello " + $scope.person.name);
 };
}
 
function SettingsCntl($scope, $location) {
 $scope.cancel = function() {
  $scope.form = angular.copy($scope.person);
 };
 
 $scope.save = function() {
  angular.copy($scope.form, $scope.person);
  $location.path('/welcome');
 };
 
 $scope.cancel();
}
