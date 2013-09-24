var Model = require('./model')
var proj4 = require('proj4js')

var EPSG_4326   = 'EPSG:4326'
var ESRI_102707 = 'ESRI:102707'

var DEFS = {}

DEFS[EPSG_4326] = 'EPSG:4326'
DEFS[ESRI_102707] = '+proj=tmerc +lat_0=34.75 +lon_0=-115.5833333333333 +k=0.999900 +x_0=200000 +y_0=7999999.999999999 +ellps=GRS80 +datum=NAD83 +to_meter=0.3048006096012192  no_defs'

var Point = Model.extend({

  defaults: {
    'x': undefined,
    'y': undefined,
    'proj': EPSG_4326
  },

  getCoords: function () {
    return [this.get('x'), this.get('y') ];
  },

  setCoords: function (coords) {
    this.set({ x: coords[0], y: coords[1] });
    return this;
  },

  toEPSG4326: function () {
    this._convertProj(EPSG_4326);
    return this;
  },

  toESRI102707: function () {
    this._convertProj(ESRI_102707);
    return this;
  },

  _convertProj: function (toName) {
    var fromDef = DEFS[this.get('proj')];
    var toDef   = DEFS[toName];

    if (fromDef === toDef) return false;

    if (fromDef && toDef) {
      this.setCoords(proj4(fromDef, toDef, this.getCoords()))
      this.set({ proj: toName });
    }

    return true;
  }

});

module.exports = Point
