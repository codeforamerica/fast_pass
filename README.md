FastTrack
======

## Installation

Install application dependencies:

```
$ npm install
$ npm install -g db-migrate
```

## Database

Set each database credential in an environment variable:

```
$ export FP_NODE_ENV=development
$ export FP_DB_DEVELOPMENT_NAME= your database
$ export FP_DB_DEVELOPMENT_USER= your database username
$ export FP_DB_DEVELOPMENT_PASSWORD= your database password
```

Note: if you plan on working consistently on the application, it might make sense to add these credentials to your shell configuration.

Now that you've got the credentials in place, you can create and migrate the database:

```
$ npm run-script db-setup
```
