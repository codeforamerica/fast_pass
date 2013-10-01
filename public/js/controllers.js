'use strict';

/* Controllers */

var appCtrls = angular.module(appName + '.controllers', []);

// START OF APPLICATION
appCtrls.controller('StartCtrl', function ($scope, $location, UserData) {

	$scope.userdata = UserData

	// Clear application data if directed
	if (_getQueryStringParams('clear') == 'true') {
		$scope.userdata = {}
		_clearLocalStorage()
		console.log('User data cleared.')
	}

})

// SECTION 10 - NAICS Business Category search
appCtrls.controller('10Ctrl', function ($scope, $http, UserData) {

	// This is the endpoint URL.
	var searchAPI   = 'http://api.naics.us/v0/s?year=2012&collapse=1&terms='
//	var searchAPI = '/categories/search?keywords='

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
					$scope.searchResults = results
					$scope.searchPerformed = true			
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
		var dataURL = '/data/business-types-desc.json';
	//		var dataURL = '/data/business-types.json';
	//		Note: these are coming from different sources, and seems to have different categories. Need to confirm.

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
	$scope.debug = true

//	var addressEndpoint = 'http://mapdata.lasvegasnevada.gov/clvgis/rest/services/CLVPARCELS_Address_Locator/GeocodeServer/findAddressCandidates?&outFields=&outSR=4326&searchExtent=&f=json&Street='
//	var addressEndpoint = '/address/suggest?address='
	var addressEndpoint = 'http://clvplaces.appspot.com/maptools/rest/services/geocode?jsonCallback=JSON_CALLBACK&score=20&format=json&address='

	var latLngEndpoint = 'http://clvplaces.appspot.com/maptools/rest/services/geocode?jsonCallback=JSON_CALLBACK&score=20&format=json&latlng='
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
		$http.jsonp(addressURL).
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
		$scope.parcel =	$scope.userdata.property

		// Set display
		$scope.title = $scope.userdata.property.address
		$scope.parcelLoaded  = true

		return
	}

	// Request URL endpoint
	var parcelRequestEndpoint = 'http://clvplaces.appspot.com/maptools/rest/services/agsquery?jsonCallback=JSON_CALLBACK&latlng='
	// latlng= URL query string format needs to look like this:
	// latlng=(36.167352999999999,-115.148408)
	// e.g. += '(' + lat + ',' + lng + ')'

	// Get locations
	var parcelLat = $scope.userdata.property.location.y
	var parcelLng = $scope.userdata.property.location.x

	if (!parcelLat || !parcelLng) {
		$scope.errorMsg = 'No parcel provided.'
		return false
	}

	// Assemble search endpoint URL based on user input
	var parcelRequestURL = parcelRequestEndpoint + '(' + parcelLat + ',' + parcelLng + ')'

	// Turn on loader
	$scope.searchLoading = true

	// AJAX it
	$http.jsonp(parcelRequestURL).
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

appCtrls.controller('MapCtrl', function ($scope, $http, MapService) {

	$scope.mapService = MapService

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
//		streetViewControl: false,
		styles: $scope.mapStyles,
		zoomControlOptions: {
			style: google.maps.ZoomControlStyle.LARGE
		}
	};

	var cityLimitsGeoJSON = '/data/clv-city-limits.geojson'

	// Get a matched business type
	$http.get(cityLimitsGeoJSON).success( function (stuff) {

	})

	$scope.mapClick = function ($event, $params) {

		$scope.mapService.clicked.lat = $event.latLng.lat()
		$scope.mapService.clicked.lng = $event.latLng.lng()

	}


	this.doStuff = function () {
		$scope.mapService.clicked.lat = document.getElementById('mapServiceLat').value
		$scope.mapService.clicked.lng = document.getElementById('mapServiceLng').value
	}


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
	// $scope.showDialog = false

	// Display this if user arrives to a page in this application and 
	// user data is already stored in Local Storage.
	if (_checkLocalStorage() == true) {
		console.log('Something is in local storage.')

		// Load data from local storage
		var localStorage = _loadLocalStorage()
		console.log(localStorage)
		$scope.userdata = localStorage
		// ??
		UserData = localStorage

		// Is a "promise object" required to make sure the page loads up the stored user data first?

		// Redirect route to last recorded section
		window.location.href = window.location.origin + '/#/section/' + $scope.userdata.nav.current

		// Show the return dialog box
		// $scope.showDialog = true
		var timeout = setTimeout(showDialog, 800)
	}
	else {
		// Nothing is in local storage and that person should start from the beginning
		// console.log('Application not previously started. Starting from beginning.')
		// window.location.href = '/#/'
	}

	$scope.hideDialog = function () {
		$scope.showDialog = false
		$scope.returnDialog = false
		document.querySelector('#return').style.marginTop = '-200px'
	}

	function showDialog () {
		document.querySelector('#return').style.marginTop = 0
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
