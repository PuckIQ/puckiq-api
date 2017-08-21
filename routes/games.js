var config = require('../config.js');
var MongoClient = require('mongodb').MongoClient;

var dbUri = 'mongodb://' + config.dbUser + ':' + config.dbPass + '@' + config.dbUri + ':' + config.dbPort + '/' + config.dbName;

function GamesHandler(request) {

}

module.exports = GamesHandler;