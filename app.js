var express = require('express'),
  app = express();

var request = require('request'),
  http = require('http'),
  routes = require('./routes'),
  config = require('./conf.js'),
  server = http.createServer(app);

routes(app, request);

server.listen(config.httpPort, function () {
  server.close(function () {
    server.listen(config.httpPort);
  });
});