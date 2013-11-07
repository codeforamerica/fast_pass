'use strict';

/*************************************************************************
// 
// SERVICES
//
// ***********************************************************************/

(function (ng) {

  var services = ng.module(APPLICATION_NAME + '.services', [ 'ngResource' ]);

  services.factory('Model', [ 'utils',

    function (utils) {
      var func = function () {}

      var Model = function (attributes) {
        if ( !ng.isObject(attributes) && !ng.isUndefined(attributes) ) {
          throw("'attributes' must be an instance of 'object'");
        }

        attributes = attributes || {}
        this.attributes = {};
        attributes = utils.defaults(attributes, this.defaults);
        this.set(attributes)

        this.initialize.apply(this, arguments);
      }

      ng.extend(Model.prototype, {
        initialize: func,

        defaults: {},

        set: function (attrs) {
          ng.extend(this.attributes, attrs);
          return attrs;
        },

        get: function (attr) {
          return this.attributes[attr]    
        },

        toJSON: function () {
          return ng.copy(this.attributes);
        }
      });

      Model.extend = function(protoProps, staticProps) {
        var parent = this;
        var child;

        if (protoProps && protoProps.hasOwnProperty('constructor')) {
          child = protoProps.constructor;
        } else {
          child = function(){ return parent.apply(this, arguments); };
        }

        ng.extend(child, parent, staticProps);

        var Surrogate = function(){ this.constructor = child; };
        Surrogate.prototype = parent.prototype;
        child.prototype = new Surrogate;

        if (protoProps) ng.extend(child.prototype, protoProps);

        child.__super__ = parent.prototype;

        return child;
      };

      return Model;
    }

  ])

  services.factory('WebStorage', [ 'Model',
    function (Model) {

      var driver = new Persist.Store(APPLICATION_NAME);

      var WebStorage = Model.extend({
        save: function () {
          return driver.set('data', ng.toJson( this.toJSON() ));
        },
        remove: function () {
          return driver.remove('data');
        }
      });

      WebStorage.load = function () {
        var data = driver.get('data');

        if (data) {
          data = ng.fromJson(data);
        }

        return new WebStorage(data || {});
      }

      return WebStorage.load();
    }
  ]);

  services.factory('Session', ['utils', '$resource', 'WebStorage', 'Model',
    function (utils, $resource, WebStorage, Model) {

      var API = $resource('api/sessions/:id', { }, {
        find:   { method: 'GET', params: { id: '@id' } },
        update: { method: 'PUT', params: { id: '@id' } },
        create: { method: 'POST' }
      });

      var Session = Model.extend({

        defaults: {
          naics_code: null,
          naics_keywords: null,
          description: null
        },

        reset: function () {
          this.attributes = ng.copy(this.defaults);
          this.save();
        },

        save: function () {
          var session = this;

          var onSuccess = function (res) {
            session.set(res.data);
            WebStorage.set({ session: session.toJSON() });
            WebStorage.save();
          }

          var onError = function (err) {
            console.log('An error occurred when saving the session.');
          }

          if (this.isPersisted()) {
            API.update({ id: 1 }, onSuccess, onError); 
          } else {
            API.create({ id: 1 }, onSuccess, onError);
          }
        },

        isPersisted: function () {
          return ng.isDefined(this.get('id'));
        }

      });

      Session.findOrCreate = function () {
        return new Session( WebStorage.get('session') || {} );
      }

      return Session.findOrCreate();
    }
  ]);

  services.factory('Address', ['utils', '$resource', 'Model',
    function (utils, $resource, Model) {
      var API = $resource('api/geo/geocode', { }, {
        search:   { method: 'GET', params: { address: '@address' }, isArray: true }
      });

      var Address = Model.extend({
        defaults: {
          city: null,
          state: null,
          address: null,
          zipcode: null,
          latitude: null,
          longitude: null
        },
        position: function () {
          return [ this.get('latitude'), this.get('longitude') ].join(',')
        }
      }, {
        search: function (params, success, error) {
          var onSuccess = function (results) {
            var addresses = utils.map(results, function (result) {
              return new Address(result);
            }); 
            success(addresses);
          }

          API.search(params, onSuccess, error);
        }
      });

      return Address;
    }
  ]);

  services.factory('Parcel', ['$resource', 'Model',
    function ($resource, Model) {
      var API = $resource('api/sessions/:id', { }, {
        find:   { method: 'GET', params: { id: '@id' } }
      });

      var Parcel = Model.extend({
      
      }, {

      });

      return Parcel;
    }
  ]);

  services.factory('Neighborhood', ['utils', '$resource', 'Model',
    function (utils, $resource, Model) {
      var API = $resource('api/geo/neighborhoods', { }, {
        index: { method: 'GET', isArray: true }
      });

      var Neighborhood = Model.extend({
        defaults: {
          name: null,
          geojson: null
        } 
      }, {
        all: function (params, success, error) {
          var onSuccess = function (results) {
            success(utils.map(results, function (result) {
              return new Neighborhood(result) 
            }));
          }

          API.index(params, onSuccess, error) 
        }
      });

      return Neighborhood;
    }
  ]);

  services.factory('City', ['$resource', 'Model',

    function ($resource, Model) {
      var API = $resource('api/geo/city', { }, {
        find: { method: 'GET' }
      });

      var City = Model.extend({
        defaults: {
          name: null,
          geojson: null
        } 
      }, {
        find: function (params, success, error) {
          var onSuccess = function (result) {
            success(new City(result))
          }

          API.find(params, onSuccess, error) 
        }
      });

      return City;
    }

  ]);


  services.factory('NAICSCategory', ['utils', '$resource', 'Model',

    function (utils, $resource, Model) {
      var API = $resource('api/categories/naics', {}, {
        search: { method: 'GET', params: { keywords: null }, isArray: true }
      });

      var NAICSCategory = Model.extend({
        defaults: {
          index: null,
          code: null,
          description: null,
          title: null,
          seq_no: null
        }
      }, {
        search: function (params, success, error) {
          var onSuccess = function (results) {
            success(utils.map(results, function (result) {
              return new NAICSCategory(result);
            }));
          }
          API.search(params, onSuccess, error);
        } 
      });

      return NAICSCategory;
    }

  ]);

  services.factory('MapMarker', [

    function () {
      var MapMarker = function (lat, lng) {
        this.marker = new google.maps.Marker({
          position: new google.maps.LatLng(lat, lng),
          clickable: false
        });
      }

      MapMarker.prototype = {
        add: function (map) {
          this.marker.setMap(map);
        },
        remove: function () {
          this.marker.setMap(null);
        },
        setPosition: function (lat, lng) {
          this.marker.setOptions({ position: new google.maps.LatLng( lat, lng ) });
        },
        setClickable: function (clickable) {
          this.marker.setOptions({ clickable: clickable });
        }
      }

      return MapMarker;
    }

  ]);

  services.factory('MapOverlay', [ 'utils',

    function (utils) {
      var _iter = function (obj, cb) {
        if (ng.isArray(obj)) {
          ng.forEach(obj, function (item) {
            _iter(item, cb);
          });
        } else {
          cb(obj);
        }
      }

      var GeoJSONOverlay = function (geojson, options) {
        options = options || {};
        this.overlay = new GeoJSON(geojson, utils.defaults(options, this.defaults));
        if (ng.equals(this.overlay.type, "Error")) this.error = true
      }

      GeoJSONOverlay.prototype = {
        error: false,
        defaults: {
          clickable: false,
          fillColor: '#ff0000',
          fillOpacity: 0,
          strokeColor: '#ff0000',
          strokeOpacity: 1,
          strokeWeight: 0
        },
        add: function (map) {
          _iter(this.overlay, function (obj) {
            obj.setMap(map);
          });
          return this;
        },
        remove: function () {
          _iter(this.overlay, function (obj) {
            obj.setMap(null);
          });
          return this;
        },
        setClickable: function (clickable) {
          _iter(this.overlay, function (obj) {
            obj.setOptions({ clickable: clickable });
          });
          return this;
        },
        setFillOpacity: function (opacity) {
          _iter(this.overlay, function (obj) {
            obj.setOptions({ fillOpacity: opacity });
          });
          return this;
        },
        setFillColor: function (color) {
          _iter(this.overlay, function (obj) {
            obj.setOptions({ fillColor: color });
          });
          return this;
        },
        setStrokeOpacity: function (opacity) {
          _iter(this.overlay, function (obj) {
            obj.setOptions({ strokeOpacity: opacity });
          });
          return this;
        },
        setStrokeColor: function (color) {
          _iter(this.overlay, function (obj) {
            obj.setOptions({ strokeColor: color });
          });
          return this;
        },
        setStrokeWeight: function (weight) {
          _iter(this.overlay, function (obj) {
            obj.setOptions({ strokeWeight: weight });
          });
          return this;
        }
      }

      return {
        fromGeoJSON: function (geojson, options) {
          return new GeoJSONOverlay(geojson, options);
        }
      }
    }

  ]);

  services.factory('Map', [ '$timeout', 'MapOverlay', 'MapMarker',

    function ($timeout, MapOverlay, MapMarker) {

      var Map = function (map) {
        this.reset(map);
      } 

      Map.Marker = MapMarker;
      Map.Overlay = MapOverlay;

      Map.prototype = {
        markers: [],
        overlays: [],
        addMarker: function (marker) {
          var that = this;

          $timeout(function () {
            marker.add(that.map);
            that.markers.push(marker);
          });

          return this;
        },
        removeMarker: function (marker) {
          var position = this.markers.indexOf(marker);

          if (~position) {
            marker.remove();
            this.markers.splice(position, 1);
          }

          return this;
        },
        clearMarkers: function () {
          var that = this;

          $timeout(function () {
            ng.forEach(that.markers, ng.bind(that.removeMarker, that));
          });

          return this;
        },
        addOverlay: function (overlay) {
          var that = this;

          $timeout(function () {
            that.overlays.push(overlay);
            overlay.add(that.map);
          });

          return this;
        },
        removeOverlay: function (overlay) {
          var position = this.overlays.indexOf(overlay);

          if (~position) {
            this.overlays.slice(position, 1);
            overlay.remove();
          }

          return this;
        },
        clearOverlays: function () {
          var that = this;

          $timeout(function () {
            ng.forEach(that.overlays, ng.bind(that.removeOverlay, that));
          });

          return this;
        },
        setCenter: function (lat, lng) {
          var that = this;

          $timeout(function () {
            that.map.setCenter( new google.maps.LatLng(lat, lng) );
          });

          return this;
        },
        setZoom: function (zoom) {
          var that = this;

          $timeout(function () {
            that.map.setZoom( zoom ); 
          });

          return this;
        },
        reset: function (map) {
          if (map) {
            this.map = map;
            this.clearOverlays().clearMarkers().trigger('resize');
          }
        },
        trigger: function (e) {
          var that = this;

          $timeout(function () {
            google.maps.event.trigger(that.map, e);
          });

          return this;
        },
        on: function (e, cb) {
          var that = this;

          $timeout(function () {
            google.maps.event.addListener(that.map, e, cb);
          });

          return this;
        }
      }

      return Map;
    }  
  ]);

  services.factory('CategoryKeywords', ['utils',

    function (utils) {
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

      return {
        random: function () {
          return utils.random(SAMPLE_INPUTS);
        } 
      }
    }

  ]);

  services.factory('utils', [
    
      function () {

        var Utils = function () {}

        Utils.prototype = {
          map: function (obj, iterator, context) {
            var results = []; 

            if ( ng.equals(obj, null) ) {
              return results;
            }

            if ( Array.prototype.map && ng.equals(obj.map, Array.prototype.map) ) {
              return obj.map(iterator, context);
            }

            ng.forEach(obj, function (value, index, list) {
              results.push( iterator.call(context, value, list) );
            });

            return results;
          },
          defaults: function (obj) {
            ng.forEach(Array.prototype.slice.call(arguments, 1), function (source) {
              if (source) {
                for (var prop in source) {
                  if (ng.isUndefined(obj[prop])) obj[prop] = source[prop]
                }
              }
            });
            return obj;
          },
          random: function (obj) {
            if (ng.isArray(obj)) {
              return obj[Math.floor( Math.random(obj.length) )];
            }
          }
        }
      
        return new Utils();
      }
  ]);

})(angular)
