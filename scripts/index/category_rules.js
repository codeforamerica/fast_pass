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
      allCategories(client, function (categories) {
        allRules(client, function (rules) {
          UT.each(categories, function (category) {
            UT.each(rules, function (rule) {
              var mockSession = createMockSession(category);
              if (validator.doesRuleApply(rule.data, mockSession)) {
                createIndex(client, category, rule, function (err, result) {
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

var createMockSession = function (category) {
  return {
    "category_code": category.data.code 
  }
}

var allCategories = function (client, cb) {
  client.query('SELECT * FROM categories;', function (err, result) {
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

var createIndex = function (client, category, rule, cb) {
  client.query('INSERT INTO category_rules (category_id, rule_id) VALUES($1, $2)', [ category.id, rule.id ], cb);
}

console.log('Performing Category Rules Index....')
perform(function () {
  console.log('Indexing completed.')
})
