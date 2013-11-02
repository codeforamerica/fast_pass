'use strict';

// ************************************************************************
// 
// CONTROLLERS
//
// ************************************************************************

(function (ng) {


  var controllers = ng.module(APPLICATION_NAME + '.controllers', []);

  //
  // Application Controller - Handles basic functionality of the app
  //

  controllers.controller('ApplicationCtrl', ['$rootScope', '$location', 'Session',
    function ($rootScope, $location, Session) {
      var lastStep = Session.get('last_step');

      var goToLastStep = function () {
        if (lastStep) $location.path('section/' + lastStep);
      }

      var onBeforeUnload = function () {
        Session.save(); 
      }

      goToLastStep();

      window.onbeforeunload = onBeforeUnload;
    }
  ]);

  //
  // Dialog Controller - Allows user to reset session when visiting
  //                     the page for a second time.
  //

  controllers.controller('DialogCtrl', ['$scope', 'Session',
    function ($scope, Session) {

      var showDialog = Session.isPersisted();

      var $main   = document.getElementById('main');
      var $dialog = document.getElementById('dialog');

      var show = function () {
        showDialog = true;
        $dialog.style.marginTop = '0';
      }

      var hide = function () {
        showDialog = false;
        $dialog.style.marginTop = '-200px';
      }

      var resetSession = function () {
        Session.reset();
        Session.save();
        dismissDialog();
      }

      var dismissDialog = function () {
        if (showDialog) {
          hide(); 
        }
      }

      ng.element($main).bind('click', dismissDialog);

      $scope.reset   = resetSession;
      $scope.dismiss = dismissDialog;

      if (showDialog) {
        setTimeout(show, 800);
      }
    }
  ]);

  //
  // Section 10 - What kind of business are you?
  //

  controllers.controller('10Ctrl', ['$scope', 'Session', 'NAICSCategory', 'CategoryKeywords',
    function ($scope, Session, NAICSCategory, CategoryKeywords) {

      //
      // NAICS Search
      //

      var resetSearch = function () {
        $scope.results = [];
        $scope.showResults = false;
        $scope.showError = false;
        $scope.showInvalid = false;
        $scope.lastSearch = null;
      } 

      var onSearchSuccess = function (results) {
        $scope.results = results;
        $scope.showLoading = false;
        $scope.showResults = true; 
      }

      var onSearchError = function () {
        $scope.showLoading = false;
        $scope.showError = true;
      }

      var onInvalidTerms = function () {
        $scope.showLoading = false;
        $scope.showInvalid = true; 
      }

      var search = function (keywords) {
        resetSearch();

        if (typeof(keywords) === 'undefined') {
          onInvalidTerms();
          return false;
        }

        $scope.lastSearch  = keywords;
        $scope.showLoading = true;

        Session.set({ naics_keywords: keywords });
        Session.save();

        NAICSCategory.search({ keywords: keywords }, onSearchSuccess, onSearchError)
      }

      var keywords = Session.get('naics_keywords');

      if (keywords) {
        $scope.terms = keywords;
        search(keywords);
      }

      $scope.sampleInput = CategoryKeywords.random();
      $scope.search = search;

      //
      // NAICS Select
      //

      var select = function (item) {
        if (item !== $scope.selected) {
          $scope.selected = item;
          Session.set({ naics_code: item.get('code') });
        } else {
          $scope.selected = null; 
          Session.set({ naics_code: null });
        }

        Session.save();
      } 

      $scope.$watch('results', function () {
        var code = Session.get('naics_code');
        if (code) {
          utils.each($scope.results, function (result) {
            if (result.get('code') == code) $scope.selected = result;
          });
        }
      });

      $scope.select = select;
    }
  ]);

  //
  // Section 15 - Describe your business.
  //

  controllers.controller('15Ctrl', ['$scope', 'Session',
    function ($scope, Session) {
      var save = function () {
        Session.save(); 
      }

      $scope.$watch('description', function (description) {
        if (description) {
          Session.set({ description: description.trim() });
        }
      });

      $scope.description = Session.get('description');
      $scope.save = save
    }
  ]);

  //
  // Section 40 - Search for an address
  //

  controllers.controller('40Ctrl', ['$scope', 'Session', 'Address', 'Map', 'City',
    function ($scope, Session, Address, Map, City) {

      //
      // Address Search
      //

      var perPage = 20;

      var resetSearch = function () {
        $scope.results = []; 
        $scope.showResults = false;
        $scope.showError = false;
        $scope.showInvalid = false;
        $scope.lastSearch = null;
      }

      var onSearchSuccess = function (results) {
        $scope.results = results.slice(0,perPage);
        $scope.showLoading = false;
        $scope.showResults = true;
      }

      var onSearchError = function () {
        $scope.showLoading = false; 
        $scope.showError = true;
      }

      var onInvalidTerms = function () {
        $scope.showLoading = false;
        $scope.showInvalid = true; 
      }

      var search = function (address) {
        resetSearch();

        if (typeof(address) === 'undefined') {
          onInvalidTerms();
          return false;
        }

        $scope.lastSearch  = address;
        $scope.showLoading = true;

        Session.set({ address_keywords: address });
        Session.save();

        Address.search({ address: address }, onSearchSuccess, onSearchError) 
      }

      var address = Session.get('address_keywords');

      if (address) {
        $scope.terms = address;
        search(address);
      }

      $scope.search = search;

      //
      // Address Select
      //

      var select = function (item) {
        if (item !== $scope.selected) {
          $scope.selected = item;
          Session.set({ address: item.get('address') });
        } else {
          $scope.selected = null; 
          Session.set({ address: null });
        }

        Session.save();
      }

      $scope.$watch('results', function () {
        var address = Session.get('address');
        if (address) {
          utils.each($scope.results, function (result) {
            if (result.get('address') == address) $scope.selected = result;
          });
        }
      });

      $scope.select = select;

      //
      // Maps
      //

      var map = new Map();

      $scope.$watch('selected', function (value) {
        if (value) {
          map.clearMarkers();
          map.addMarker(value.get('latitude'), value.get('longitude'));
          map.setCenter(value.get('latitude'), value.get('longitude'));
          map.setZoom(19);
        }
      });

      $scope.map = map;

      //
      // Display city limits overlay
      //

      var onCitySuccess = function (city) {
        $scope.city = city; 
      }

      var onCityError = function () {
        console.log('error') 
      }

      City.find({}, onCitySuccess, onCityError);

      $scope.$watch('city', function (value) {
        if (value) {
          map.addOverlay(value.get('geojson')) 
        }
      });

    }
  ]);

  //
  // Section 41 - Neighborhood selection
  //
  controllers.controller('41Ctrl', ['$scope', 'Session', 'Neighborhood', 'Map',
    function ($scope, Session, Neighborhood, Map) {

      var onSuccess = function (neighborhoods) {
        $scope.neighborhoods = neighborhoods;
      } 

      var onError = function () {
      
      }

      var addOverlay = function (neighborhood) {
        map.addOverlay(neighborhood.get('geojson'));
      }

      var clearOverlays = function () {
        map.clearOverlays();   
      }
      
      var map = new Map();

      var defaultOptions = {
        clickable: false,
        fillColor: '#ff0000',
        fillOpacity: 0,
        strokeWeight: 0
      }

      Neighborhood.all({}, onSuccess, onError)

      $scope.map = map;
      $scope.addOverlay = addOverlay;
      $scope.clearOverlays = clearOverlays;
    }
  ]);

})(angular);
