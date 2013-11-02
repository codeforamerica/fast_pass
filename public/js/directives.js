/*************************************************************************
// 
// DIRECTIVES
//
// ***********************************************************************/

var directives = {}
app.directive(directives)

directives.disableButton = function () {
  return {
    restrict: 'A',
    link: function (scope, el, attrs) {
      scope.$watch(attrs.disableButton, function (value) {
        if (value) {
          el.addClass('disabled');
        } else {
          el.removeClass('disabled');
        }
      });
    }
  }
}

directives.googleMap = function () {
  var defaultOptions = {
    zoom: 11,
    minZoom: 11,
    maxZoom: 19,
    center: new google.maps.LatLng(36.168, -115.144),
    backgroundColor: '#f1f1f4',
    draggable: false,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    zoomControlOptions: {
      style: google.maps.ZoomControlStyle.LARGE
    }
  }

  return {
    restrict: 'E',
    scope: {
      mapWrapper: '=map',
      mapOptions: '=mapOptions',
      mapId: '@mapId'
    },
    replace: true,
    controller: function ($scope) {
      $scope.options = utils.defaults(defaultOptions, ($scope.mapOptions || {}));
      $scope.map = null;
      $scope.$watch('map', function (map) {
        if (map) {
          $scope.mapWrapper.reset(map);
        }
      });
    },
    template: '<div id="{{mapId}}" ui-map="map" ui-options="options"></div>'
  }
}

directives.searchResult = function () {
  return {
    restrict: 'E',
    scope: {
      result: '=',
      selected: '=',
      select: '&'
    },
    link: function (scope, el, attrs) { 
      scope.$watch('selected', function (value) {
        if (value && value == scope.result) {
          el.addClass('selected');
          el.find('button').text('Selected');
        } else {
          el.removeClass('selected');
          el.find('button').text('Select');
        }
      })
    }
  }
}

directives.searchForm = function () {
  return {
    restrict: 'E',
    scope: {
      action: '&',
      terms: '=',
      placeholder: '@'
    },
    link: function (scope, el, attrs) {
    },
    templateUrl: 'partials/search_form',
  }
}

directives.navigation = function () {
  return {
    restrict: 'E',
    replace: true,
    scope: {
      back: '@',
      next: '@',
      backDisable: '=',
      nextDisable: '='
    },
    templateUrl: 'partials/navigation'
  }
}

directives.scrollfix = function () {
	// Elements with 'scrollfix' directive (placed on the class, for additional CSS)
	// will be fixed in place in the window once its top scrolls to a certain point
	// in the window.
	return {
		restrict: 'C',
		link: function (scope, element, $window) {

			var $page  = angular.element(window)
			var $el    = element[0]
			var margin = 40         // # of pixels to keep as a margin for scrollfix'd element
			var windowScrollTop     = window.pageYOffset   
									// # of pixels that page has scrolled above viewport
			var elScrollTop         = $el.getBoundingClientRect().top
									// # of pixels between top of element and top of viewport
			var elScrollTopOriginal = elScrollTop
									// Remember this for later

			$page.bind('scroll', function () {

				windowScrollTop = window.pageYOffset
				elScrollTop     = $el.getBoundingClientRect().top

				if (elScrollTop <= margin) {
					// if element has scrolled to a point less than the margin,
					// make it a fixed element.
			        element.css('position', 'fixed').css('top', '40px');
				}
				if ( windowScrollTop <= elScrollTopOriginal) {
					// if window has scrolled to a point below the original position
					// convert it back to a relatively positioned element.
					element.css('position', 'relative').css('top', '0').css('margin-left', '0');
				}
			})

		}
	}
}

directives.externalLink = function () {
	// Buttons with 'data-external-link' attribute will go to the provided
	// URL when clicked.
	return function (scope, element, attrs) {

		var url = attrs.externalLink

		element.bind('mouseup', function () {
			if (url) {
				window.open(url, '_blank')
			}			
		})

	}
}

directives.progressbar = function () {
	// Show a basic progress bar.
	// Write it in the templates as <progressbar step='X'></progressbar>
	// where X is the position of the bar
	return {
		restrict: 'E',
		replace: true,
		scope: {
			step: '@'
		},
		templateUrl: '/partials/_progressbar',
		link: function (scope, element) {
			var item = element.find('li')

			// remove highlight from all steps
			item.removeClass('highlight')

			// add highlight to the one that matches the given step
			for (var i = 0; i < item.length; i++) {
				if (scope.step == i + 1) {
					// addClass() doesn't work on these, which is SO DUMB
					item[i].className = 'highlight'
				}
			}
		}
	}
}

directives.maxWords = function () {
  var count = function (str) {
    str = str || '' 
    var matches = str.match(/\S+/g) || [];
    return matches.length;
  }

  return {
    restrict: 'A',
    scope: {
      words: '=',
      maxWords: '@'
    },
    link: function (scope, el, attrs) {
      scope.countdown = scope.maxWords - count(scope.words); 
      scope.$watch('words', function () {
        scope.countdown = scope.maxWords - count(scope.words);
        if (scope.countdown <= 0) {
          scope.warning = 'warning' 
        } else {
          scope.warning = null; 
        }
      });
    }
  }
}
