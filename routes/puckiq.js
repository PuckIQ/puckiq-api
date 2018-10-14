"use strict";

const MongoClient = require('mongodb').MongoClient;
const preQuery = require('./queries');

function PuckIQHandler(config) {

    const dbUri = `mongodb://${config.dbs.puckiq.user}:${config.dbs.puckiq.password}@${config.dbs.puckiq.host}:${config.dbs.puckiq.port}/${config.dbs.puckiq.database}`;
    console.log("dbUri", dbUri);

    this.getOptionPuckIQ = function(req, res) {
        let qtype = req.params.qtype;
        let qmethod = req.params.qmethod;
        let options = req.query;
        puckIQOptionQuery(qtype, qmethod, options, (data) => {
            res.contentType('application/json');
            if(data.length > 0) {
                res.send(JSON.stringify(data));
            } else {
                res.status(404).send('Not Found');
            }
        });
    };

    this.getStaticPuckIQ = function(req, res) {
        let qtype = req.params.qtype;
        let qmethod = req.params.qmethod;
        puckIQStaticQuery(qtype, qmethod, (data) => {
            res.contentType('application/json');
            if(data.length > 0) {
                res.send(JSON.stringify(data));
            } else {
                res.status(404).send('Not Found');
            }
        });
    };

    let _getPuckIQData = function(qtype, qmethod, options, done) {
        console.log(`---${qtype}/${qmethod}?${JSON.stringify(options || {})}`);
        if(Object.keys(options).length === 0) {
            puckIQStaticQuery(qtype, qmethod, (data) => {
                return done(null, data);// todo error?
            });
        } else {
            puckIQOptionQuery(qtype, qmethod, options, (data) => {
                return done(null, data);// todo error?
            });
        }
    };

    this._getPuckIQData = _getPuckIQData;

    this.getPuckIQData = function(req, res) {
        _getPuckIQData(req.params.qtype, req.params.qmethod, req.query, (err, results) => {
            if(err) {
                //todo better
                res.status(500).send("Query error");
            } else {
                res.jsonp(results);
            }
        });
    };

    // Query Functions
    let puckIQStaticQuery = function(qtype, qmethod, callback) {
        try {
            let pq = new preQuery();
            MongoClient.connect(dbUri, (err, db) => {
                try {
                    let colname = collectionName(qtype);
                    let Collection = db.collection(colname);
                    let results = pq[qmethod](qtype, Collection);

                    results.toArray((err, docs) => {
                        if(!err) {
                            callback(docs);
                        } else {
                            console.log(err);
                            callback(err);
                        }
                        db.close();
                    });
                } catch(exception) {
                    console.log(exception);
                    callback(exception);
                }
            });
        } catch(exception) {
            console.log(exception);
            callback(exception);
        }
    };

    let puckIQOptionQuery = function(qtype, qmethod, options, callback) {
        try {
            let pq = new preQuery();
            MongoClient.connect(dbUri, (err, db) => {
                try {
                    let colname = collectionName(qtype);
                    let Collection = db.collection(colname);
                    let results = pq[qmethod](options, qtype, Collection);

                    results.toArray((err, docs) => {
                        if(!err) {
                            callback(docs);
                        } else {
                            console.log(err);
                            callback(err);
                        }
                        db.close();
                    });
                } catch(exception) {
                    console.log(exception);
                    callback(exception);
                }
            });
        } catch(exception) {
            console.log(exception);
            callback(exception);
        }
    };

    let collectionName = function(colname) {
        if(typeof config.dbCollections[colname] === 'undefined')
            throw Error(colname + ': Query Type Does Not Exist');
        return config.dbCollections[colname];
    };
}

module.exports = PuckIQHandler;