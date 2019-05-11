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
            gametype: constants.schedule_game_type.regular_season
        };

        // assume the query is pre-validated

        if (options.player) {
            query.playerid = options.player;
        }

        if (options.team) {
            query.team = options.team;
        }

        //must have from date and to date
        function dateToString(dt){
            return `${dt.getFullYear()}-${dt.getMonth()+1}-${dt.getDate()}`;
        }

        return Promise.all([
            Schedule.findOne({ "data.date" : {$gte: dateToString(options.from_date)}}).sort({"data.gamekey":1}).exec(),
            Schedule.findOne({ "data.date" : {$lte: dateToString(options.to_date)}}).sort({"data.gamekey":-1}).exec(),
        ]).then(([from_game, to_game]) => {

            console.log("from_game", from_game);
            console.log("to_game", to_game);

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
                            team: '$team'
                        },
                        woodmoney: {
                            $push: {
                                player_id: '$_id.player_id',
                                team: '$_id.team',
                                onoff: '$onoff',
                                wowytype : '$wowytype',
                                woodmoneytier : '$woodmoneytier',
                                sacf: '$sacf',
                                saca: '$saca',
                                sfpct: '$sfpct',
                                ca: '$ca',
                                cf: '$cf',
                                gf: '$gf',
                                saca60: '$saca60',
                                ga: '$ga',
                                sacfpct: '$sacfpct',
                                gf60: '$gf60',
                                evtoi: '$evtoi',
                                ga60: '$ga60',
                                cfpct: '$cfpct',
                                sa60: '$sa60',
                                nz: '$nz',
                                dff: '$dff',
                                dfa: '$dfa',
                                ca60: '$ca60',
                                fa: '$fa',
                                dz: '$dz',
                                sf60: '$sf60',
                                ff: '$ff',
                                fa60: '$fa60',
                                sacf60: '$sacf60',
                                ffpct: '$ffpct',
                                cf60: '$cf60',
                                ff60: '$ff60',
                                dff60: '$dff60',
                                dffpct: '$dffpct',
                                oz: '$oz',
                                dfa60: '$dfa60',
                                sa: '$sa',
                                sf: '$sf',
                                gfpct: '$gfpct',
                            }
                        }
                    }
                }
            ]).then((data) => {

                console.log("data", data.length);

                let results = _.chain(data).map(x => {

                    //NOTE: wowytype is always Woodmoney in this query

                    let all = _.find(x.woodmoney, z => {
                        return z.onoff === constants.on_off.on_ice &&
                            z.wowytype === constants.wowy_type.woodmoney &&
                            z.woodmoneytier === constants.woodmoney_tier.all;
                    });

                    if (!all) {
                        console.log("data issue.... (missing all)");
                        return null;
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
                    let wm = woodmoney_formatter.format(x, player_info, all_toi);

                    return wm;

                }).flatten().sortBy(x => woodmoney_tier_sort[x.woodmoneytier]).value();

                return Promise.resolve(results);

            }, (err) => {
                return Promise.reject(err);
            });
        });
    };
};