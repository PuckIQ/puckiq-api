var config = require('../config.js');
var MongoClient = require('mongodb').MongoClient;
var preQuery = require('./queries');

var dbUri = 'mongodb://' + config.dbUser + ':' + config.dbPass + '@' + config.dbUri + ':' + config.dbPort + '/' + config.dbName;

function PuckIQHandler(request) {
  this.getOptionPuckIQ = function (req, res) {
    var qtype = req.params.qtype;
    var qmethod = req.params.qmethod;
    var options = req.params;
    puckIQOptionQuery(qtype, qmethod, options, (data) => {
      res.contentType('application/json');
      res.send(JSON.stringify(data));
    });
  }

  this.getStaticPuckIQ = function (req, res) {
    var qtype = req.params.qtype;
    var qmethod = req.params.qmethod;
    puckIQStaticQuery(qtype, qmethod, (data) => {
      res.contentType('application/json');
      res.send(JSON.stringify(data));
    });
  }

  // Query Functions
  var puckIQStaticQuery = function (qtype, qmethod, callback) {
    try {
      var pq = new preQuery();
      MongoClient.connect(dbUri, (err, db) => {
        try {
          var colname = collectionName(qtype);
          var Collection = db.collection(colname);
          var results = pq[qmethod](qtype, Collection);

          results.toArray((err, docs) => {
            if (!err)
              callback(docs);
            else
              console.log(err);
              callback(err)
            db.close();
          });
        } catch (exception) {
          console.log(exception);
          callback(exception);
        }
      });
    } catch (exception) {
      console.log(exception);
      callback(exception);
    }
  }

  var puckIQOptionQuery = function (qtype, qmethod, options, callback) {
    try {
      var pq = new preQuery();
      MongoClient.connect(dbUri, (err, db) => {
        try {
          var colname = collectionName(qtype);
          var Collection = db.collection(colname);
          var results = pq[qmethod](options, qtype, Collection);

          results.toArray((err, docs) => {
            if (!err)
              callback(docs);
            else
              console.log(err);
              callback(err)
            db.close();
          });
        } catch (exception) {
          console.log(exception);
          callback(exception);
        }
      });
    } catch (exception) {
      console.log(exception);
      callback(exception);
    }
  }

  var collectionName = function (colname) {
    if (typeof config.dbCollections[colname] === 'undefined')
      throw Error(colname + ': Query Type Does Not Exist');
    return config.dbCollections[colname];
  };
}

module.exports = PuckIQHandler;