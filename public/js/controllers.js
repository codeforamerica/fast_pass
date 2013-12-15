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

  controllers.controller('ApplicationCtrl', ['$rootScope', '$location', '$window', 'session',

    function ($rootScope, $location, $window, session) {
      window.session = session;
      $rootScope.$on('$locationChangeSuccess', function () {
        if (session.isLoaded()) session.$save();
      });
    }

  ]);

  //
  // Dialog Controller - Allows user to reset session when visiting
  //                     the page for a second time.
  //

  controllers.controller('DialogCtrl', ['$scope', 'session',

    function ($scope, session) {
      var showDialog = session.isPersisted();

      var $dialog = document.getElementById('dialog');

      var show = function () {
        showDialog = true;
        $dialog.style.marginTop = '0';

        var $main   = document.getElementById('main');
        ng.element($main).bind('click', function () {
          dismissDialog()
        });
      }

      var hide = function () {
        showDialog = false;
        $dialog.style.marginTop = '-200px';
      }

      var resetsession = function () {
        session.reset();
        session.save();
        dismissDialog();
      }

      var dismissDialog = function () {
        if (showDialog) {
          hide();
        }
      }

      $scope.reset   = resetsession;
      $scope.dismiss = dismissDialog;

      if (showDialog) {
        setTimeout(show, 800);
      }
    }

  ]);

  //
  // Section 0 - What is this?
  //

  controllers.controller('0Ctrl', [ '$scope', 'session',

    function ($scope) {
      $scope.section = 0;
    }  

  ]);

  //
  // Section 10 - What kind of business are you?
  //

  controllers.controller('10Ctrl', ['$scope', 'session', 'NAICSCategory', 'CategoryKeywords',

    function ($scope, session, NAICSCategory, CategoryKeywords) {
      $scope.section = 10;

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

        if ( ng.isUndefined(keywords) ) {
          onInvalidTerms();
          return false;
        }

        $scope.lastSearch  = keywords;
        $scope.showLoading = true;

        session.set({ "naics_keywords": keywords });
        session.$save();

        NAICSCategory.search({ keywords: keywords }, onSearchSuccess, onSearchError)
      }

      var keywords = session.get('naics_keywords');

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
        if ( !ng.equals(item, $scope.selected) ) {
          $scope.selected = item;
          session.set({ "naics_code": item.get('code') });
        } else {
          $scope.selected = null; 
          session.set({ "naics_code": null });
        }

        session.$save();
      } 

      $scope.$watch('results', function () {
        var code = session.get('naics_code');
        if (code) {
          ng.forEach($scope.results, function (result) {
            if ( ng.equals(result.get('code'), code) ) $scope.selected = result;
          });
        }
      });

      $scope.select = select;
    }

  ]);

  //
  // Section 15 - Describe your business.
  //

  controllers.controller('15Ctrl', ['$scope', 'session',

    function ($scope, session) {
      $scope.section = 15;
      $scope.$watch('words', function (description) {
        if (description) {
          session.set({ description: description.trim() });
        }
      });
      $scope.words = session.get('description');
    }

  ]);

  controllers.controller('30Ctrl', ['$scope',

    function ($scope) {
      $scope.section = 30;
    }  

  ]);

  //
  // Section 40 - Search for an address
  //

  controllers.controller('40Ctrl', [ '$scope', 'session', 'Address', 'City', 'Map',

    function ($scope, session, Address, City, Map) {
      $scope.section = 40;
      $scope.showRight = true;

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

        if ( ng.isUndefined(address) ) {
          onInvalidTerms();
          return false;
        }

        $scope.lastSearch  = address;
        $scope.showLoading = true;

        session.set({ address_keywords: address });
        session.save();

        Address.search({ address: address }, onSearchSuccess, onSearchError) 
      }

      var address = session.get('address_keywords');

      if (address) {
        $scope.terms = address;
        search(address);
      }

      $scope.search = search;

      //
      // Address Select
      //

      var select = function (item) {
        if ( !ng.equals(item, $scope.selected) ) {
          $scope.selected = item;
          session.set({ address: item.get('address') });
        } else {
          $scope.selected = null; 
          session.set({ address: null });
        }

        session.save();
      }

      $scope.$watch('results', function () {
        var address = session.get('address');
        if (address) {
          ng.forEach($scope.results, function (result) {
            if ( ng.equals(result.get('address'), address) ) $scope.selected = result;
          });
        }
      });

      $scope.select = select;

      //
      // Map
      //

      var map = new Map();

      $scope.$watch('selected', function (value) {
        var latitude, longitude, zoom;

        map.clearMarkers();

        if (value) {
          zoom = 19;
          latitude  = value.get('latitude');
          longitude = value.get('longitude');
          map.addMarker(new Map.Marker(latitude, longitude));
        } else {
          zoom = 11;
          latitude = 36.21205;
          longitude = -115.19395;
        }

        map.setZoom(zoom);
        map.panTo(latitude, longitude);
      });

      $scope.map = map;

      //
      // Display city limits overlay
      //

      var onCityLimitsSuccess = function (cityLimits) {
        $scope.cityLimits = cityLimits;
      }

      var onCityLimitsError = function () {
        $scope.showError = true;
      }

      $scope.$watch('cityLimits', function (value) {
        if (value) {
          var overlay = Map.Overlay.fromGeoJSON(value.get('geometry'));
          overlay.setStrokeWeight(4);
          overlay.setStrokeOpacity(0.1);
          map.addOverlay(overlay);
          map.setBounds(overlay.getBounds());
        }
      });

      City.find({}, onCityLimitsSuccess, onCityLimitsError);
    }

  ]);

  //
  // Section 41 - Neighborhood selection
  //

  controllers.controller('41Ctrl', ['$scope', 'session', 'Neighborhood', 'City', 'Map',

    function ($scope, session, Neighborhood, City, Map) {
      $scope.section = 41;
      $scope.showRight = true;

      var map = new Map();
      var overlays = {}

      var getOverlay = function (area) {
        if ( ng.isDefined(area) ) return overlays[ area.get('id') ];
      }

      var setOverlay = function (area, overlay) {
        if ( ng.isDefined(area) ) overlays[ area.get('id') ] = overlay;
      }

      var showOverlay = function (overlay) {
        if ( ng.isDefined(overlay) ) {
          overlay.setFillOpacity(0.15);
        }
      }

      var hideOverlay = function (overlay) {
        if ( ng.isDefined(overlay) ) {
          overlay.setFillOpacity(0.0);
        }
      }

      var zoomToOverlay = function (overlay) {
        if ( ng.isDefined(overlay) ) {
          map.setBounds( overlay.getBounds() );
        }
      }

      var showArea = function (area) {
        showOverlay( getOverlay(area) );
      }

      var hideArea = function (area) {
        hideOverlay( getOverlay(area) );
      }

      var zoomToArea = function (area) {
        zoomToOverlay( getOverlay(area) );
      }

      var onAreaMouseover = function (area) {
        showArea(area);
      }

      var onAreaMouseout = function (area) {
        if ( !ng.equals($scope.selected, area) ) {
          hideArea(area);
        }
      }

      var select = function (area) {
        if ( !ng.equals($scope.selected, area) ) {
          hideArea($scope.selected);
          showArea(area);
          zoomToArea(area);
        } else {
          hideArea(area);
          zoomToOverlay( getOverlay($scope.city) );
          area = undefined;
        }

        $scope.selected = area;
      }

      //
      // City
      //

      var onCitySuccess = function (city) {
        $scope.city = city;
      }

      var onCityError = function () {
        $scope.showError = true;
      }

      $scope.$watch('city', function (area) {
        if (area) {
          var overlay = Map.Overlay.fromGeoJSON(area.get('geometry'));
          setOverlay(area, overlay);
          overlay.setStrokeWeight(4);
          overlay.setStrokeOpacity(0.1);
          map.addOverlay(overlay);
          zoomToArea(area);
        }
      });

      City.find({}, onCitySuccess, onCityError);

      //
      // Neighborhoods
      //

      var onNeighborhoodSuccess = function (neighborhoods) {
        $scope.neighborhoods = neighborhoods;
        $scope.showError = false;
      }

      var onNeighborhoodError = function () {
        $scope.showError = true;
      }

      $scope.$watch('neighborhoods', function (areas) {
        if (areas) {
          ng.forEach(areas, function (area) {
            var overlay = Map.Overlay.fromGeoJSON(area.get('geometry'));
            setOverlay(area, overlay);
            map.addOverlay(overlay);

            overlay.on('mouseover', function () {
              onAreaMouseover(area);
            });

            overlay.on('mouseout', function () {
              onAreaMouseout(area);
            });

            overlay.on('click', function () {
              select(area);
            });

            overlay.setClickable(true)
          });

          $scope.showNeighborhoods = true;
        } else {
          $scope.showNeighborhoods = false;
        }
      });

      Neighborhood.all({}, onNeighborhoodSuccess, onNeighborhoodError);

      $scope.map = map;
      $scope.select = select;
    }

  ]);

  //
  // Section 45 - Select a parcel
  //

  controllers.controller('45Ctrl', [ '$scope', 'Map',

    function ($scope, Map) {
      $scope.section = 45;
      var map = new Map();
      $scope.map = map;
    }

  ]);

  //
  // Section 50 - Parcel confirmation
  //

  controllers.controller('50Ctrl', [ '$scope', 'Map',

    function ($scope, Map) {
      $scope.section = 50;
      var map = new Map();
      $scope.map = map;
    }

  ]);

})(angular);
