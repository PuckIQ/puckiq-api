'use strict';

let _ = require('lodash');
let constants = require('../common/constants');

module.exports = function(mongoose, config) {

    let Schema = mongoose.Schema;

    // {"playerid" : 8478402, "weight" : 190, "game" : 816, "height" : "6' 1\"", "gametype" : 2,"hand" : "L", "pos" : "C", "team" : "EDM", "birthcountry" : "CAN", "season" : 20152016, "name" : "Connor McDavid" }

    let schema = new Schema({
        playerid: {
            type: Number
        },
        name: {
            type: String
        },
        weight: {
            type: Number
        },
        game: {
            type: Number
        },
        height: {
            type: Date
        },
        gametype: {
            type: Number
        },
        hand: {
            type: String
        },
        pos: {
            type: String
        },
        team: {
            type: String
        },
        birthcountry: {
            type: String
        },
        season: {
            type: Number
        }
    });

    return mongoose.model('SeasonRoster', schema, constants.dbCollections.seasonroster, {
        connection: mongoose.dbs['puckiq']
    });
};