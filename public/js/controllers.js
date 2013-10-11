'use strict';

/* Controllers */

var appCtrls = angular.module(appName + '.controllers', []);

// START OF APPLICATION
appCtrls.controller('StartCtrl', function ($scope, $location, UserData) {

  $scope.userdata = UserData

  // Clear application data if directed
  if (_getQueryStringParams('clear') == 'true') {
    // DAMN THIS IS FUCKING PERSISTENT DATA!!!
    $scope.userdata = _resetUserData()

    UserData = _resetUserData()
    _saveLocalStorage(UserData)
    console.log(UserData)

    _clearLocalStorage()
    console.log('User data cleared.')
  }

})

// SECTION 10 - NAICS Business Category search
appCtrls.controller('10Ctrl', function ($scope, $http, UserData) {

  // This is the endpoint URL.
  //var searchAPI   = 'http://api.naics.us/v0/s?year=2012&terms='
  var searchAPI = '/categories/naics_search?keywords='

  // Attach global UserData to this controller.
  $scope.userdata = UserData

  // Set defaults for scope variables
  $scope.searchResults   = false
  $scope.searchLoading   = false
  $scope.searchErrorMsg  = ''
  $scope.searchPerformed = false
  $scope.selectedResult  = null

  // Randomly select an example business placeholder input!
  $scope.sampleInputs    = ['coffee shop',
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
                            'bicycle shop']
  $scope.sampleInput     = $scope.sampleInputs[Math.floor(Math.random() * $scope.sampleInputs.length)]

  // Set search input box to remember the most recent input
  $scope.searchInput = $scope.userdata.rawInputs.businessSearch[$scope.userdata.rawInputs.businessSearch.length-1]

  // If there was a selected NAICS code, kind-of restore application state 
  if ($scope.userdata.naics.code != null) {
    $scope.searchPerformed = true
    $scope.selectedResult = $scope.userdata.naics.title
  }

  $scope.searchBusiness = function (input) {

    // Assemble search endpoint URL based on user input
    var searchURL   = searchAPI + encodeURIComponent(input)

    // Reset display
    $scope.searchErrorMsg = ''
    $scope.searchResults  = false

    // Display loading icon
    $scope.searchLoading  = true

    // Get search results
    $http.get(searchURL).
      success( function (results) {

        $scope.searchLoading = false

        // Message for no results
        if (results.length == 0) {
          $scope.searchErrorMsg = 'Nothing found for the terms ‘' + input + '’.'
        } else {

          // Prune results that are not in the 6-digit range
          var prunedResults = []
          for (var j=0; j < results.length; j++) {
            if (results[j].code.toString().length == 6) {
              prunedResults.push(results[j])
            }
          }

          // Set results to model
          $scope.searchResults = prunedResults
          $scope.searchPerformed = true

          // After a search, save to local storage
          _saveLocalStorage($scope.userdata)
        }

        // Store raw search inputs for future analysis
        $scope.userdata.rawInputs.businessSearch.push(input)

      }).
      error( function () {
        // Display error message
        $scope.searchLoading = false
        $scope.searchErrorMsg = 'Error performing search for NAICS business categories.'

      });

  }

  $scope.selectResult = function (code, title) {
    // Set the selected stuff to global UserData so it's available elsewhere
    $scope.userdata.naics.code  = code
    $scope.userdata.naics.title = title

    // Add selected title to the selection box
    $scope.selectedResult = $scope.userdata.naics.title
  }


})

// SECTION 12 - CONFIRM BUSINESS CATEGORY
appCtrls.controller('12Ctrl', function ($scope, $http, UserData) {

  $scope.userdata = UserData

  // Only get a new business category if there isn't one
  if ($scope.userdata.businessCategory.code == null) {
    var dataURL = '/categories/business_licensing';
  //    var dataURL = '/data/business-types.json';
  //    Note: these are coming from different sources, and seems to have different categories. Need to confirm.

    // Get a matched business type
    $http.get(dataURL).success( function (stuff) {

      // DEMO - grab a random business type from the array.
      $scope.userdata.businessCategory = stuff[Math.floor(Math.random() * stuff.length)];

    })
  }

  // UI.Bootstrap collapse
  $scope.isCollapsed = true;

})

// SECTION 15 - Describe your business
appCtrls.controller('15Ctrl', function ($scope, UserData) {

  $scope.userdata = UserData

  $scope.countdown = null

})

// SECTION 20 - ADDITIONAL BUSINESS
appCtrls.controller('20Ctrl', function ($scope, $http, $filter, UserData) {
  $scope.userdata = UserData
  $scope.debug = false

  var dataURL = '/data/additional-business.json'

  var userdata = $scope.userdata.additionalBusiness

  // Display additional businesses
  $http.get(dataURL).success( function (data) {

    // Add the 'checked' value depending on current UserData
    for (var i = 0; i < data.length; i++) {

      data[i].checked = false

      if (userdata !== null && userdata.length > 0) {
        for (var j = 0; j < userdata.length; j++) {
          if (userdata[j].id == data[i].id) {
            data[i].checked = true
          } 
        }
      }
    }

    // Add the data to the scope
    $scope.additionalBusiness = data
  })

  $scope.selectedBusiness = function () {
    // See example code here: http://stackoverflow.com/questions/14514461/how-can-angularjs-bind-to-list-of-checkbox-values
    var output = $filter('filter') ($scope.additionalBusiness, {checked: true})
    $scope.userdata.additionalBusiness = output
    return output
  }

})


// SECTION 40 - Enter a location
appCtrls.controller('40Ctrl', function ($scope, $http, UserData, MapService) {
  $scope.userdata = UserData
  $scope.userdata.nav.pathTo50 = 40    // Remember the current section to preserve path in the future
  $scope.mapService = MapService
  $scope.debug = false


  var addressEndpoint = '/geocode/address?address='
  var latLngEndpoint = '/geocode/position?latlng='
// example requests. see Issues #7, 38
// /address/suggest?address=Las Vegas Blvd
// /address/geocode?address=455 Las Vegas Blvd
// /point/reverse_geocode?lat=123.123&lng=123.123


  // Prepopulate form if we already know it
  $scope.addressInput = $scope.userdata.property.address

  // When find address form is submitted
  $scope.findAddress = function (input) {
    // Reset display
    $scope.searchErrorMsg  = ''
    $scope.searchResults   = false
    $scope.searchNoAddress = false

    // Exit if no input
    if (!input) {
      $scope.searchErrorMsg = 'Please provide search terms.'
      return false
    }

    // Store raw search inputs for future analysis
    $scope.userdata.rawInputs.addressSearch.push(input)

    // Assemble search endpoint URL based on user input
    var addressURL = addressEndpoint + encodeURIComponent(input)

    // Display loading icon
    $scope.searchLoading = true

    // Get address search results
    $http.get(addressURL).
    success( function (response, status) {

      // Turn off loader
      $scope.searchLoading = false

      // Extract results from response
      //var results = response.candidates
      var results = response.response

      if (results.length == 0) {
      //if (!results.score) {

        // Message for no results
        $scope.searchErrorMsg = 'No addresses found for ‘' + input + '’.'

        // Display additional message for alternate jurisdictions
        $scope.searchNoAddress = true

      } else if (results[0].score >= 95) {
        
        // If first result is a pretty good match, just take it
        _saveAddress(results[0])

        // Forward this interaction directly.
        // This breaks forward/back apparently.
        window.location.hash = encodeURIComponent('/section/50')

      } else {
        // Multiple results found - user select now.
        $scope.searchResults = results

        // Format for selection
        for (var j = 0; j < $scope.searchResults.length; j ++) {
          if (!$scope.searchResults[j].item) {
            var item = $scope.searchResults[j]
            item.address = item.streetno + ' ' + item.streetname
          }
        }

      }

    }).
    error( function (response, status) {

      $scope.searchLoading = false
      $scope.searchErrorMsg = 'Error performing search for addresses. Please try again later.'

    });
  }

  $scope.selectResult = function (item) {
    $scope.selectedResult = true
    // Set the selected stuff to global UserData so it's available elsewhere
    _saveAddress(item)
  }

  var _saveAddress = function (data) {
    // data is either same as results[0] retrieved from data source
    // or saved from the "select" button if there are multiple sources
    // Results format from mapdata.lasvegasnevada.gov endpoint
    /*
    $scope.userdata.property.address  = data.address.capitalize()
    $scope.userdata.property.location = data.location
    $scope.userdata.property.score    = data.score
    */
    // Results format from clvplaces.appspot 
    $scope.userdata.property            = data
    $scope.userdata.property.address    = data.streetno + ' ' + data.streetname
    $scope.userdata.property.address.capitalize()
    $scope.userdata.property.location   = {}
    $scope.userdata.property.location.x = data.latlng.split(',')[1]
    $scope.userdata.property.location.y = data.latlng.split(',')[0]
  }

})

appCtrls.controller('45Ctrl', function ($scope, UserData) {
  $scope.userdata = UserData
  $scope.userdata.nav.pathTo50 = 45    // Remember the current section to preserve path in the future

  // Reset view
  $scope.loading = true
  $scope.errorMsg = false
  $scope.loaded = false

  var fakeloading = window.setTimeout(function () {
    $scope.loading = false
    $scope.loaded = true
  }, 800)

})

// SECTION 41 - NEIGHBORHOOD SELECTION VIEW
appCtrls.controller('41Ctrl', function ($scope, $http, UserData, MapService) {
  $scope.userdata   = UserData
  $scope.mapService = MapService

  // Load up neighborhood GeoJSONs.

  $scope.hoverDowntown = function () {
    $scope.mapService.neighborhood = 'downtown'
  }

  $scope.hoverSummerlin = function () {
    $scope.mapService.neighborhood = 'summerlin'
  }

  $scope.hoverCity = function () {
    $scope.mapService.neighborhood = 'city'
  }

  $scope.unhover = function () {
    $scope.mapService.neighborhood = ''
  }


})

// SECTION 50 - PARCEL VIEW
appCtrls.controller('50Ctrl', function ($scope, $http, UserData, MapService) {
  $scope.userdata = UserData

  // Reset view
  $scope.parcelLoaded  = false
  $scope.searchLoading = false
  $scope.title = 'Retrieving parcel...'

  // Switch back navigation based on user's path
  if ($scope.userdata.nav.pathTo50 == 45) {
    $scope.previousIsZoningOverview = true
    $scope.previousIsAddressSearch = false
  } else {
    // Assume address search is the default condition.
    $scope.previousIsZoningOverview = false
    $scope.previousIsAddressSearch = true
  }

  // Don't do any new loading if user pressed 'back' - just display the data.
  if ($scope.userdata.nav.previous >= 50) {

    // Read parcel data from UserData
    $scope.parcel = $scope.userdata.property

    // Set display
    $scope.title = $scope.userdata.property.address.capitalize()
    $scope.parcelLoaded  = true

    return
  }

  // Request URL endpoint
  var parcelRequestEndpoint = '/parcels/search?position='
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
        record_adresses: [],
        ward:            results.WARD,
        zone:            results.ZONING,
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
          x: $scope.userdata.property.location.x,
          y: $scope.userdata.property.location.y
        }
      }

      // Cleanup
      $scope.parcel.owner_address.clean()
      $scope.userdata.property = $scope.parcel

      // Set display
      $scope.title = $scope.parcel.address
      $scope.parcelLoaded  = true

    }

  }).
  error( function () {

    $scope.searchLoading = false
    $scope.errorMsg = 'Error loading parcel data.'

  })

})

appCtrls.controller('70Ctrl', function ($scope, UserData) {

  $scope.userdata = UserData

  $scope.parcel  = $scope.userdata.property

})

appCtrls.controller('MapCtrl', function ($scope, $http, MapService, UserData) {

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
//    streetViewControl: false,
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

    $http.get(geocodeEndpoint + latlng.toUrlValue())
    .success( function (response, status) {

      // Turn off loader
      $scope.loading = false

      // Extract results from response
      //var results = response.candidates
      var result = response.response[0]

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
        $scope.infowindow.setContent(result.streetno + ' ' + result.streetname + '<br>' + result.city + ', ' + result.state + ' ' + result.zip + '<br><a href=\'\'>Use this location</a>')
      }

    })
    .error( function (response, status) {
      $scope.loading = false
      $scope.infowindow.setContent('Sorry, we hit a server error :-(  Please try again later.')
    });

    // Get the parcel given a latlng point
    var parcelGeomEndpoint = 'http://las-vegas-zoning-api.herokuapp.com/areas'  // ?lat=36.16355&lon=-115.13984
    var parcelGeomUrl = parcelGeomEndpoint + '?lat=' + latlng.lat() + '&lon=' + latlng.lng()

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
    })

  }


  $scope.showParcels = function () {
    //var parcelsGeoJSON = '/data/parcels_small.geojson'
    var parcelsGeoJSON = '/parcels'

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

        break
      case '70':
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
      angular.forEach(geo, function (shape) {
        // If there is another array (common for Feature Collections)
        if (Array.isArray(shape) == true) {
          angular.forEach(shape, function (geometry) {
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
      angular.forEach(overlay, function (item) {
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

appCtrls.controller('PrintViewCtrl', function ($scope, $http, UserData, MapService) {
  $scope.userdata = UserData
  $scope.mapService = MapService

  $scope.reportId  = $scope.userdata.reportId
  $scope.reportDate = new Date ()

  // Get a static map URL to display on the print page
  var parcelLat = $scope.userdata.property.location.y
  var parcelLng = $scope.userdata.property.location.x
  $scope.staticMapImageUrl = 'http://maps.googleapis.com/maps/api/staticmap?zoom=15&size=250x250&maptype=roadmap&sensor=false&markers=color:red%7C' + parcelLat + ',' + parcelLng

  $scope.parcel  = $scope.userdata.property

  // Open print dialog box
  // Dumb hack to activate print dialog only after CSS transitions are done
  // Also prevents the dialog from opening before Angular is ready (but there should be a better fix for this...)
  var timeout = window.setTimeout(print, 800);

  function print() {
    window.print()
  }
})

appCtrls.controller('ReturnCtrl', function ($scope, UserData) {

  // Default: this dialog box should be off.
  $scope.showDialog = false

  // Display this if user arrives to a page in this application and 
  // user data is already stored in Local Storage.
  if (_checkLocalStorage() == true) {

    $scope.userdata = UserData

    // Redirect route to last recorded section
    window.location.href = window.location.origin + '/#/section/' + $scope.userdata.nav.current

    // Show the return dialog box
    // This code is a hack... it delays a bit so that it animates sliding down after load
    var timeout = setTimeout(showDialog, 800)
  }
  else {
    // Nothing is in local storage and that person should start from the beginning
    // console.log('Application not previously started. Starting from beginning.')
    // window.location.href = '/#/'
  }

  // Hide dialog when Escape is pressed
  $(document).keyup( function (e) {
    if (e.keyCode === 13 || e.keyCode === 27) { 
      $scope.hideDialog()
    }
  })

  // Hide dialog if other parts of the map are clicked while the dialog is open
  angular.element(document.getElementById('main')).bind('click', function() {
    $scope.hideDialog()
  })
  angular.element(document.getElementById('map')).bind('click', function() {
    $scope.hideDialog()
  })

  $scope.hideDialog = function () {
    // Only do stuff if the dialog is actually open
    if ($scope.showDialog == true) {
      // Hide dialog
      $scope.showDialog = false
      document.querySelector('#return').style.marginTop = '-200px'
    }
  }

  function showDialog () {
    if ($scope.showDialog == false) {
      $scope.showDialog = true
      document.querySelector('#return').style.marginTop = 0      
    }
  }


})

/*******************************************************************************************/
/* Copied from ui.bootstrap */

angular.module("ui.bootstrap", ["ui.bootstrap.transition","ui.bootstrap.collapse"]);

angular.module('ui.bootstrap.transition', [])

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
    if ( angular.isString(trigger) ) {
    element.addClass(trigger);
    } else if ( angular.isFunction(trigger) ) {
    trigger(element);
    } else if ( angular.isObject(trigger) ) {
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

angular.module('ui.bootstrap.collapse',['ui.bootstrap.transition'])

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
