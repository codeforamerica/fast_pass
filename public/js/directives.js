/*************************************************************************
// 
// DIRECTIVES
//
// ***********************************************************************/

var directives = angular.module(APPLICATION_NAME + '.directives', [ 'ui.map' ]);

directives.directive('disableButton', [

  function () {
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

]);

directives.directive('googleMap', [

  function () {
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
    
]);

directives.directive('searchResult', [

  function () {
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

]);

directives.directive('searchForm', [

  function () {
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

]);

directives.directive('navigation', [

  function () {
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

]);

directives.directive('scrollFix', [

  function () {
    return {
      restrict: 'C',
      scope: true,
      link: function (scope, el, attrs) {
        var $page = angular.element(window);
        var $el = element[0];
        var margin = 40;
        var windowScrollTop = window.pageYOffset;
        var elScrollTop = $el.getBoundingClientRect().top;
        var elScrollTopOriginal = elScrollTop;

        $page.bind('scroll', function () {
          windowScrollTop = window.pageYOffset;
          elScrollTop = $el.getBoundingClientRect().top;
          if (elScrollTop <= margin) {
            element.css('position', 'fixed').css('top', '40px');
          }
          if ( windowScrollTop <= elScrollTopOriginal) {
            element.css('position', 'relative').css('top', '0');
          }
        });
      }
    }
  }  

]);

directives.directive('externalLink', [

  function () {
    return {
      restrict: 'A',
      link: function (scope, el, attrs) {
        var url = attrs.externalLink;
        element.bind('mouseup', function () {
          if (url) {
            window.open(url, '_blank');
          }	
        })
      } 
    }
  }  

]);

directives.directive('progressbar', [

  function () {
    return {
      restrict: 'E',
      replace: true,
      scope: {
        step: '@'
      },
      templateUrl: '/partials/progressbar'
    }
  }

]);

directives.directive('maxWords', [

  function () {
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

]);
