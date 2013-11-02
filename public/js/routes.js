/*************************************************************************
// 
// ROUTES
//
// ***********************************************************************/

function _getSectionTemplate($routeParams) {
	return '/pages/' + $routeParams.sectionId
}

var routes = angular.module(APPLICATION_NAME + '.routes', ['ngRoute']);

routes.config(['$routeProvider',

  function ($routeProvider) {
    $routeProvider.
    when('/', {
      templateUrl: '/partials/start',
      controller: 'ApplicationCtrl'
    }).
    when('/section/:sectionId', {
      templateUrl: _getSectionTemplate,
      controller: 'ApplicationCtrl'
    }).
    when('/print', {
      templateUrl: '/partials/print'
    }).
    otherwise({
      // redirectTo: '/'
      templateUrl: '/partials/404'
    });
  }

]);
