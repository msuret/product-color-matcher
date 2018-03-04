const config = require('config');
const bluebird = require('bluebird');
const pgp = require('pg-promise')({promiseLib: bluebird});

module.exports = pgp(config.db);
