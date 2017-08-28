var config = require('../config.js');
var MongoClient = require('mongodb').MongoClient;
var preGen = require('./queries/qgeneric');
var preWoodMoney = require('./queries/qwoodmoney');

var dbUri = 'mongodb://' + config.dbUser + ':' + config.dbPass + '@' + config.dbUri + ':' + config.dbPort + '/' + config.dbName;

function WoodMoneyHandler(request) {
  "use strict";

  this.getWoodMoney = function (req, res) {
    var qmethod = req.params.qmethod;
    var options = req.params;
    woodMoneyOptionQuery(qmethod, options, (data) => {
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
        var Collection = db.collection('woodmoneylive');
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
        var Collection = db.collection('woodmoneylive');
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

  var woodMoneyStaticQuery = function (qmethod, callback) {
    try {
      var pq = new preWoodMoney();
      MongoClient.connect(dbUri, (err, db) => {
        var Collection = db.collection('woodmoneylive');
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

  var woodMoneyOptionQuery = function (qmethod, options, callback) {
    var pq = new preWoodMoney();
    MongoClient.connect(dbUri, (err, db) => {
      var Collection = db.collection('woodmoneylive');
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

module.exports = WoodMoneyHandler;