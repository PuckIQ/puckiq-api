var getExpeditiousCache = require('express-expeditious');
var cache = getExpeditiousCache({
  // Namespace used to prevent cache conflicts, must be alphanumeric 
  namespace: 'puckiqcache',
  // Store cache entries for 1 minute (can also pass milliseconds e.g 60000) 
  defaultTtl: '1 minute',
  engine: require('expeditious-engine-redis')({
    // options for the redis driver 
    host: 'localhost',
    port: 6379
  })
});

var express = require('express'),
  app = express();

var request = require('request'),
  http = require('http'),
  routes = require('./routes'),
  config = require('./config.js'),
  server = http.createServer(app);

routes(app, cache, request);

server.listen(config.httpPort, function () {
  server.close(function () {
    server.listen(config.httpPort);
  });
});