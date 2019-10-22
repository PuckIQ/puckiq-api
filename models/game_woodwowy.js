'use strict';

let _ = require('lodash');
let constants = require('../common/constants');

/**
 *
 * Example record:
 *
 {
	"_id" : ObjectId("59d47242a4ae7d23346d33f7"),
	"gf60" : 0,
	"sfpct" : 0,
	"saca60" : 29.55,
	"gf" : 0,
	"ca60" : 26.87,
	"dfa" : 0.2,
	"dfa60" : 5.37,
	"gfpct" : NaN,
	"saca" : 1.1,
	"oz" : 2,
	"sacf" : 0.9,
	"dz" : 0,
	"ffpct" : 50,
	"player2id" : 8477220,
	"sa60" : 26.87,
	"ozpct" : 100,
	"gamekey" : 2014021000,
	"fa" : 1,
	"woodmoneytier" : "Elite",
	"ff60" : 26.87,
	"ff" : 1,
	"player1id" : 8471426,
	"oz60" : 53.73,
	"nz" : 0,
	"cfpct" : 50,
	"sacfpct" : 45,
	"sf" : 0,
	"player1key" : "8471426WSH20142015",
	"dff60" : 8.06,
	"team" : "WSH",
	"nz60" : 0,
	"player2key" : "8477220WSH20142015",
	"dff" : 0.3,
	"dz60" : 0,
	"game" : 1000,
	"recordtype" : "1 not 2",
	"cf" : 1,
	"ca" : 1,
	"gametype" : 2,
	"sacf60" : 24.18,
	"onoff" : "On Ice",
	"evtoi" : NumberLong(134),
	"sa" : 1,
	"ga60" : 0,
	"ga" : 0,
	"dffpct" : 60,
	"cf60" : 26.87,
	"sf60" : 0,
	"wowytype" : "WoodWOWY",
	"season" : 20142015,
	"fa60" : 26.87
}
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
        gametype: {
            type: Number,
            required: true,
            enum: _.values(constants.schedule_game_type)
        },
        gamekey: {
            type: Number,
            required: true
        },
        game: {
            type: Number,
        },
        player1id: {
            type: Number,
            required: true
        },
        player2id: {
            type: Number,
            required: true
        },

        // possible filters
        "recordtype": {type: String, enum: _.values(constants.wowy_record_type)},
        "woodmoneytier": {type: String, enum: _.values(constants.woodmoney_tier)},
        "wowytype": {type: String, enum: _.values(constants.wowy_type)},
        "onoff": {type: String, enum: _.values(constants.on_off)},
        "team": {type: String},

        //data
        "sacf": {type: Number},
        "saca": {type: Number},
        "sfpct": {type: Number},
        "ca": {type: Number},
        "cf": {type: Number},
        "gf": {type: Number},
        "saca60": {type: Number},
        "ga": {type: Number},
        "sacfpct": {type: Number},
        "gf60": {type: Number},
        "evtoi": {type: Number},
        "ga60": {type: Number},
        "cfpct": {type: Number},
        "sa60": {type: Number},
        "nz": {type: Number},
        "dff": {type: Number},
        "dfa": {type: Number},
        "ca60": {type: Number},
        "fa": {type: Number},
        "dz": {type: Number},
        "sf60": {type: Number},
        "ff": {type: Number},
        "fa60": {type: Number},
        "sacf60": {type: Number},
        "ffpct": {type: Number},
        "cf60": {type: Number},
        "ff60": {type: Number},
        "dff60": {type: Number},
        "dffpct": {type: Number},
        "oz": {type: Number},
        "dfa60": {type: Number},
        "sa": {type: Number},
        "sf": {type: Number},
        "gfpct": {type: Number}
    });

    schema.index({season: 1});
    schema.index({gametype: 1, wowytype: 1, player1id: 1, player2id: 1, gamekey: 1 });

    return mongoose.model('GameWoodwowy', schema, constants.dbCollections.gamewoodwowy, {
        connection: mongoose.dbs['puckiq']
    });
};