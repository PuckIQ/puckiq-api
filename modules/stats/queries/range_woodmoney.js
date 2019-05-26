"use strict";

const _ = require("lodash");
const constants = require('../../../common/constants');
const woodmoney_formatter = require('./woodmoney_formatter');
const woodmoney_tier_sort = constants.woodmoney_tier_sort;

module.exports = (mongoose, config) => {

    return (options, player_dict) => {

        let GameWoodmoney = mongoose.model('GameWoodmoney');
        let Schedule = mongoose.model('Schedule');

        let query = {
            gametype: constants.schedule_game_type.regular_season,
            wowytype: constants.wowy_type.woodmoney
        };

        // assume the query is pre-validated

        if (options.player) {
            query.playerid = options.player;
        }

        if (options.team) {
            query.team = options.team;
        }

        function pad(val) {
            return val.toString().padStart(2, '0');
        }

        //must have from date and to date
        function dateToString(dt) {
            return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
        }

        return Promise.all([
            Schedule.findOne({ "data.date" : {$gte: dateToString(options.from_date)}}).sort({"data.gamekey":1}).exec(),
            Schedule.findOne({ "data.date" : {$lte: dateToString(options.to_date)}}).sort({"data.gamekey":-1}).exec(),
        ]).then(([from_game, to_game]) => {

            // console.log("from_game", from_game);
            // console.log("to_game", to_game);

            if(from_game || to_game) {
                query.gamekey = {};
                if (from_game) {
                    query.gamekey.$gte = from_game.data.gamekey;
                }
                if (to_game) {
                    query.gamekey.$lte = to_game.data.gamekey;
                }
            }

            return GameWoodmoney.aggregate([
                { $match: query },
                {
                    $group: {
                        _id: {
                            player_id: '$playerid',
                            season: '$season',
                            team: '$team',
                            gametype: '$gametype',
                            onoff: '$onoff',
                            wowytype: '$wowytype',
                            woodmoneytier: '$woodmoneytier'
                        },

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
                            player_id: '$_id.player_id',
                            season: '$_id.season',
                            team: '$_id.team'
                        },
                        woodmoney : {
                            $push : {

                                gametype: '$_id.gametype',
                                onoff: '$_id.onoff',
                                wowytype: '$_id.wowytype',
                                woodmoneytier: '$_id.woodmoneytier',

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

                // console.log("data", data.length);

                let results = _.chain(data).map(x => {

                    //NOTE: wowytype is always Woodmoney in this query

                    let all = _.find(x.woodmoney, z => {
                        return z.onoff === constants.on_off.on_ice &&
                            z.wowytype === constants.wowy_type.woodmoney &&
                            z.woodmoneytier === constants.woodmoney_tier.all;
                    });

                    //tmp solution until G gets the all data for games populated
                    if (!all) {
                        let all_records = woodmoney_formatter.buildAllRecords(x.woodmoney);
                        all = all_records[0];
                        x.woodmoney = x.woodmoney.concat(all_records);
                    }

                    let all_toi = all.evtoi;

                    let player_info = {
                        name : 'unknown',
                        positions : ['?']
                    };

                    // y.evtoi = y.evtoi/60;// convert to minutes
                    // till we get a real nhlplayers collection
                    if(_.has(player_dict, x._id.player_id)) {
                        player_info.name = player_dict[x._id.player_id].name;
                        player_info.positions = player_dict[x._id.player_id].positions;
                    } else {
                        console.log("cannot find player", x._id.player_id);
                    }

                    //returns one record per tier
                    let wm = woodmoney_formatter.format(x, player_info, all_toi, true);

                    return wm;

                }).flatten().sortBy(x => woodmoney_tier_sort[x.woodmoneytier]).value();

                return Promise.resolve(results);

            }, (err) => {
                return Promise.reject(err);
            });
        });
    };
};