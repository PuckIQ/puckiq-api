'use strict';

const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const http = require('http');
const express = require('express');

module.exports = function(cluster, config, port) {

    let mongoose = require('mongoose');

    mongoose.dbs = {};
    _.each(_.keys(config.dbs), (db) => {
        mongoose.dbs[db] = mongoose.createConnection(config.dbs[db], {
            autoIndex: false,
            useNewUrlParser: true,

        });
    });

    if(config.env === "local") {
        mongoose.set('debug', true);
    }

    let models_path = path.resolve(__dirname, '../../models');
    fs.readdirSync(models_path).forEach((file) => {
        require(models_path + '/' + file)(mongoose, config);
    });

    require('../service_locator').init(config, mongoose, (err, locator) => {

        if(err) {
            console.log("Error initializing service locator. Details: " + err);
            return process.exit(1);
        }

        let app = express();
        app.server = http.createServer(app);

        //express settings
        require('../express')(app, locator, cluster);

        app.server.listen(port, function() {
            console.log('Express app started on port ' + port);
        });

        //initialize framework components
        require('../../common/logger').init(locator);
        let error_handler = require('../../common/error_handler');
        error_handler.init(locator);
        require('../../common/bus').init(locator);

        process.on('uncaughtException', (err) => {
            try {
                console.log("UNHANDLED ERROR", err);
                error_handler.log(null, err);
            } catch (e) {
                console.log("ERROR handling exception", err);
            } finally {
                if (cluster.worker) cluster.worker.disconnect();
                else process.exit(1);
            }
        });

    });

};