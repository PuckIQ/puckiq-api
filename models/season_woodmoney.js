'use strict';

let _ = require('lodash');
let constants = require('../common/constants');

/**
 *
 * Example record:
 *
 * "_id" : ObjectId("59d58714a4ae7d39488dabd6"),
 * "sacf" : 29.8,
 * "saca" : 35.2,
 * "sfpct" : 35.3,
 * "ca" : 34,
 * "cf" : 31,
 * "gametype" : 2,
 * "gf" : 0,
 * "saca60" : 73.16,
 * "ga" : 3,
 * "sacfpct" : 45.8,
 * "gf60" : 0,
 * "evtoi" : NumberLong(1732),
 * "playerid" : 8473523,
 * "ga60" : 6.24,
 * "cfpct" : 47.7,
 * "sa60" : 45.73,
 * "nz" : 13,
 * "dff" : 20.6,
 * "dfa" : 33.5,
 * "playerkey" : "8473523TOR20162017",
 * "ca60" : 70.67,
 * "onoff" : "On Ice",
 * "season" : 20162017,
 * "fa" : 27,
 * "dz" : 10,
 * "sf60" : 24.94,
 * "ff" : 23,
 * "fa60" : 56.12,
 * "wowytype" : "WoodMoney",
 * "sacf60" : 61.94,
 * "ffpct" : 46,
 * "cf60" : 64.43,
 * "woodmoneytier" : "Elite",
 * "ff60" : 47.81,
 * "dff60" : 42.82,
 * "dffpct" : 38.1,
 * "oz" : 7,
 * "team" : "TOR",
 * "dfa60" : 69.63,
 * "sa" : 22,
 * "sf" : 12,
 * "gfpct" : 0
 *
 * @param mongoose
 * @param config
 * @returns {*}
 */
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
        playerkey: {
            type: String,
            required: true
        },
        "team": { type: String },

        "wowytype": { type: String, enum: _.values(constants.wowy_type) },
        "woodmoneytier": { type: String, enum: _.values(constants.woodmoney_tier) },
        "gametype": {
            type: Number,
            required: true,
            enum: _.values(constants.schedule_game_type)
        },
        "sacf": { type: Number },
        "saca": { type: Number },
        "sfpct": { type: Number },
        "ca": { type: Number },
        "cf": { type: Number },
        "gf": { type: Number },
        "saca60": { type: Number },
        "ga": { type: Number },
        "sacfpct": { type: Number },
        "gf60": { type: Number },
        "evtoi": { type: Number },
        "ga60": { type: Number },
        "cfpct": { type: Number },
        "sa60": { type: Number },
        "nz": { type: Number },
        "dff": { type: Number },
        "dfa": { type: Number },
        "ca60": { type: Number },
        "onoff": { type: String, enum: _.values(constants.on_off) },
        "fa": { type: Number },
        "dz": { type: Number },
        "sf60": { type: Number },
        "ff": { type: Number },
        "fa60": { type: Number },
        "sacf60": { type: Number },
        "ffpct": { type: Number },
        "cf60": { type: Number },
        "ff60": { type: Number },
        "dff60": { type: Number },
        "dffpct": { type: Number },
        "oz": { type: Number },
        "dfa60": { type: Number },
        "sa": { type: Number },
        "sf": { type: Number },
        "gfpct": { type: Number }
    });

    schema.index({ season: 1 });
    schema.index({ season: 1, gametype: 1, playerid: 1 });

    return mongoose.model('SeasonWoodmoney', schema, constants.dbCollections.seasonwoodmoney, {
        connection: mongoose.dbs['puckiq']
    });
};