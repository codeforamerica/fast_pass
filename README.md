FastTrack
======

## Installation

Install dependencies:

```
$ npm install
```

Create the test and development databases:

```
$ psql
=# CREATE DATABASE fasttrack_test;
=# CREATE DATABASE fasttrack_dev;
=# \q
```

Install ```db-migrate``` globally:


Create the database configuration file:

```
$ cp config/database.json.sample config/database.json
```

Install the 'db-migrate' package globally.

```
$ npm install -g db-migrate
```

Migrate the database(s).

```
$ db-migrate up --config config/database.json --migrations-dir db/migrations -e test
$ db-migrate up --config config/database.json --migrations-dir db/migrations -e dev
```
