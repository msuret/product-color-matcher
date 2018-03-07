"use strict";

const config = require('config');
const winston = require("winston");
const loadLoggingConfig = require('bluebird').promisify(require('winston-config').fromJson);

loadLoggingConfig(config.get('logging'));
module.exports = winston.loggers;