'use strict';

// Declare app level module which depends on filters, and services
angular.module('dof', ['dof.controllers']).
	config(['$routeProvider', function($routeProvider) {
		$routeProvider.
			when('/',        {templateUrl: '/partials/start.html',    controller: 'sectionStart'}).
			when('/section/:sectionId', {templateUrl: '/partials/section.html',  controller: 'sectionGo'}).
			otherwise({redirectTo: '/'});
  }]);

/*					include sections/12
					include sections/15
					include sections/20
					include sections/30
					include sections/31
					include sections/39
					include sections/39b
					include sections/40
					include sections/41
					include sections/45
					include sections/50
					include sections/70
*/


function sectionStart($scope) {
}
function sectionGo($scope, $routeParams) {

	$scope.sectionId = $routeParams.sectionId

}



angular.module('dof.controllers', []).
	controller('sectionStart', [function() {

	}])
	.controller('section10', [function() {

	}]);

 

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
