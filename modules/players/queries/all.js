"use strict";

const _ = require("lodash");
const constants = require('../../../common/constants');
const MongoHelpers = require('../../../common/mongo_helpers');

module.exports = (mongoose, config) => {

    return (options) => {

        let SeasonRoster = mongoose.model('SeasonRoster');

        return new Promise((resolve, reject) => {

            SeasonRoster.aggregate([
                //{$match : { "playerid": {$in : [8477934, 8478402]}}},
                {
                    $sort: {season: 1}
                },
                {
                    $group: {
                        _id: {
                            "playerid": "$playerid"
                        },
                        birthcountries: {$addToSet: "$birthcountry"},
                        teams: {$push: "$teams"}, //push maintains order
                        hands: {$addToSet: "$hand"},
                        weights: {$addToSet: "$weight"},
                        heights: {$addToSet: "$height"},
                        seasons: {$addToSet: "$season"},
                        names: {$addToSet: "$name"},
                        positions: {$addToSet: "$pos"}
                    }
                },
                {
                    $project: {
                        //"_id": {$concat: [{$toString: "$_id.playerid"}]},
                        "playerid": "$_id.playerid",
                        "seasons": "$seasons",
                        "positions": "$positions",
                        "birthcountry": {$arrayElemAt: ["$_id.birthcountry", -1]},
                        "hand": {$arrayElemAt: ["$hands", -1]},
                        "team": {$arrayElemAt: ["$teams", -1]},
                        "weight": {$arrayElemAt: ["$weights", -1]},
                        "height": {$arrayElemAt: ["$heights", -1]},
                        "name": {$arrayElemAt: ["$names", -1]}
                    }
                },
            ]).allowDiskUse(true).exec((err, players) => {
                if (err) reject(err);
                _.each(players, p => {
                    p._id = p.playerid.toString();
                });
                resolve(players);
            });
        })

    };
};