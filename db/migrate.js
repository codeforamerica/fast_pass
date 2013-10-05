#!/usr/bin/env node

var exec = require('child_process').exec;

console.log('Migrating...\n');

exec(process.cwd() + '/node_modules/db-migrate/bin/db-migrate up --config config/database.json --migrations-dir db/migrations -e "$NODE_ENV"', function (err, res) {
  if (err) throw(err)
  console.log(res);
  console.log('Database migrated successfully.');
});
