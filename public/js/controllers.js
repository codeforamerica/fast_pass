'use strict';

/* Controllers */

var appCtrls = angular.module('dof.controllers', []);

// SECTION 10 - NAICS Business Category search
appCtrls.controller('10Ctrl', function ($scope, $http, UserData) {

	// This is the endpoint URL.
	// NOTE: For future reference, it should probably not be dependent on the extenal API.
	var searchAPI   = 'http://api.naics.us/v0/s?year=2012&collapse=1&terms='

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

	var addressEndpoint = 'http://mapdata.lasvegasnevada.gov/clvgis/rest/services/CLVPARCELS_Address_Locator/GeocodeServer/findAddressCandidates?&outFields=&outSR=4326&searchExtent=&f=json&Street='

	// Prepopulate form if we already know it
	$scope.addressInput = $scope.userdata.property.address

//		$scope.map = {controller: 'MapAddressInputCtrl'}
	$scope.findAddress = function (input) {
		// Store raw search inputs for future analysis
		$scope.userdata.rawInputs.addressSearch.push(input)

		// Assemble search endpoint URL based on user input
		var addressURL = addressEndpoint + encodeURIComponent(input)

		// Reset display
		$scope.searchErrorMsg = ''
		$scope.searchResults  = false

		// Display loading icon
		$scope.searchLoading  = true

		// Get address search results
		$http.get(addressURL).
			success( function (response) {

				// Turn off loader
				$scope.searchLoading = false

				// Extract results from response
				var results = response.candidates

				if (results.length == 0) {
					// Message for no results
					$scope.searchErrorMsg = 'No addresses found for ‘' + input + '’.'
				} else if (results[0].score >= 95) {
					
					// If first result is a pretty good match, just take it
					_saveAddress(results[0])

					// Forward this interaction directly.
					// This breaks forward/back apparently.
					window.location.hash = encodeURIComponent('/section/50')

				} else {
					// Multiple results found - user select now.
					$scope.searchResults = results
				}

				// Store raw search inputs for future analysis
				$scope.userdata.rawInputs.businessSearch.push(input)

			}).
			error( function () {

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
		$scope.userdata.property.address  = data.address.capitalize()
		$scope.userdata.property.location = data.location
		$scope.userdata.property.score    = data.score
	}

})

appCtrls.controller('45Ctrl', function ($scope, UserData) {
	$scope.userdata = UserData
	$scope.userdata.nav.pathTo50 = 45    // Remember the current section to preserve path in the future

})

// SECTION 50 - PARCEL VIEW
appCtrls.controller('50Ctrl', function ($scope, UserData) {
	$scope.userdata = UserData

	// Switch back navigation based on user's path
	if ($scope.userdata.nav.pathTo50 == 45) {
		$scope.previousIsZoningOverview = true
		$scope.previousIsAddressSearch = false
	} else {
		// Assume address search is the default condition.
		$scope.previousIsZoningOverview = false
		$scope.previousIsAddressSearch = true
	}

	// Load dummy parcel information
	$scope.parcel = {
		number:          '292-299-29',
		address:         $scope.userdata.property.address,
		master_address:  $scope.userdata.property.address,
		record_adresses: [
			'123 Main Street',
			'145 Main Street',
			'168 Chuck Testa'
		]
	}

})

appCtrls.controller('70Ctrl', function ($scope, UserData) {

	$scope.userdata = UserData

})

appCtrls.controller('MapCtrl', function ($scope, $http, MapService) {

	$scope.mapService = MapService
	var cityLimitsGeoJSON = '/data/clv-city-limits.geojson'

	// Get a matched business type
	$http.get(cityLimitsGeoJSON).success( function (stuff) {


	})

	this.doStuff = function () {
		console.log('clicked')
	}


})

appCtrls.controller('PrintView', function ($scope, $http, UserData) {
	$scope.userdata = UserData

	$scope.reportId  = $scope.userdata.reportId
	$scope.reportDate = new Date ()

	// Open print dialog box
	// Dumb hack to activate print dialog only after CSS transitions are done
	// Also prevents the dialog from opening before Angular is ready (but there should be a better fix for this...)
	var timeout = window.setTimeout(print, 800);

	function print() {
		window.print()
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
