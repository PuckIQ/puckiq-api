'use strict';

const _ = require('lodash');
const constants = require('../common/constants');

module.exports = function(mongoose, config) {

    let Schema = mongoose.Schema;

    let schema = new Schema({
        "season": {
            type: Number,
            required: true
        },
        "team": {
            type: String,
            required: true
        },
        "shifttype": {
            type: String,
            required: true
        },

        "shifts": { type: Number },
        "toi" : { type: Number },
        //"avgshift" : calculated,
        "ga" : { type: Number },
        "gf" : { type: Number },
        "ca" : { type: Number },
        "cf" : { type: Number }

    });

    schema.index({ season: 1 });
    schema.index({ season: 1, team: 1 });
    schema.index({ season: 1, shifttype: 1 });

    return mongoose.model('SeasonTeamShift', schema, constants.dbCollections.seasonteamshift, {
        connection: mongoose.dbs['puckiq']
    });
};