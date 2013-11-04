'use strict';

// ***********************************************************************
// 
// ROUTES
//
// ***********************************************************************

(function (ng) {

  function _getSectionTemplate($routeParams) {
    return '/pages/' + $routeParams.sectionId
  }

  var routes = ng.module(APPLICATION_NAME + '.routes', ['ngRoute']);

  routes.config(['$routeProvider',

    function ($routeProvider) {
      $routeProvider.
      when('/', {
        templateUrl: '/partials/start',
        controller: 'SectionCtrl'
      }).
      when('/section/:sectionId', {
        templateUrl: _getSectionTemplate,
        controller: 'SectionCtrl'
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

})(angular)
