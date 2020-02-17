'use strict';

const _ = require('lodash');
const constants = require('../common/constants');

module.exports = function(mongoose, config) {

    let Schema = mongoose.Schema;

    let schema = new Schema({
        season: {
            type: Number,
            required: true
        },
        playerid: {
            type: Number,
            required: true
        },
        name: {
            type: String
        },
        "team": { type: String },

        "totalshifts": { type: Number },
        "avgshift": { type: Number },

        "ostart" : {
            "shifts" : { type: Number },
            "ga" : { type: Number },
            "gf" : { type: Number },
            "ca" : { type: Number },
            "avgshift" : { type: Number },
            "cf" : { type: Number }
        },
        "dstart" : {
            "shifts" : { type: Number },
            "ga" : { type: Number },
            "gf" : { type: Number },
            "ca" : { type: Number },
            "avgshift" : { type: Number },
            "cf" : { type: Number }
        },
        "nstart" : {
            "shifts" : { type: Number },
            "ga" : { type: Number },
            "gf" : { type: Number },
            "ca" : { type: Number },
            "avgshift" : { type: Number },
            "cf" : { type: Number }
        },
        "otf" : {
            "shifts" : { type: Number },
            "ga" : { type: Number },
            "gf" : { type: Number },
            "ca" : { type: Number },
            "avgshift" : { type: Number },
            "cf" : { type: Number }
        },
        "pureotf" : {
            "shifts" : { type: Number },
            "ga" : { type: Number },
            "gf" : { type: Number },
            "ca" : { type: Number },
            "avgshift" : { type: Number },
            "cf" : { type: Number }
        }

    });

    schema.index({ season: 1 });
    schema.index({ season: 1, playerid: 1 });
    schema.index({ season: 1, team: 1 });

    return mongoose.model('SeasonShift', schema, constants.dbCollections.seasonshift, {
        connection: mongoose.dbs['puckiq']
    });
};