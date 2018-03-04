const config = require('config');
const bluebird = require('bluebird');
const pgp = require('pg-promise');
const monitor = require('pg-monitor');
const logging = require('../logging');

const options = {promiseLib: bluebird};
monitor.attach(options);
monitor.setLog((msg, info) => {
  //disable default console output
  info.display = false;
  //log in the configured logger
  logging.get('sql').debug(msg, info);
});
module.exports = pgp(options)(config.db);
