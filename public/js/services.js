'use strict';

/*************************************************************************
// 
// SERVICES
//
// ***********************************************************************/

(function (ng) {

  var services = ng.module(APPLICATION_NAME + '.services', [ 'ngResource' ]);

  services.factory('Model', [

    function () {
      var func = function () {}

      var Model = function (attributes) {
        if (typeof(attributes) !== 'undefined' && typeof(attributes) !== 'object') {
          throw("'attributes' must be an instance of 'object'") 
        }
        attributes = attributes || {}
        this.attributes = {}
        attributes = utils.defaults(attributes, this.defaults);
        this.set(attributes)
        this.initialize.apply(this, arguments);
      }

      utils.extend(Model.prototype, {
        initialize: func,

        attributes: {},

        set: function (attrs) {
          utils.extend(this.attributes, attrs);
          return attrs;
        },

        get: function (attr) {
          return this.attributes[attr]    
        },

        toJSON: function () {
          return this.attributes;
        }
      });

      Model.extend = function(protoProps, staticProps) {
        var parent = this;
        var child;

        if (protoProps && utils.has(protoProps, 'constructor')) {
          child = protoProps.constructor;
        } else {
          child = function(){ return parent.apply(this, arguments); };
        }

        utils.extend(child, parent, staticProps);

        var Surrogate = function(){ this.constructor = child; };
        Surrogate.prototype = parent.prototype;
        child.prototype = new Surrogate;

        if (protoProps) utils.extend(child.prototype, protoProps);

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
          return driver.set('data', JSON.stringify(this.toJSON()));
        },
        remove: function () {
          return driver.remove('data');
        }
      });

      WebStorage.load = function () {
        var data = driver.get('data');

        if (data) {
          data = JSON.parse(data);
        }

        return new WebStorage(data || {});
      }

      return WebStorage.load();
    }
  ]);

  services.factory('Session', ['$resource', 'WebStorage', 'Model',
    function ($resource, WebStorage, Model) {

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
          this.set(utils.defaults(this.defaults, {}));
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
          return typeof(this.get('id')) !== 'undefined';
        }

      });

      Session.findOrCreate = function () {
        return new Session( WebStorage.get('session') || {} );
      }

      return Session.findOrCreate();
    }
  ]);

  services.factory('Address', ['$resource', 'Model',
    function ($resource, Model) {
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

  services.factory('Neighborhood', ['$resource', 'Model',
    function ($resource, Model) {
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


  services.factory('NAICSCategory', ['$resource', 'Model',
    function ($resource, Model) {
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

  services.factory('Map', [ '$timeout',
    function ($timeout) {

      var getPosition = function (lat, lng) {
        return new google.maps.LatLng(lat, lng);
      }

      var Map = function (map) {
        this.reset(map);
      } 

      Map.prototype = {
        addMarker: function (lat, lng) {
          var that = this;
          $timeout(function () {
            var marker = new google.maps.Marker({
              position: getPosition(lat, lng),
              map: that.map
            })
            that.markers.push(marker);
          });
        },
        clearMarkers: function () {
          var that = this;
          $timeout(function () {
            ng.forEach(that.markers, function (marker) {
              marker.setMap(null);
            }) 
          });
        },
        addOverlay: function (geojson, options) {
          var that = this;

          $timeout(function () {
            var geo  = new GeoJSON(geojson, options);

            if (!geo.error) {
              ng.forEach(geo, function (shape) {
                if (Array.isArray(shape)) {
                  ng.forEach(shape, function (geom) {
                    geom.setMap(that.map) 
                    that.overlays.push(geom);
                  }) 
                } else {
                  shape.setMap(that.map);
                  that.overlays.push(shape);
                }
              })
            }
          });
        },
        clearOverlays: function () {
          var that = this;
          $timeout(function () {
            ng.forEach(that.overlays, function (overlay) {
              overlay.setMap(null);
            });
            that.overlays = [];
          });
        },
        setCenter: function (lat, lng) {
          var that = this;
          $timeout(function () {
            that.map.setCenter( getPosition(lat, lng) );
          });
        },
        setZoom: function (zoom) {
          var that = this;
          $timeout(function () {
            that.map.setZoom( zoom ); 
          });
        },
        reset: function (map) {
          this.map = map; 
          this.markers = [];
          this.overlays = [];
        }
      }

      return Map;
    }  
  ]);

})(angular)
