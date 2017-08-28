var config = require('../config.js');
var MongoClient = require('mongodb').MongoClient;

var dbUri = 'mongodb://' + config.dbUser + ':' + config.dbPass + '@' + config.dbUri + ':' + config.dbPort + '/' + config.dbName;

function GamesHandler(request) {
  "use strict";

  this.getGameDate = function(req, res) {
    var options = req.params;
    allGameDates(options, (data) => {
      res.contentType('application/json');
      res.send(JSON.stringify(data));
    });
  };

  this.getGameRoster = function (req, res) {
    var options = req.params;
    allGameRoster(options, (data) => {
      res.contentType('application/json');
      res.send(JSON.stringify(data));
    });
  };

  var allGameDates = function (options, callback) {
    try {
      MongoClient.connect(dbUri, (err, db) => {
        var Collection = db.collection('nhlschedule');
        var results = Collection.find(options);

        results.toArray((err, docs) => {
          if (!err)
            callback(docs);
          else
            callback(err);
          db.close();
        });
      });
    } catch (err) {
      callback(err);
    }
  }

  var allGameRoster = function (options, callback) {
    try {
      MongoClient.connect(dbUri, (err, db) => {
        var Collection = db.collection('nhlgameroster');
        var query = mongoQueryBuilder(options);
        var results = Collection.aggregate([
          { $match: query },
          { $unwind: "$roster" },
          { $match: { "roster.jerseynum": { $exists: true }, "roster.team": { $exists: true } } }
        ]);
        results.toArray((err, docs) => {
          if (!err)
            callback(docs);
          else
            callback(err);
          db.close();
        });
      });
    } catch (err) {
      callback(err);
    }
  }

  function mongoQueryBuilder(options) {
    var queryBuilder = new Object();
    Object.keys(options).forEach(function (key) {
      if (isNumeric(options[key]))
        queryBuilder[key] = parseInt(options[key]);
      else
        queryBuilder[key] = options[key];
    });

    return queryBuilder;
  }

  function mongoFieldBuilder(fields) {
    if (typeof fields === 'undefined')
      return {};
    else {
      var fieldBuilder = new Object();
      var fieldList = fields.split(',');
      fieldList.forEach((val) => {
        if (val === '-_id')
          fieldBuilder[val.substr(1)] = 0;
        else
          fieldBuilder[val] = 1;
      });
      return fieldBuilder;
    }
  }

  /* Helper Functions */
  function isNumeric(n) {
    return !isNaN(n) && isFinite(n);
  }

  function isFloat(n) {
    return n % 1 === 0;
  }
}

module.exports = GamesHandler;