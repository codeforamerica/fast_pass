FastTrack
======

## Installation

Install application dependencies:

```
$ npm install
$ npm install -g db-migrate
```

If it's not set already, specify a node environment variable:

```
export NODE_ENV="development"
```

Create the database configuration file:

```
$ cp config/database.json.sample config/database.json
```

Create the database:

```
$ npm run-script create-db
```

Migrate the database.

```
$ npm run-script migrate-db
```
