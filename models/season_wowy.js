'use strict';

let _ = require('lodash');
let constants = require('../common/constants');

module.exports = function(mongoose, config) {

    let Schema = mongoose.Schema;

    let schema = new Schema({
        season: {
            type: String,
            required: true
        }
    });

    schema.index({ season: 1 });

    return mongoose.model('SeasonWowy', schema, config.dbCollections.seasonwowy, {
        connection: mongoose.dbs['puckiq']
    });
};