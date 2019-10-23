"use strict";

const _ = require("lodash");
const constants = require('../../../common/constants');
const formatter = require('./woodwowy_formatter');
const woodmoney_tier_sort = constants.woodmoney_tier_sort;

function pad(val) {
    return val.toString().padStart(2, '0');
}

//must have from date and to date
function dateToString(dt) {
    return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
}

module.exports = (mongoose, config) => {

    return (options, player_dict) => {

        let GameWoodwowy = mongoose.model('GameWoodwowy');
        let Schedule = mongoose.model('Schedule');

        let query = {
            gametype: constants.schedule_game_type.regular_season,
            wowytype: constants.wowy_type.woodwowy
        };

        // assume the query is pre-validated

        if (options.player) {
            query.player1id = options.player;
        }

        if (options.teammates && options.teammates.length) {
            query.player2id = {"$in": options.teammates};
        }

        if (options.team) {
            query.team = options.team;
        }

        return Promise.all([
            Schedule.findOne({ "data.date" : {$gte: dateToString(options.from_date)}}).sort({"data.gamekey":1}).exec(),
            Schedule.findOne({ "data.date" : {$lte: dateToString(options.to_date)}}).sort({"data.gamekey":-1}).exec(),
        ]).then(([from_game, to_game]) => {

            // console.log("from_game", from_game);
            // console.log("to_game", to_game);

            //check that we have the data for the selected range, otherwise simply return empty results
            if(options.from_date && to_game) {
                let dt = Date.parse(to_game.data.date);
                if (options.from_date > dt) {
                    return Promise.resolve([]);
                }
            }

            if(from_game || to_game) {
                query.gamekey = {};
                if (from_game) {
                    query.gamekey.$gte = from_game.data.gamekey;
                }
                if (to_game) {
                    query.gamekey.$lte = to_game.data.gamekey;
                }
            }

            let query_start = Date.now();
            return GameWoodwowy.aggregate([
                { $match: query },
                {
                    $group: {
                        _id: {
                            player_1_id: '$player1id',
                            player_2_id: '$player2id',
                            // season: '$season',
                            team: '$team',
                            gametype: '$gametype',
                            onoff: '$onoff',
                            wowytype: '$wowytype',
                            woodmoneytier: '$woodmoneytier',
                            recordtype : '$recordtype'
                        },

                        games_played: { $sum: 1 },
                        sacf: { $sum: '$sacf' },
                        saca: { $sum: '$saca' },
                        ca: { $sum: '$ca' },
                        cf: { $sum: '$cf' },
                        gf: { $sum: '$gf' },
                        ga: { $sum: '$ga' },
                        evtoi: { $sum: '$evtoi' },
                        nz: { $sum: '$nz' },
                        dff: { $sum: '$dff' },
                        dfa: { $sum: '$dfa' },
                        fa: { $sum: '$fa' },
                        dz: { $sum: '$dz' },
                        ff: { $sum: '$ff' },
                        oz: { $sum: '$oz' },
                        sa: { $sum: '$sa' },
                        sf: { $sum: '$sf' }

                    }
                },
                {
                    $group: {
                        _id: {
                            player_1_id: '$_id.player_1_id',
                            player_2_id: '$_id.player_2_id',
                            // season: '$_id.season',
                            team: '$_id.team'
                        },
                        woodwowy : {
                            $push : {

                                player_1_id: '$_id.player_1_id',
                                player_2_id: '$_id.player_2_id',
                                team: '$_id.team',

                                gametype: '$_id.gametype',
                                onoff: '$_id.onoff',
                                wowytype: '$_id.wowytype',
                                woodmoneytier: '$_id.woodmoneytier',
                                recordtype: '$_id.recordtype',

                                games_played: '$games_played',
                                sacf: '$sacf',
                                saca: '$saca',
                                ca: '$ca',
                                cf: '$cf',
                                gf: '$gf',
                                ga: '$ga',
                                evtoi: '$evtoi',
                                nz: '$nz',
                                dff: '$dff',
                                dfa: '$dfa',
                                fa: '$fa',
                                dz: '$dz',
                                ff: '$ff',
                                oz: '$oz',
                                sa: '$sa',
                                sf: '$sf'
                            }
                        }
                    }
                }
            ]).then((data) => {

                if(config.env === "local") console.log(`${data.length} results in ${Date.now()-query_start} ms`);
                let result = formatter.formatBulk(data, player_dict, true);

                return Promise.resolve(_.sortBy(result, x => woodmoney_tier_sort[x.woodmoneytier]));

            }, (err) => {
                return Promise.reject(err);
            });
        });
    };
};