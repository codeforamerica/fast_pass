var Model = require('./model')
var naics = require( process.cwd() + '/data/naics-2012.json' );

var NAICSCategory = Model.extend({
  attributes: {
    title: undefined,
    description: undefined,
    code: undefined
  }
})

module.exports = NAICSCategory;
