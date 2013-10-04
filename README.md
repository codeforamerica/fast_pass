FastTrack
======

## Installation

Install dependencies:

```
$ npm install
```

Create the local development databases:

```
$ psql
=# CREATE DATABASE fast_track_development;
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
$ db-migrate up --config config/database.json --migrations-dir db/migrations -e development
```

If you don't already have it set, it may make sense to set a node environment variable locally.

```
export NODE_ENV="development"
```
