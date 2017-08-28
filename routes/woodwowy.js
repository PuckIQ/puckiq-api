var config = require('../config.js');
var MongoClient = require('mongodb').MongoClient;
var preGen = require('./queries/qgeneric');
var preWoodWowy = require('./queries/qwoodwowy');

var dbUri = 'mongodb://' + config.dbUser + ':' + config.dbPass + '@' + config.dbUri + ':' + config.dbPort + '/' + config.dbName;

function WoodWowyHandler(request) {
  "use strict";

  this.getWoodWowy = function(req, res) {
    var qmethod = req.params.qmethod;
    var options = req.params;
    woodWowyOptionQuery(qmethod, options, (data) => {
      res.contentType('application/json');
      res.send(JSON.stringify(data));
    });
  }

  this.getSeasons = function(req, res) {
    var qmethod = req.params.qmethod;
    genericStaticQuery(qmethod, (data) => {
      res.contentType('application/json');
      res.send(JSON.stringify(data));
    });
  }

  // Query Functions
  var genericStaticQuery = function (qmethod, callback) {
    var pq = new preGen();
    MongoClient.connect(dbUri, (err, db) => {
      var Collection = db.collection('seasonwoodwowy');
      var results = pq[qmethod](Collection);

      results.toArray((err, docs) => {
        if (!err)
          callback(docs);
        else
          callback(err)
        db.close();
      });
    });
  }

  var genericOptionQuery = function (qmethod, options, callback) {
    var pq = new preGen();
    MongoClient.connect(dbUri, (err, db) => {
      var Collection = db.collection('seasonwoodwowy');
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

  var woodWowyStaticQuery = function (qmethod, callback) {
    var pq = new preWoodWowy();
    MongoClient.connect(dbUri, (err, db) => {
      var Collection = db.collection('seasonwoodwowy');
      var results = pq[qmethod](Collection);

      results.toArray((err, docs) => {
        if (!err)
          callback(docs);
        else
          callback(err)
        db.close();
      });
    });
  }

  var woodWowyOptionQuery = function (qmethod, options, callback) {
    var pq = new preWoodWowy();
    MongoClient.connect(dbUri, (err, db) => {
      var Collection = db.collection('seasonwoodwowy');
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

module.exports = WoodWowyHandler;