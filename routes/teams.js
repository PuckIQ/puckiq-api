var config = require('../config.js');
var MongoClient = require('mongodb').MongoClient;

var dbUri = 'mongodb://' + config.dbUser + ':' + config.dbPass + '@' + config.dbUri + ':' + config.dbPort + '/' + config.dbName;

function TeamsHandler(request) {
  "use strict";

  this.getAllTeams = function (req, res) {
    var options = req.params;
    var fields = mongoFieldBuilder(req.query.r);
    allTeams(options, fields, (data) => {
      res.contentType('application/json');
      res.send(JSON.stringify(data));
    });
  };

  var allTeams = function (options, fields, callback) {
    MongoClient.connect(dbUri, (err, db) => {
      var Collection = db.collection('nhlteams');
      var query = mongoQueryBuilder(options);
      var results = Collection.find(query, fields).sort({ conference: 1, division: 1 });
      results.toArray((err, docs) => {
        if (!err)
          callback(docs);
        else
          callback(err);
        db.close();
      });
    });
  };

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
};

module.exports = TeamsHandler;