'use strict';

/* Controllers */

angular.module('dof.controllers', [])

	// SECTION 10 - NAICS Business Category search
	.controller('10Ctrl', function ($scope, $http, UserData) {

		// This is the endpoint URL.
		// NOTE: For future reference, it should probably not be dependent on the extenal API.
		var searchAPI   = 'http://api.naics.us/v0/s?year=2012&collapse=1&terms='

		// Attach global UserData to this controller.
		$scope.userdata = UserData

		// Set defaults for scope variables
		$scope.searchInput = ''
		$scope.searchResults = false
		$scope.searchLoading = false
		$scope.searchErrorMsg = ''
		$scope.searchPerformed = false
		$scope.selectedResult = null

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
						$scope.userdata.naics.input = $scope.searchInput
					}

				}).
				error( function () {

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
	.controller('12Ctrl', function ($scope, $http, UserData) {

		$scope.userdata = UserData

		var dataURL = '/data/business-types-desc.json';
//		var dataURL = '/data/business-types.json';
//		Note: these are coming from different sources, and seems to have different categories. Need to confirm.

		// Get a matched business type
		$http.get(dataURL).success( function (stuff) {

			// DEMO - grab a random business type from the array.
			$scope.userdata.businessCategory = stuff[Math.floor(Math.random() * stuff.length)];

		});

		// UI.Bootstrap collapse
		$scope.isCollapsed = true;

	})

	.controller('15Ctrl', function ($scope, UserData) {

		$scope.userdata = UserData

	})

	// SECTION 20 - ADDITIONAL BUSINESS
	.controller('20Ctrl', function ($scope, $http, UserData) {
		$scope.userdata = UserData

		var dataURL = '/data/additional-business.json'

		// Display additional businesses
		$http.get(dataURL).success( function (data) {
			$scope.additionalBusiness = data;
		});
	})


	// SECTION 40 - Enter a location
	.controller('40Ctrl', function ($scope) {

//		$scope.map = {controller: 'MapAddressInputCtrl'}
		$scope.findAddress = function () {
			// Temporarily forward this interaction directly.
			window.location.hash = encodeURIComponent('/section/50')
		
			// In the future this needs to do actual work.
			// It will send information to an endpoint and retrieve address / parcel data.

			// Errors to return:
			// -  This address could not be found in Las Vegas.
			// -  Did you mean.... (keep on this screen?)
		}

	})
	.controller('MapCtrl', function ($scope) {

		map.on('click', function () {
			alert('hey')
		})

	})

	.controller('45Ctrl', function ($scope, UserData) {

		$scope.userdata = UserData

	})

	.controller('70Ctrl', function ($scope, UserData) {

		$scope.userdata = UserData

	});

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
