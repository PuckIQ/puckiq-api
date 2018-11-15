'use strict';

const cluster = require('cluster');
const env = process.env.NODE_ENV || 'local'; //TODO
const config = require('./config/config.js')[env];
const port = process.env.PORT || config.httpPort;

if (env === 'local') {
    require('./config/processes/worker')(cluster, config, port, __dirname);
} else {
    if (cluster.isMaster) {
        console.log('master is running on env', env, 'port', port);
        require('./config/processes/master')(cluster, config);
    } else {
        console.log('worker is running on env', env, 'port', port);
        require('./config/processes/worker')(cluster, config, port, __dirname);
    }
}



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