var express = require('express');

module.exports = express.Router()
  .use('/products', require('./products'));