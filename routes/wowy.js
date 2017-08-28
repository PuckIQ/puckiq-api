var config = require('../config.js');
var MongoClient = require('mongodb').MongoClient;
var preGen = require('./queries/qgeneric');
var preWowy = require('./queries/qwowy');

var dbUri = 'mongodb://' + config.dbUser + ':' + config.dbPass + '@' + config.dbUri + ':' + config.dbPort + '/' + config.dbName;

function WowyHandler(request) {
  "use strict";

  this.getWowy = function (req, res) {
    var qmethod = req.params.qmethod;
    var options = req.params;
    wowyOptionQuery(qmethod, options, (data) => {
      res.contentType('application/json');
      res.send(JSON.stringify(data));
    });
  }

  this.getSeasons = function (req, res) {
    var qmethod = req.params.qmethod;
    genericStaticQuery(qmethod, (data) => {
      res.contentType('application/json');
      res.send(JSON.stringify(data));
    });
  }

  // Query Functions
  var genericStaticQuery = function (qmethod, callback) {
    try {
      var pq = new preGen();
      MongoClient.connect(dbUri, (err, db) => {
        var Collection = db.collection('seasonwowy');
        var results = pq[qmethod](Collection);

        results.toArray((err, docs) => {
          if (!err)
            callback(docs);
          else
            callback(err)
          db.close();
        });
      });
    } catch (exception) {
      callback(exception);
    }
  }

  var genericOptionQuery = function (qmethod, options, callback) {
    try {
      var pq = new preGen();
      MongoClient.connect(dbUri, (err, db) => {
        var Collection = db.collection('seasonwowy');
        var results = pq[qmethod](options, Collection);

        results.toArray((err, docs) => {
          if (!err)
            callback(docs);
          else
            callback(err)
          db.close();
        });
      });
    } catch (exception) {
      callback(exception);
    }
  }

  var wowyStaticQuery = function (qmethod, callback) {
    try {
      var pq = new preWowy();
      MongoClient.connect(dbUri, (err, db) => {
        var Collection = db.collection('seasonwowy');
        var results = pq[qmethod](Collection);

        results.toArray((err, docs) => {
          if (!err)
            callback(docs);
          else
            callback(err)
          db.close();
        });
      });
    } catch (exception) {
      callback(exception);
    }
  }

  var wowyOptionQuery = function (qmethod, options, callback) {
    var pq = new preWowy();
    MongoClient.connect(dbUri, (err, db) => {
      var Collection = db.collection('seasonwowy');
      var results = pq[qmethod](options, Collection);

      results.toArray((err, docs) => {
        if (!err)
          callback(docs);
        else
          callback(err)
        db.close();
      });
    });
  }
}

module.exports = WowyHandler;