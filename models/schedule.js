"use strict";

const _ = require('lodash');
const constants = require('../common/constants');

// "data" : {
//     "season" : 20102011,
//     "home" : {
//         "teamabbr" : "MIN",
//         "teamid" : 30,
//         "teamname" : "Minnesota Wild"
//     },
//     "gamekey" : 2010020045,
//     "venue" : {
//         "name" : "Xcel Energy Center",
//         "city" : "St. Paul",
//         "timezone" : "America/Chicago"
//     },
//     "gametype" : 2,
//     "date" : "2010-10-14",
//     "away" : {
//         "teamabbr" : "EDM",
//         "teamid" : 22,
//         "teamname" : "Edmonton Oilers"
//     },
//     "game" : 45,
//     "status" : "Final"
// }

module.exports = function(mongoose, config) {

    let Schema = mongoose.Schema;

    let schema = new Schema({
        data: {
            season: {
                type: Number
            },
            "home": {
                "teamabbr": {type: String}, //EDM
                "teamid": {type: Number},
                "teamname": {type: String} // Edmonton Oilers
            },
            "gamekey": {type: Number},
            "venue": {
                "name": {type: String},
                "city": {type: String},
                "timezone": {type: String}
            },
            "gametype": {type: Number, enum: _.values(constants.game_type)}, // 2 = regular season I think
            "date": {type: String}, //"2010-10-14",
            "away": {
                "teamabbr": {type: String},
                "teamid": {type: Number},
                "teamname": {type: String}
            },
            "game": {type: Number},
            "status": {type: String} //"Final"
        }
    });

    schema.index( { "data.date": 1 });
    schema.index( { "data.date": 1, "data.gametype" : 1 });

    return mongoose.model('Schedule', schema, constants.dbCollections.schedule, {
        connection: mongoose.dbs['puckiq']
    });
};