#!/usr/bin/env node

var exec = require('child_process').exec;

console.log('Migrating...\n');

exec('db-migrate up --config config/database.json --migrations-dir db/migrations -e "$FP_NODE_ENV"', function (err, res) {
  if (err) throw(err)
  console.log(res);
  console.log('Database migrated successfully.');
});
