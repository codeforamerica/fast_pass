#!/usr/bin/env node

var exec = require('child_process').exec;

console.log('Setting up database...\n')

exec(process.cwd() + '/db/create.js', function (err, res) {

  if (err) throw(err);
  console.log(res);

  exec(process.cwd() + '/db/migrate.js', function (err, res) {
    if (err) throw(err);
    console.log(res);
  });

});


console.log('Database set up successfully!')
