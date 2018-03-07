"use strict";

var express = require('express');
var db = require('../../db');

module.exports = express.Router()
  .use('/products', require('./products'))
  .use((err, req, res, next) => {
    //send 404 if requested object where not found
    if(err instanceof db.$config.pgp.errors.QueryResultError && err.code === db.$config.pgp.errors.queryResultErrorCode.noData){
      err.status = 404;
    }
    next(err);
  });