var config = require('./config.js')["local"]; //TODO

// const getExpeditiousCache = require('express-expeditious');
// const redisOptions = {
//   host: config.redisHost,
//   port: config.redisPort
// };

// const cache = getExpeditiousCache({
//   namespace: 'puckiqcache',
//   defaultTtl: '1 minute',
//   engine: require('expeditious-engine-redis')({redis: redisOptions}),
// });
const cache = {
  withTtl : function(time){
    return function(req, res, next){
      return next();
    };
  }
};

var express = require('express'),
  app = express();

var request = require('request'),
  http = require('http'),
  routes = require('./routes'),
  server = http.createServer(app);

console.log("bootstrapping routes");
routes(app, cache, request);

console.log("listening on port", config.httpPort);
server.listen(config.httpPort, function () {
  server.close(function () {
    server.listen(config.httpPort);
  });
});