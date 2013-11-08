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

  controllers.controller('ApplicationCtrl', ['$rootScope', '$location', '$window', 'Session',
    function ($rootScope, $location, $window, Session) {
      var lastStep = Session.get('last_step');

      var goToLastStep = function () {
        if (lastStep) $location.path('section/' + lastStep);
      }

      var onBeforeUnload = function () {
        Session.save(); 
      }

      $rootScope.$on('$locationChangeSuccess', function () {
        Session.save();
      });

      goToLastStep();

      $window.onbeforeunload = onBeforeUnload;
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
  // Section 0 - What is this?
  //

  controllers.controller('0Ctrl', [ '$scope',

    function ($scope) {

      $scope.section = 0;
    
    }  

  ]);

  //
  // Section 10 - What kind of business are you?
  //

  controllers.controller('10Ctrl', ['$scope', 'Session', 'NAICSCategory', 'CategoryKeywords',
    function ($scope, Session, NAICSCategory, CategoryKeywords) {

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
        if ( !ng.equals(item, $scope.selected) ) {
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

  controllers.controller('15Ctrl', ['$scope', 'Session',

    function ($scope, Session) {

      $scope.section = 15;

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

  controllers.controller('30Ctrl', [

    function () {
    
    }  

  ]);

  //
  // Section 40 - Search for an address
  //

  controllers.controller('40Ctrl', [ '$scope', 'Session', 'Address', 'City', 'Map',

    function ($scope, Session, Address, City, Map) {

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
        if ( !ng.equals(item, $scope.selected) ) {
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

  controllers.controller('41Ctrl', ['$scope', 'Session', 'Neighborhood', 'City', 'Map',
    function ($scope, Session, Neighborhood, City, Map) {

      $scope.section = 41;
      $scope.showRight = true;

      var map = new Map();
      var overlays = {}

      var getOverlay = function (area) {
        if ( ng.isDefined(area) ) return overlays[ area.get('name') ];
      }

      var setOverlay = function (area, overlay) {
        if ( ng.isDefined(area) ) overlays[ area.get('name') ] = overlay;
      }

      var showOverlay = function (overlay) {
        if ( ng.isUndefined(overlay) ) {
          return false;
        } else {
          overlay.setFillOpacity(0.15);
        }
      }

      var hideOverlay = function (overlay) {
        if ( ng.isUndefined(overlay) ) {
          return false;
        } else {
          overlay.setFillOpacity(0.0);
        }
      }

      var zoomToOverlay = function (overlay) {
        if ( ng.isUndefined(overlay) ) {
          return false;
        } else {
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
          $scope.selected = area;
          showArea(area);
          zoomToArea(area);
        } else {
          $scope.selected = undefined;
          hideArea(area);
          zoomToOverlay( getOverlay($scope.city) );
        }
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

      $scope.map = map;

      $scope.onAreaMouseover = onAreaMouseover;
      $scope.onAreaMouseout = onAreaMouseout;

      $scope.select = select;

      Neighborhood.all({}, onNeighborhoodSuccess, onNeighborhoodError)
    }
  ]);

  //
  // Section 45 - Select a parcel
  //

  controllers.controller('45Ctrl', [ '$scope', 'Map',

    function ($scope, Map) {
      var map = new Map();
      $scope.map = map;
    }

  ]);

  //
  // Section 50 - Parcel confirmation
  //

  controllers.controller('50Ctrl', [ '$scope', 'Map',

    function ($scope, Map) {
      var map = new Map();
      $scope.map = map;
    }

  ]);

})(angular);
