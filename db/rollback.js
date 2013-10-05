#!/usr/bin/env node

var exec = require('child_process').exec;

console.log('Rolling back...');

exec('db-migrate down --config config/database.json --migrations-dir db/migrations -e "$FP_NODE_ENV"', function () {
  console.log('Database rolled back successfully.');
});
