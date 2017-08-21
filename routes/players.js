var config = require('../config.js');
var MongoClient = require('mongodb').MongoClient;

var dbUri = 'mongodb://' + config.dbUser + ':' + config.dbPass + '@' + config.dbUri + ':' + config.dbPort + '/' + config.dbName;

function PlayersHandler(request) {

}

module.exports = PlayersHandler;