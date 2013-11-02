'use strict';

// ************************************************************************
// 
// CONTROLLERS
//
// ************************************************************************

(function (ng) {

  var SAMPLE_INPUTS = [
    'coffee shop',
    'automotive detail',
    'hairdresser',
    'internet retail',
    'women\'s clothing',
    'shoes',
    'interior designer',
    'furniture store',
    'lounge',
    'legal aid',
    'optometrist',
    'graphic design',
    'computer repair',
    'marketing',
    'bicycle shop' 
  ];

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

  controllers.controller('10Ctrl', ['$scope', 'Session', 'NAICSCategory',
    function ($scope, Session, NAICSCategory) {

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

      $scope.sampleInput = utils.random(SAMPLE_INPUTS);
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

  //controllers.controller('41Ctrl', ['$scope', 'Neighborhood'
  //  function ($scope, Neighborhood) {
  //  }
  //]);

  // SECTION 45 - ZONING MAP VIEW
  controllers.controller('45Ctrl', function ($scope, UserData) {
    $scope.userdata  = UserData
    $scope.userdata.nav.pathTo50 = 45    // Remember the current section to preserve path in the future

    // Reset view
    $scope.loading   = true
    $scope.errorMsg  = false
    $scope.loaded    = false

    // There needs to be ACTUAL DATA GETTING GOT FROM SOMEWHERE!
    var fakeloading  = window.setTimeout(function () {
      $scope.loading = false
      $scope.loaded  = true
    }, 400)

  })

  // SECTION 50 - PARCEL VIEW
  controllers.controller('50Ctrl', function ($scope, $http, UserData, MapService) {
    $scope.userdata = UserData
    $scope.mapService = MapService

    // Reset view
    $scope.parcelLoaded  = false
    $scope.searchLoading = false
    $scope.title = 'Retrieving parcel...'
    $scope.downtownIncentives = false
    $scope.showOtherLinks     = false
    $scope.homeOccupancy      = false

    // Switch back navigation based on user's path
    if ($scope.userdata.nav.pathTo50 == 45) {
      $scope.previousIsZoningOverview = true
      $scope.previousIsAddressSearch = false
    } else {
      // Assume address search is the default condition.
      $scope.previousIsZoningOverview = false
      $scope.previousIsAddressSearch = true
    }

    $scope._checkZoning = function (zones) {
      // assume zones is an array of zones
      for (var i=0; i < zones.length; i++) {
        // Check if zones affect anything and then update view elements accordingly.
        if (zones[i].designation == 'DCP-O') {
          // Las Vegas downtown overlay
          $scope.downtownIncentives = true
        }
        if (zones[i].type == 'residential') {
          $scope.homeOccupancy = true
        }
      }
    }

    // Don't do any new loading if user pressed 'back' - just display the data.
    if ($scope.userdata.nav.previous >= 50) {

      // Read parcel data from UserData
      $scope.parcel = $scope.userdata.property

      // Check zoning status and update the view
      $scope._checkZoning($scope.parcel.zones)

      // Send the parcel geometry to MapService
      $scope.mapService.parcel.geometry = $scope.parcel.geometry

      // Set display
      $scope.title = $scope.parcel.address.capitalize()
      $scope.parcelLoaded  = true

      return
    }

    $scope._getParcelGeom = function (lat, lng, callback) {
      // Save parcel geometry
      // Get the parcel given a latlng point from the parcel API
      var parcelGeomUrl = 'http://las-vegas-zoning-api.herokuapp.com/areas' + '?lat=' + lat + '&lon=' + lng
      $http.get(parcelGeomUrl)
      .success( function (response, status) {
        // Execute callback function
        if (typeof callback === "function") {
          callback(response)
        }
        return response
      })
      .error( function (response, status) {
        console.log('Error getting GeoJSON file: ' + parcelGeomUrl)
        return ''
      })
    }

    // Request URL endpoint
    var parcelRequestEndpoint = '/api/parcels/search?position='
    // latlng= URL query string format needs to look like this:
    // latlng=36.167352999999999,-115.148408
    // e.g. += lat + ',' + lng

    // Get locations
    var parcelLat = $scope.userdata.property.location.y
    var parcelLng = $scope.userdata.property.location.x

    if (!parcelLat || !parcelLng) {
      $scope.errorMsg = 'No parcel provided.'
      return false
    }

    // Assemble search endpoint URL based on user input
    var parcelRequestURL = parcelRequestEndpoint + parcelLat + ',' + parcelLng

    // Turn on loader
    $scope.searchLoading = true

    // AJAX it
    $http.get(parcelRequestURL).
    success( function (response) {

      // Turn off loader
      $scope.searchLoading = false

      // Extract results from response
      var results = response.results[0]

      // Read results
      if (!results.LATLNG) {
        // Note: This error check may need to be different.

        // Display error message
        $scope.errorMsg = 'Parcel not found.'

      } else {
        // String formatting
        var masterAddress = results.STRNO + ' ' + results.STRDIR + ' ' + results.STRNAME + ' ' + results.STRTYPE
        masterAddress = masterAddress.capitalize()

        // Load in parcel data
        $scope.parcel = {
          number:          results.PARCEL,
          address:         $scope.userdata.property.address,
          master_address:  masterAddress,
          record_address: [
            '(unknown)'
          ],
          ward:            results.WARD,
          zones:            [
            {
              designation:   results.ZONING,
              name:          null,
              type:          null,
              score:         null,
              color:         'green'
            },
            { 
              // FAKE EXTRA ZONE INFO!!!!!
              designation:   'DCP-O',
              name:          null,
              type:          null,
              score:         null,
              color:         'yellow'
            }
          ],
          tax_district:    results.TAXDIST,
          zip:             results.ZIP,
          owner:           results.OWNER,
          owner_address:   [
            results.ADDRESS1,
            results.ADDRESS2,
            results.ADDRESS3,
            results.ADDRESS4,
            results.ADDRESS5
          ],
          location:        {
            lat:           parcelLat,
            lng:           parcelLng,
            x:             parcelLng,
            y:             parcelLat
          },
          geometry:        null,
          // FAKE BUILDING DATA!!!!
          buildings:       [
            {
              unitNumber:    '495A',
              occupancyType: 'A2',
              occupancyName: 'Assembly',
              color:         'green'
            },
            {
              unitNumber:    '498B',
              occupancyType: 'R1',
              occupancyName: 'Residential',
              color:         'yellow'
            }
          ],
          landuse:         [
            'Commercial'
          ]
        }

        // Get parcel geometry and save it to the user data & map service
        $scope._getParcelGeom(parcelLat, parcelLng, function (geom) {
          $scope.parcel.geometry = geom
          $scope.mapService.parcel.geometry = geom
          // Also get the parcel geometry separately, because the city endpoint above doesn't do it.
          // We'll do this by sending a signal to the MapService about displaying a parcel.
          // TODO: VERIFY IF THIS IS NEEDED
          /*
          if (!geom) {
            $scope.mapService.parcel = {
              lat: parcelLat,
              lng: parcelLng
            }
          }
          */
        })

        // Fill in additional zoning data from our static data file
        var zoningData = '/data/zone-types.json'
        $http.get(zoningData)
        .success(function (response, status) {
          for (var i=0; i < $scope.parcel.zones.length; i++) {
            var zones = response
            var zone  = $scope.parcel.zones[i]
            var designation = zone.designation
            // Default values
            zone.name = '(unknown zone)'
            zone.type = 'unknown'
            zone.page_reference = '(unknown)'
            // Replace it with actual values
            for (var j=0; j < zones.length; j++) {
              if (designation == zones[j].designation) {
                zone.name = zones[j].name
                zone.type = zones[j].type
                zone.page_reference = zones[j].page_reference
              }
            }
            // Fake score data ?? 
            // ----
          }
          // Check zoning status and update the view
          $scope._checkZoning($scope.parcel.zones)
        })
        .error(function (response, status) {
          console.log('Error getting zoning type data.')
        });

        // Cleanup
        $scope.parcel.owner_address.clean()
        $scope.userdata.property = $scope.parcel
        // Save everything
        _saveLocalStorage($scope.userdata)

        // Set display
        $scope.title = $scope.parcel.address.capitalize()
        $scope.parcelLoaded  = true

      }
    }).
    error( function () {
      $scope.searchLoading = false
      $scope.errorMsg = 'Error loading parcel data.'
    })

  })


  // SECTION 70 - Overview
  controllers.controller('70Ctrl', function ($scope, UserData) {

    $scope.userdata = UserData

    $scope.parcel  = $scope.userdata.property

  })

  // MAP CONTROLLER - Everything map related
  controllers.controller('MapCtrl', function ($scope, $http, MapService, UserData) {

    $scope.mapService   = MapService
    $scope.userdata     = UserData
    $scope.isMapViewSet = false

    $scope.mapStyles = [
      {
        featureType: 'road',
        elementType: 'labels',
        stylers: [
          { visibility: 'on' }
        ]
      },{
        featureType: 'landscape.natural',
        elementType: 'geometry.fill',
        stylers: [
          { hue: '#f1f1fb' },
          { saturation: -50 },
          { lightness: 40 }
        ]
      },{
        featureType: 'landscape.man_made',
        elementType: 'geometry.fill',
        stylers: [
          // saturation / lightness used instead of color because it retains transparency/shadows on 3D buildings
          { hue: '#fbfbff' },
          { saturation: -50 },
          { lightness: 40 }
        ]
      },{
        featureType: 'landscape.man_made',
        elementType: 'geometry.stroke',
        stylers: [
          { visibility: 'on' },
          { color: '#a1a1a1' }
        ]
      },{
        featureType: 'road',
        elementType: 'geometry.stroke',
        stylers: [
          { color: '#c1c1c1' },
          { weight: 1 }
        ]
      },{
        featureType: 'road.local',
        elementType: 'geometry.fill',
        // saturation / lightness used instead of color because it retains transparency on satellite layer
        stylers: [
          { saturation: -100 },
          { lightness: 0 }
        ]
      },{
        featureType: 'road.highway',
        elementType: 'geometry.fill',
        stylers: [
          { saturation: -100 },
          { lightness: 100 }
          ]
      },{
        featureType: 'road.highway',
        elementType: 'labels.text.fill',
        stylers: [
          { visibility: 'on' },
          { color: '#606060' }
        ]
      },{
        featureType: 'administrative.neighborhood',
        elementType: 'labels.text.fill',
        stylers: [
          { visibility: 'on' },
          { color: '#808080' }
        ]
      },{
        featureType: 'poi',
        elementType: 'labels',
        stylers: [
          { visibility: 'off' }
        ]
      },{
        featureType: 'poi.business',
        elementType: 'labels',
        stylers: [
          { visibility: 'off' }
        ]
      },{
        featureType: 'poi.business',
        elementType: 'geometry.fill',
        stylers: [
          { color: '#d8d8da' }
        ]
      },{
        featureType: 'poi.government',
        elementType: 'geometry.fill',
        stylers: [
          { color: '#d8d8da' }
        ]
      },{
        featureType: 'poi.medical',
        elementType: 'geometry.fill',
        stylers: [
          { color: '#d8d8da' }
        ]
      },{
        featureType: 'poi.place_of_worship',
        elementType: 'geometry.fill',
        stylers: [
          { color: '#d8d8da' }
        ]
      },{
        featureType: 'poi.school',
        elementType: 'geometry.fill',
        stylers: [
          { color: '#d8d8da' }
        ]
      },{
        featureType: 'poi.sports_complex',
        elementType: 'geometry.fill',
        stylers: [
          { color: '#d8d8da' }
        ]
      },{
        featureType: '',
        elementType: '',
        stylers: [
          { property: '' }
        ]
      }
    ];

    $scope.mapOptions = {
      zoom: 13,
      minZoom: 11,
      maxZoom: 19,
      center: new google.maps.LatLng(36.168, -115.144),
      backgroundColor: '#f1f1f4',
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      // streetViewControl: false,
      styles: $scope.mapStyles,
      zoomControlOptions: {
        style: google.maps.ZoomControlStyle.LARGE
      }
    };

    // Initial view variables
    $scope.loading = false
    var infoLoader = "<div class='loading-small' style='margin: 30px 0; text-align: center' ng-show='loading'><img src='img/loading-lite.gif'></div>"

    // Create infowindow instance - we only need one, so let's keep this here.
    $scope.infowindow = new google.maps.InfoWindow({
      content: infoLoader
    })

    // Create overlay holders
    $scope.markers = []
    $scope.parcels = []
    $scope.parcelzzz = []

    // Watch for showMap/hideMap directives triggers.
    $scope.$watch(function() {
      // Argument #1:  the variable to watch
      // For some reason it needs to be returned in a function like this
      // and not give the variable itself
      return $scope.mapService.showMap
    }, function (newValue, oldValue) {
      // Argument #2:  the function that does stuff with the changed variable

      // Google maps API v3 requires developers to manually trigger the resize event
      // when the map div is resized or visibility is changed
      // We do this after the map reports being loaded and idle
      if (newValue == true) {
        $scope._mapInvalidateSize()
      }

    })

    // Set map view per section
    $scope.$watch(function () {
      return $scope.userdata.nav.current
    }, function (newValue, oldValue) {
      if (newValue != oldValue) {
        $scope._setMapView(newValue)
      }
    })

    // Set map view per section
    $scope.$watch(function () {
      return $scope.mapService.neighborhood
    }, function (newValue, oldValue) {
      if ($scope.userdata.nav.current == 41) {
        if (newValue) {
          // On hovering over a neighborhood, display it by changing the fill opacity to non-zero
          $scope.neighborhood[newValue].setOptions({
            fillOpacity: 0.15
          })
        } else {
          // On unhover, hide it by changing the fill opacity to zero
          for (var i in $scope.neighborhood) {
            $scope.neighborhood[i].setOptions({
              fillOpacity: 0
            })
          }
        }
      }
    })

    // Set map view & parcel if given a parcel's lat/lng
    // IS THIS STILL BEING USED ANYWHERE?
    /*
    $scope.$watch(function () {
      return $scope.mapService.parcel
    }, function (newValue, oldValue) {
      // Doesn't matter what section it's on... ?
      if (newValue.lat && newValue.lng) {
        $scope._displayParcelGeometry(newValue.lat, newValue.lng, function (parcel) {
          // Not all address latlng values seem to return parcels, so handle this better
          if (parcel[0]) {
            $scope.map.fitBounds(parcel[0].getBounds())
            if ($scope.map.getZoom() > 18) {
              $scope.map.setZoom(18)
            }          
          } else {
            console.log('No parcel geometry found at ' + newValue.lat + ',' + newValue.lng)
          }
        })
      } else {
        $scope._clearMapOverlay($scope.parcels)
      }
    })
  */

    // Set map view if given a parcel
    $scope.$watch(function () {
      return $scope.mapService.parcel.geometry
    }, function (newValue, oldValue) {
      var geometry = newValue
      if (geometry) {
        var options = {
          clickable: true,
          fillColor: '#21687f',
          fillOpacity: 0.50,
          strokeColor: '#ffffff',
          strokeOpacity: 1,
          strokePosition: google.maps.StrokePosition.CENTER,
          strokeWeight: 0
        }
        // Display the geometry
        $scope.parcels = $scope._overlayGeoJSON(geometry, options)
        $scope.map.fitBounds($scope.parcels[0].getBounds())
        if ($scope.map.getZoom() > 18) {
          $scope.map.setZoom(18)
        }          
      } else {
        $scope._clearMapOverlay($scope.parcels)
      }
    })

    // Actions to perform when map is clicked.
    $scope.mapClick = function ($event, $params) {

      // Record lat / lng point of click for application use
      $scope.mapService.clicked.lat = $event.latLng.lat()
      $scope.mapService.clicked.lng = $event.latLng.lng()
      $scope.mapService.clicked.latLng = new google.maps.LatLng($event.latLng.lat(), $event.latLng.lng())
      // console.log($event.latLng.lat() +','+ $event.latLng.lng())

      // Set map actions based on section
      switch($scope.userdata.nav.current) {
        case '40':
          $scope.selectParcel($event.latLng)
          break
        case '41':
          // Neighborhood selection
          break
        case '45':
          // Zoning map display
          break
        case '50':
          // Parcel view
          break
        case '70':
          break
        default:
          // Nothing
      }
    }


    $scope.selectParcel = function (latlng) {

      // Clear old marker(s) and add a new marker
      $scope._clearMapOverlay($scope.markers)
      var marker = $scope._addMarker(latlng)

      // Pan/zoom to click
      $scope.map.panTo(latlng)
      if ($scope.map.getZoom() < 17) {
        $scope.map.setZoom(17)
      }

      // Open info window
      $scope.infowindow.setContent(infoLoader)
      $scope.infowindow.open($scope.map, marker)
      $scope.loading = true

      // Infowindow content
      // $scope.infowindow.setContent('Clicked location: ' + latlng.toUrlValue(4))

      // Geocode address
      var geocodeEndpoint = '/geocode/position?position='
      // Temp replacement
      var geocodeEndpoint = 'http://clvplaces.appspot.com/maptools/rest/services/agsquery?jsonCallback=JSON_CALLBACK&latlng=('

      // $http.get(geocodeEndpoint + latlng.toUrlValue())
      $http.jsonp(geocodeEndpoint + latlng.toUrlValue() + ')')
      .success( function (response, status) {

        // Turn off loader
        $scope.loading = false

        // Extract results from response
        // var result = response.response[0]
        var result = response.results[0]

        if (!result) {
          // Error message with empty result
          $scope.infowindow.setContent('The server did not respond with any information. :-(  Please try again later.')
          return false
        }

        if (response.errormsg) {
          // Error response from city API
          $scope.infowindow.setContent(response.errormsg)
        }
        else if (result.length == 0) {
          // Message for no results
          $scope.infowindow.setContent('No address found here.')
        } 
        else {
          // Display address
          // var streetname = result.streetno + ' ' + result.streetname
          var streetname =  result.STRNO + ' ' + result.STRDIR + ' ' + result.STRNAME + ' ' + result.STRTYPE
          streetname = streetname.capitalize()
          $scope.infowindow.setContent('<h3>' + streetname + '</h3><div style="text-align:center"><button ng-click="loadParcel()">Use this location</button></div>')

        }

      })
      .error( function (response, status) {
        $scope.loading = false
        $scope.infowindow.setContent('Sorry, we hit a server error :-(  Please try again later.')
      });

      $scope._displayParcelGeometry(latlng.lat(), latlng.lng())
    }

    $scope.loadParcel = function () {
      alert('test')
    }


    $scope.showParcels = function () {
      var parcelsGeoJSON = '/api/parcels'

      $http.get(parcelsGeoJSON)
      .success( function (response, status) {

        // Set default GeoJSON display options
        var options = {
          clickable: true,
          fillColor: '#000000',
          fillOpacity: 0.40,
          strokeColor: '#ffffff',
          strokeOpacity: 1,
          strokePosition: google.maps.StrokePosition.CENTER,
          strokeWeight: 0
        }

        for (var i=0; i < response.features.length; i++) {
          // Add some random scores.
          response.features[i].properties.score = Math.floor(Math.random() * 100)

          var score = response.features[i].properties.score

          // Filter out parcels below a certain score threshold.
          if (score >= 10) {
            // Change fill color based on score.
            options.fillColor = $scope._getFillColor(score)

            // Add to map.
            var parcel = $scope._overlayGeoJSON(response.features[i], options)
            $scope.parcelzzz.push(parcel[0])
          }
        }
      })
      .error( function (response, status) {
        console.log('Error getting parcelzzzzz')
      });
    }

    $scope.loadNeighborhoods = function () {

      // Set default GeoJSON display options
      var options = {
        clickable: false,
        fillColor: '#ff0000',
        fillOpacity: 0,
        strokeWeight: 0
      }

      var geoCity = '/data/clv-city-limits.geojson'
      var geoDowntown =  '/data/clv-downtown.geojson'
      var geoSummerlin = '/data/clv-summerlin.geojson'

      $scope.neighborhood = {}

      $scope._loadGeoJSON(geoCity, options, function (overlay) {
        $scope.neighborhood.city = overlay[1]
      })
      $scope._loadGeoJSON(geoDowntown, options, function (overlay) {
        $scope.neighborhood.downtown = overlay[0]
      })
      $scope._loadGeoJSON(geoSummerlin, options, function (overlay) {
        $scope.neighborhood.summerlin = overlay[0]
      })

    }


    // Actions to perform when map boundaries have changed.
    $scope.mapBoundsChanged = function ($event, $params) {

      // Report on map boundaries, center, and zoom level.
      // This stuff is always available from the map anyway
      // Giving it to mapService is just what allows other controllers to know about it - do they need to?
      // for now, the answer is no.
      //$scope.mapService.bounds = $scope.map.getBounds()
      //$scope.mapService.zoom = $scope.map.getZoom()
      //$scope.mapService.center = $scope.map.getCenter()
    }

    $scope._mapInvalidateSize = function () {
      // The name of this function is based on leaflet.js's similar invalidateSize() method
      // Google Maps v3 API requires that the developer manually handle situations where the map display div changes size

      // setTimeout 0 is a treating symptomps solution to deal with the map
      // sometimes not resizing properly when loaded for the first time. This
      // might not actually solve the problem. See issue #68.
      window.setTimeout(function() { 
        google.maps.event.trigger($scope.map, 'resize') 
        $scope._setMapView($scope.userdata.nav.current)
      }, 0)
    }

    $scope._setMapView = function (section) {
      $scope.isMapViewSet = true

      // Standard view resets
      $scope.infowindow.close()
      $scope._clearMapOverlay($scope.parcels)
      $scope._clearMapOverlay($scope.markers)
      $scope._clearMapOverlay($scope.parcelzzz)

      var defaultMapUIOptions = {
        disableDefaultUI: false,
        disableDoubleClickZoom: false,
        keyboardShortcuts: true,
        draggable: true
      }
      var fixedMapUIOptions = {
        disableDefaultUI: true,
        disableDoubleClickZoom: true,
        keyboardShortcuts: false,
        draggable: false
      }


      // Set map view based on section
      switch(section) {
        case '40':
          // Address selection
          // Note: This fit bounds should happen when this occurs, but it's triggering before the mapinvalidatesize() is called, so the first view of this isn't set properly.
          $scope.map.fitBounds($scope.cityLimitsBounds)
          $scope.map.setOptions(defaultMapUIOptions)
          break
        case '41':
          // Neighborhood selection
          $scope.map.fitBounds($scope.cityLimitsBounds)
          $scope.map.setOptions(fixedMapUIOptions)
          // Load GeoJSONs
          $scope.loadNeighborhoods()
          break
        case '45':
          // Remove neighborhoods from previous
          $scope._clearMapOverlay($scope.neighborhood)
          // Zoning map display
          $scope.showParcels()
          // Reset Options
          $scope.map.setOptions(defaultMapUIOptions)
          // Change view
          // Currently: fake it!
          $scope.map.setCenter(new google.maps.LatLng(36.16526743280042,-115.14169692993164))
          $scope.map.setZoom(16)
          break
        case '50':
          // Parcel view
          $scope.map.setOptions(fixedMapUIOptions)
          break
        case '70':
          $scope.map.setOptions(fixedMapUIOptions)
          break
        default:
          // what?
      }
    }

    $scope._loadGeoJSON = function (url, options, callback) {
      var overlay

      $http.get(url)
      .success( function (response, status) {
        overlay = $scope._overlayGeoJSON(response, options)

        // Execute callback function
        if (typeof callback === "function") {
          callback(overlay)
        }

        return overlay
      })
      .error( function (response, status) {
        console.log('Error getting GeoJSON file: ' + url )
      })
    }

    // Generic GeoJSON overlay adder
    $scope._overlayGeoJSON = function(geojson, options) {
      // geojson = map data to display in standard GeoJSON format
      // options = Google map options object

      // Create an overlay holder
      var overlay = []

      // Translate GeoJSON-formatted response to Google Maps format
      // https://developers.google.com/maps/tutorials/data/importing_data
      // 3rd party conversion util https://github.com/JasonSanford/geojson-google-maps
      var geo = new GeoJSON(geojson, options)

      if (!geo.error) {
        // Display everything
        ng.forEach(geo, function (shape) {
          // If there is another array (common for Feature Collections)
          if (Array.isArray(shape) == true) {
            ng.forEach(shape, function (geometry) {
              // Display on map
              geometry.setMap($scope.map)
              // Test click
              // google.maps.event.addListener(geometry, 'click', function(){alert('hi')});
              // That worked. Now have to make it do stuff.
              // Maybe make it receive event listeners outside of this function, since it's being returned in an array.
              
              // Add geometry to overlay holder
              overlay.push(geometry)
            })
          }
          // Otherwise, single geometry feature
          else {
            shape.setMap($scope.map)
            // google.maps.event.addListener(shape, 'click', function(){alert('hi')});
            overlay.push(shape)
          }
        })
      }
      else {
        console.log('Error converting GeoJSON input to Google Maps overlay.')
      }

      // Return the array that holds the overlay information
      // this is necessary for doing stuff with it (e.g. clearing it) later
      return overlay
    }

    // Generic overlay clearer
    // e.g. pass in $scope.markers to clear all markers
    $scope._clearMapOverlay = function(overlay) {
      if (overlay) {
        // remove overlay items from the map
        ng.forEach(overlay, function (item) {
          item.setMap(null)
        })
        // remove items from the array keeping track of them
        overlay.length = 0
      }
    }

    // For zoning view - color scheme
    $scope._getFillColor = function (score) {
      // Keep scores within scale
      if (score > 100) { score = 100 }
      else if (score < 0 ) { score = 0 }
      /*
      // For testing: color scale between red and green
      var r = Math.floor((255 * score) / 100),
          g = Math.floor((255 * (100 - score)) / 100),
          b = 0;

      return "rgb(" + r + "," + g + "," + b + ")"
      */
      // Colors: variations on suggestions from http://www.sron.nl/~pault/
      if (score >= 60) {
        // return '#29b35e' //green
        return 'green'
      } else if (score >= 40 && score < 60) {
        // return '#b9ca3b' // yellow
        return 'yellow'
      } else if (score >= 20 && score < 40) {
        // return '#dfa53a' // orange
        return 'orange'
      } else if (score >= 10 && score < 20) {
        // return '#e7742f'
        return '#ff9900'
      } else {
        return 'red'
      }
    }

    $scope._addMarker = function(latlng) {
      // Create marker instance
      var marker = new google.maps.Marker({
        position: latlng,
        map: $scope.map
      })

      // Have to manually keep track of them
      $scope.markers.push(marker)

      return marker
    }

    $scope._displayParcelGeometry = function (lat, lng, callback) {
      // Get the parcel given a latlng point
      var parcelGeomEndpoint = 'http://las-vegas-zoning-api.herokuapp.com/areas'  // ?lat=36.16355&lon=-115.13984
      var parcelGeomUrl = parcelGeomEndpoint + '?lat=' + lat + '&lon=' + lng

      // Set GeoJSON display options
      var options = {
        clickable: true,
        fillColor: '#21687f',
        fillOpacity: 0.50,
        strokeColor: '#ffffff',
        strokeOpacity: 1,
        strokePosition: google.maps.StrokePosition.CENTER,
        strokeWeight: 0
      }

      $scope._clearMapOverlay($scope.parcels)
      $scope._loadGeoJSON(parcelGeomUrl, options, function (parcel) {
        $scope.parcels = parcel
    
        // Execute callback function
        if (typeof callback === "function") {
          callback(parcel)
        }    
      })
    }

    $scope._displayParcelGeoJSON = function (geoJSON, callback) {
      // TODO: DO WE NEED THIS?
      // There is already a geoJSON

      // Set GeoJSON display options
      var options = {
        clickable: true,
        fillColor: '#21687f',
        fillOpacity: 0.50,
        strokeColor: '#ffffff',
        strokeOpacity: 1,
        strokePosition: google.maps.StrokePosition.CENTER,
        strokeWeight: 0
      }

      $scope._clearMapOverlay($scope.parcels)
      $scope.parcels = $scope._overlayGeoJSON(geoJSON, options, function (overlay) {
        // display parcel?
      })
    }

    // Display a very light city limits thing to direct people's attentions.
    var cityLimitsGeoJSON = '/data/clv-city-limits.geojson'
    var cityLimitsOptions = {
      clickable: false,
      fillColor: 'white',
      fillOpacity: 0,
      strokeColor: '#cc1100',
      strokeOpacity: 0.15,
      strokePosition: google.maps.StrokePosition.OUTSIDE,
      strokeWeight: 4
    }

    $scope._loadGeoJSON(cityLimitsGeoJSON, cityLimitsOptions, function (overlay) {
      $scope.cityLimitsBounds = overlay[1].getBounds()

      if ($scope.isMapViewSet == false) {
        $scope.map.fitBounds($scope.cityLimitsBounds)
      }
    })



  })

  // PRINT VIEW CONTROLLER
  // Pretty similar to Section 50...
  controllers.controller('PrintViewCtrl', function ($scope, $http, UserData, MapService) {
    $scope.userdata = UserData
    $scope.mapService = MapService

    $scope.reportId  = $scope.userdata.reportId
    $scope.reportDate = new Date ()

    $scope._getStaticImageUrl = function() {

      // Get a static map URL to display on the print page
      var parcelLat = $scope.userdata.property.location.y
      var parcelLng = $scope.userdata.property.location.x

      var parcelGeometry = $scope.userdata.property.geometry

      var staticMapBaseUrl   = 'http://maps.googleapis.com/maps/api/staticmap'
      var staticMapBaseQuery = '?zoom=15&size=250x250&maptype=roadmap&sensor=false'

      var staticMapDisplay = ''

      if (parcelGeometry) {
        // Display a shape
        // See documentation for Static Maps API https://developers.google.com/maps/documentation/staticmaps/#Paths
        var pathStyle = 'weight:1|fillcolor:0x0000ff90'
        var pathString = ''
        var path = parcelGeometry.features[0].geometry.coordinates[0]
        for (var i=0; i < path.length; i++) {
          pathString += '|' + path[i][1] + ',' + path[i][0]
        }

        staticMapDisplay = '&path=' + pathStyle + pathString
        // Note that this could potentially create a URL string that's too long, in the case of complex geometry.
        // In that case, default to point marker, below.
      }
      if (!parcelGeometry || staticMapDisplay.length > 1900) {
        // Display a point marker
        staticMapDisplay = '&markers=color:red%7C' + parcelLat + ',' + parcelLng
      }

      return staticMapBaseUrl + staticMapBaseQuery + staticMapDisplay
    }

    $scope.staticMapImageUrl = $scope._getStaticImageUrl()

    $scope.parcel  = $scope.userdata.property

    // SOME LOGIC similar to Section 50
    // Reset
    $scope.downtownIncentives = false
    $scope.homeOccupancy = false
    // Check Zoning
    $scope._checkZoning = function (zones) {
      // assume zones is an array of zones
      for (var i=0; i < zones.length; i++) {
        // Check if zones affect anything and then update view elements accordingly.
        if (zones[i].designation == 'DCP-O') {
          // Las Vegas downtown overlay
          $scope.downtownIncentives = true
        }
        if (zones[i].type == 'residential') {
          $scope.homeOccupancy = true
        }
      }
    }
    // Check
    $scope._checkZoning($scope.parcel.zones)


    // Open print dialog box
    // Dumb hack to activate print dialog only after CSS transitions are done
    // Also prevents the dialog from opening before Angular is ready (but there should be a better fix for this...)
    var timeout = window.setTimeout(print, 800);

    function print() {
      window.print()
    }


  })

  // MODALS
  controllers.controller('ModalDemoCtrl', function ($scope, $modal, $log) {

    $scope.items = ['item1', 'item2', 'item3'];

    $scope.open = function () {

      var modalInstance = $modal.open({
        templateUrl: '/partials/_modal.html',
        controller: ModalInstanceCtrl,
        resolve: {
          items: function () {
            return $scope.items;
          }
        }
      });

      modalInstance.result.then(function (selectedItem) {
        $scope.selected = selectedItem;
      }, function () {
        $log.info('Modal dismissed at: ' + new Date());
      });
    };
  });

   var ModalInstanceCtrl = function ($scope, $modalInstance, items) {

    $scope.items = items;
    $scope.selected = {
      item: $scope.items[0]
    };

    $scope.ok = function () {
      $modalInstance.close($scope.selected.item);
    };

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };
  };






  /*******************************************************************************************/
  /* Copied from ui.bootstrap */

  ng.module("ui.bootstrap", ["ui.bootstrap.transition","ui.bootstrap.collapse"]);

  ng.module('ui.bootstrap.transition', [])

  /**
   * $transition service provides a consistent interface to trigger CSS 3 transitions and to be informed when they complete.
   * @param  {DOMElement} element  The DOMElement that will be animated.
   * @param  {string|object|function} trigger  The thing that will cause the transition to start:
   *   - As a string, it represents the css class to be added to the element.
   *   - As an object, it represents a hash of style attributes to be applied to the element.
   *   - As a function, it represents a function to be called that will cause the transition to occur.
   * @return {Promise}  A promise that is resolved when the transition finishes.
   */
  .factory('$transition', ['$q', '$timeout', '$rootScope', function($q, $timeout, $rootScope) {

    var $transition = function(element, trigger, options) {
    options = options || {};
    var deferred = $q.defer();
    var endEventName = $transition[options.animation ? "animationEndEventName" : "transitionEndEventName"];

    var transitionEndHandler = function(event) {
      $rootScope.$apply(function() {
      element.unbind(endEventName, transitionEndHandler);
      deferred.resolve(element);
      });
    };

    if (endEventName) {
      element.bind(endEventName, transitionEndHandler);
    }

    // Wrap in a timeout to allow the browser time to update the DOM before the transition is to occur
    $timeout(function() {
      if ( ng.isString(trigger) ) {
      element.addClass(trigger);
      } else if ( ng.isFunction(trigger) ) {
      trigger(element);
      } else if ( ng.isObject(trigger) ) {
      element.css(trigger);
      }
      //If browser does not support transitions, instantly resolve
      if ( !endEventName ) {
      deferred.resolve(element);
      }
    });

    // Add our custom cancel function to the promise that is returned
    // We can call this if we are about to run a new transition, which we know will prevent this transition from ending,
    // i.e. it will therefore never raise a transitionEnd event for that transition
    deferred.promise.cancel = function() {
      if ( endEventName ) {
      element.unbind(endEventName, transitionEndHandler);
      }
      deferred.reject('Transition cancelled');
    };

    return deferred.promise;
    };

    // Work out the name of the transitionEnd event
    var transElement = document.createElement('trans');
    var transitionEndEventNames = {
    'WebkitTransition': 'webkitTransitionEnd',
    'MozTransition': 'transitionend',
    'OTransition': 'oTransitionEnd',
    'transition': 'transitionend'
    };
    var animationEndEventNames = {
    'WebkitTransition': 'webkitAnimationEnd',
    'MozTransition': 'animationend',
    'OTransition': 'oAnimationEnd',
    'transition': 'animationend'
    };
    function findEndEventName(endEventNames) {
    for (var name in endEventNames){
      if (transElement.style[name] !== undefined) {
      return endEventNames[name];
      }
    }
    }
    $transition.transitionEndEventName = findEndEventName(transitionEndEventNames);
    $transition.animationEndEventName = findEndEventName(animationEndEventNames);
    return $transition;
  }]);

  ng.module('ui.bootstrap.collapse',['ui.bootstrap.transition'])

  // The collapsible directive indicates a block of html that will expand and collapse
  .directive('collapse', ['$transition', function($transition) {
    // CSS transitions don't work with height: auto, so we have to manually change the height to a
    // specific value and then once the animation completes, we can reset the height to auto.
    // Unfortunately if you do this while the CSS transitions are specified (i.e. in the CSS class
    // "collapse") then you trigger a change to height 0 in between.
    // The fix is to remove the "collapse" CSS class while changing the height back to auto - phew!
    var fixUpHeight = function(scope, element, height) {
    // We remove the collapse CSS class to prevent a transition when we change to height: auto
    element.removeClass('collapse');
    element.css({ height: height });
    // It appears that  reading offsetWidth makes the browser realise that we have changed the
    // height already :-/
    var x = element[0].offsetWidth;
    element.addClass('collapse');
    };

    return {
    link: function(scope, element, attrs) {

      var isCollapsed;
      var initialAnimSkip = true;
      scope.$watch(function (){ return element[0].scrollHeight; }, function (value) {
      //The listener is called when scollHeight changes
      //It actually does on 2 scenarios: 
      // 1. Parent is set to display none
      // 2. angular bindings inside are resolved
      //When we have a change of scrollHeight we are setting again the correct height if the group is opened
      if (element[0].scrollHeight !== 0) {
        if (!isCollapsed) {
        if (initialAnimSkip) {
          fixUpHeight(scope, element, element[0].scrollHeight + 'px');
        } else {
          fixUpHeight(scope, element, 'auto');
        }
        }
      }
      });
      
      scope.$watch(attrs.collapse, function(value) {
      if (value) {
        collapse();
      } else {
        expand();
      }
      });
      

      var currentTransition;
      var doTransition = function(change) {
      if ( currentTransition ) {
        currentTransition.cancel();
      }
      currentTransition = $transition(element,change);
      currentTransition.then(
        function() { currentTransition = undefined; },
        function() { currentTransition = undefined; }
      );
      return currentTransition;
      };

      var expand = function() {
      if (initialAnimSkip) {
        initialAnimSkip = false;
        if ( !isCollapsed ) {
        fixUpHeight(scope, element, 'auto');
        }
      } else {
        doTransition({ height : element[0].scrollHeight + 'px' })
        .then(function() {
        // This check ensures that we don't accidentally update the height if the user has closed
        // the group while the animation was still running
        if ( !isCollapsed ) {
          fixUpHeight(scope, element, 'auto');
        }
        });
      }
      isCollapsed = false;
      };
      
      var collapse = function() {
      isCollapsed = true;
      if (initialAnimSkip) {
        initialAnimSkip = false;
        fixUpHeight(scope, element, 0);
      } else {
        fixUpHeight(scope, element, element[0].scrollHeight + 'px');
        doTransition({'height':'0'});
      }
      };
    }
    };
  }]);

})(angular);
