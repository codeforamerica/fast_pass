'use strict';

// ***********************************************************************
// 
// ROUTES
//
// ***********************************************************************

(function (ng) {

  var routes = ng.module(APPLICATION_NAME + '.routes', [ 'ngRoute' ]);

  routes.config(['$routeProvider',

    function ($routeProvider) {
      $routeProvider.

      when('/', {
        templateUrl: '/pages/0',
        controller: '0Ctrl'
      }).

      when('/section/10', {
        templateUrl: '/pages/10',
        controller: '10Ctrl'
      }).

      when('/section/15', {
        templateUrl: '/pages/15',
        controller: '15Ctrl'
      }).

      when('/section/30', {
        templateUrl: '/pages/30',
        controller: '30Ctrl'
      }).

      when('/section/40', {
        templateUrl: '/pages/40',
        controller: '40Ctrl'
      }).

      when('/section/41', {
        templateUrl: '/pages/41',
        controller: '41Ctrl'
      }).

      when('/section/45', {
        templateUrl: '/pages/45',
        controller: '45Ctrl'
      }).

      when('/print', {
        templateUrl: '/partials/print'
      }).

      otherwise({
        templateUrl: '/pages/404'
      });
    }

  ]);

})(angular)
