var config = require('./config.js');
const getExpeditiousCache = require('express-expeditious');
const redisOptions = {
  host: config.redisHost,
  port: config.redisPort
}
const cache = getExpeditiousCache({
  namespace: 'puckiqcache',
  defaultTtl: '1 minute',
  engine: require('expeditious-engine-redis')({redis: redisOptions}),
});

var express = require('express'),
  app = express();

var request = require('request'),
  http = require('http'),
  routes = require('./routes'),
  server = http.createServer(app);

routes(app, cache, request);

server.listen(config.httpPort, function () {
  server.close(function () {
    server.listen(config.httpPort);
  });
});