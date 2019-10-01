'use strict';

let _ = require('lodash');
let constants = require('../common/constants');

module.exports = function(mongoose, config) {

    let Schema = mongoose.Schema;

    /*
    "season" : 20182019,
    "recordtype" : "boxcar",
	"gametype" : 2,
	"playerkey" : "8478402EDM20182019",
	"team" : "EDM",
	"situation" : "5v5",
	"playerid" : 8478402,
	"iP" : 63,
	"iG" : 24,
	"iA1" : 27,
	"iA" : 39,
	"iA2" : 12,
    "timestamp" : ISODate("2019-04-13T05:59:53.546Z"),
     */

    let schema = new Schema({
        season: {
            type: Number
        },
        gametype: {
            type: Number,
            enum: _.values(constants.schedule_game_type)
        },
        recordtype: {
            type: String
        },
        situation: {
            type: String
        },
        playerid: {
            type: Number
        },
        playerkey: {
            type: String
        },
        team: {
            type: String
        },
        iP: {
            type: Number
        },
        iG: {
            type: Number
        },
        iA: {
            type: Number
        },
        iA1: {
            type: Number
        },
        iA2: {
            type: Number
        },
        timestamp: {
            type: Date
        },

    });

    schema.index({ season: 1, recordtype: 1, gametype: 1, situation: 1 });
    schema.index({ season: 1, recordtype: 1, gametype: 1, situation: 1, team: 1 });
    schema.index({ season: 1, recordtype: 1, gametype: 1, situation: 1, player: 1 });

    return mongoose.model('SeasonBoxcar', schema, constants.dbCollections.seasonboxcar, {
        connection: mongoose.dbs['puckiq']
    });
};