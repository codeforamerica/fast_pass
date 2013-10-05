FastTrack
======

## Installation

Install application dependencies:

```
$ npm install
```

## Database

Set your database credentials in environment variables:

```
$ export FP_NODE_ENV=development
$ export FP_DB_DEVELOPMENT_NAME= your database
$ export FP_DB_DEVELOPMENT_USER= your database username
$ export FP_DB_DEVELOPMENT_PASSWORD= your database password
```

Now that you've got the credentials in place, you can create and migrate the database:

```
$ npm run-script db-setup
```

*Note*: if you plan on working consistently on the application, it might make sense to add the database credentials to your shell configuration.
