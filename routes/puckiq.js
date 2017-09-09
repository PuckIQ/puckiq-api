var config = require('../config.js');
var MongoClient = require('mongodb').MongoClient;
var preQuery = require('./queries');

var dbUri = 'mongodb://' + config.dbUser + ':' + config.dbPass + '@' + config.dbUri + ':' + config.dbPort + '/' + config.dbName;

function PuckIQHandler(request) {
  this.getOptionPuckIQ = function (req, res) {
    var qtype = req.params.qtype;
    var qmethod = req.params.qmethod;
    var options = req.query;
    puckIQOptionQuery(qtype, qmethod, options, (data) => {
      res.contentType('application/json');
      if (data.length > 0) {
        res.send(JSON.stringify(data));
      } else {
        res.status(404).send('Not Found');
      }
    });
  }

  this.getStaticPuckIQ = function (req, res) {
    var qtype = req.params.qtype;
    var qmethod = req.params.qmethod;
    puckIQStaticQuery(qtype, qmethod, (data) => {
      res.contentType('application/json');
      if (data.length > 0) {
        res.send(JSON.stringify(data));
      } else {
        res.status(404).send('Not Found');
      }
    });
  }

  this.getPuckIQData = function (req, res) {
    var qtype = req.params.qtype;
    var qmethod = req.params.qmethod;
    if (Object.keys(req.query).length == 0) {
      puckIQStaticQuery(qtype, qmethod, (data) => {
        res.contentType('application/json');
        if (data.length > 0) {
          res.send(JSON.stringify(data));
        } else {
          res.status(404).send('Not Found');
        }
      });
    } else {
      var options = req.query;
      puckIQOptionQuery(qtype, qmethod, options, (data) => {
        res.contentType('application/json');
        if (data.length > 0) {
          res.send(JSON.stringify(data));
        } else {
          res.status(404).send('Not Found');
        }
      });
    }
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
            if (!err) {
              callback(docs);
            } else {
              console.log(err);
              callback(err);
            }
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
            if (!err) {
              callback(docs);
            } else {
              console.log(err);
              callback(err);
            }
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