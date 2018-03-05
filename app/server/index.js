const express = require('express');
const cluster = require('cluster');
const config = require('config');
const numCPUs = require('os').cpus().length;
const morgan = require('morgan');
const _ = require('lodash');
const logging = require('../logging');

//fork only if there is more than one CPU core
if(cluster.isMaster && config.get('server.clustering') && numCPUs > 1){
  return _.times(numCPUs, cluster.fork.bind(cluster));
} else {
  return startServer();
}

function startServer(){
  return express()
    //request logging 
    .use(morgan("tiny", {stream: {write: _.flow(_.nthArg(0), logging.get('http').info)}}))
    .use('/v1', require('./api'))
    //error handler
    .use((err, req, res, next) => res.status(err.status || 500).json(err))
    .listen(config.get('server.port'));
}