#!/usr/bin/env node

var DB = require( process.cwd() + '/db/driver' );
var RV = require( process.cwd() + '/lib/rule_validator' );
var UT = require( process.cwd() + '/lib/utils' );

var validator = new RV({ "enforceStrict": false });

var perform = function (cb) {
  DB.connect(function (err, client) {
    if (err) {
      throw(err) 
    } else {
      allParcels(client, function (parcels) {
        allRules(client, function (rules) {
          UT.each(parcels, function (parcel) {
            UT.each(rules, function (rule) {
              var mockSession = createMockSession(parcel);
              if (validator.doesRuleApply(rule.data, mockSession)) {
                createIndex(client, parcel, rule, function (err, result) {
                  // Console log?
                });
              }
            });
          });
        });
      });
    }
  });
}

var createMockSession = function (parcel) {
  return parcel.data;
}

var allParcels = function (client, cb) {
  client.query('SELECT * FROM parcels;', function (err, result) {
    if (err) throw(err);
    cb(result.rows);
  })
}

var allRules = function (client, cb) {
  client.query('SELECT * FROM rules;', function (err, result) {
    if (err) throw(err);
    cb(result.rows);
  })
}

var createIndex = function (client, parcel, rule, cb) {
  client.query('INSERT INTO parcel_rules (parcel_id, rule_id) VALUES($1, $2)', [ parcel.id, rule.id ], cb);
}

console.log('Performing Parcel Rules Index....')
perform(function () {
  console.log('Indexing completed.')
})
