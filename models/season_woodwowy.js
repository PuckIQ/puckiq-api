'use strict';

let _ = require('lodash');
let constants = require('../common/constants');

/**
 *
 * Example record:
 *
 * "_id" : ObjectId("5c808fcf722488210c6730e5"),
 * "dffpct" : 38.9,
 * "sfpct" : 32.5,
 * "gf60" : 4.45,
 * "evtoi" : NumberLong(2427),
 * "cfpct" : 36.2,
 * "fa" : 31,
 * "sa" : 27,
 * "dff60" : 29.07,
 * "dfa60" : 45.69,
 * "sacf60" : 34.41,
 * "gametype" : 2,
 * "sa60" : 40.05,
 * "player1key" : "8478402EDM20182019",
 * "sf60" : 19.28,
 * "ca60" : 65.27,
 * "ga60" : 4.45,
 * "sacfpct" : 33.1,
 * "saca" : 46.9,
 * "cf" : 25,
 * "wowytype" : "WoodWOWY",
 * "gfpct" : 50,
 * "sf" : 13,
 * "team" : "EDM",
 * "player1id" : 8478402,
 * "dfa" : 30.8,
 * "gf" : 3,
 * "dff" : 19.6,
 * "dz" : 15,
 * "ga" : 3,
 * "onoff" : "Off Ice",
 * "saca60" : 69.57,
 * "player2key" : "8477934EDM20182019",
 * "ca" : 44,
 * "woodmoneytier" : "Gritensity",
 * "recordtype" : "1 not 2",
 * "oz" : 10,
 * "ff" : 19,
 * "season" : 20182019,
 * "nz" : 13,
 * "cf60" : 37.08,
 * "sacf" : 23.2,
 * "ff60" : 28.18,
 * "player2id" : 8477934,
 * "fa60" : 45.98,
 * "ffpct" : 38
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
        "gametype": {
            type: Number,
            required: true,
            enum: _.values(constants.schedule_game_type)
        },
        player1id: {
            type: Number,
            required: true
        },
        player1key: {
            type: String,
            required: true
        },
        player2id: {
            type: Number,
            required: true
        },
        player2key: {
            type: String,
            required: true
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
        "wowytype": { type: String, enum: _.values(constants.wowy_type) },
        "sacf60": { type: Number },
        "ffpct": { type: Number },
        "cf60": { type: Number },
        "woodmoneytier": { type: String, enum: _.values(constants.woodmoney_tier) },
        "ff60": { type: Number },
        "dff60": { type: Number },
        "dffpct": { type: Number },
        "oz": { type: Number },
        "team": { type: String },
        "dfa60": { type: Number },
        "sa": { type: Number },
        "sf": { type: Number },
        "gfpct": { type: Number }
    });

    schema.index({ season: 1, player1id: 1, player2id: 1 });

    return mongoose.model('SeasonWoodwowy', schema, constants.dbCollections.seasonwoodwowy, {
        connection: mongoose.dbs['puckiq']
    });
};