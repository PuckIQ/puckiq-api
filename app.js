const config = require('./config.js')["local"]; //TODO

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
      console.log(`${req.path}${JSON.stringify(req.query)}`);
      return next();
    };
  }
};

let express = require('express');
let app = express();

const request = require('request');
const http = require('http');
const routes = require('./routes');
const server = http.createServer(app);

console.log("bootstrapping routes");
routes(app, cache, request, config);

console.log("listening on port", config.httpPort);
server.listen(config.httpPort, function () {
  server.close(function () {
    server.listen(config.httpPort);
  });
});