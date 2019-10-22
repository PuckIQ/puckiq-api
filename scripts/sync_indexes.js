'use strict';

const _ = require('lodash');
const fs = require('fs');
const path = require('path');

const config = require('../config/config').getFor('gmoney');

let mongoose = require('mongoose');
mongoose.dbs = {};
_.each(_.keys(config.dbs), (db) => {
    mongoose.dbs[db] = mongoose.createConnection(config.dbs[db], {
        autoIndex: true,
        useNewUrlParser: true
    });
});

mongoose.set('debug', true);

let models_path = path.resolve(__dirname, '../models');
fs.readdirSync(models_path).forEach((file) => {
    require(models_path + '/' + file)(mongoose, config);
});