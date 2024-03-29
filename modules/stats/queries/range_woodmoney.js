"use strict";

const _ = require("lodash");
const constants = require('../../../common/constants');
const woodmoney_formatter = require('./woodmoney_formatter');
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

        let GameWoodmoney = mongoose.model('GameWoodmoney');
        let Schedule = mongoose.model('Schedule');

        let query = {
            gametype: constants.schedule_game_type.regular_season,
            wowytype: constants.wowy_type.woodmoney
        };

        // assume the query is pre-validated

        let schedule_query = {
            "data.date": {
                $gte: dateToString(options.from_date),
                $lte: dateToString(options.to_date)
            }
        };

        if (options.player) {
            query.playerid = options.player;
        }

        if (options.team) {
            query.team = options.team;
            schedule_query.$or = [
                {'data.away.teamabbr' : options.team.toString()},
                {'data.home.teamabbr' : options.team.toString()}
            ];
        }

        return Promise.all([
            Schedule.find(schedule_query).sort({"data.gamekey":1}).exec(),
        ]).then(([games]) => {

            if(games.length) {
                query.gamekey = { $in: _.map(games, 'data.gamekey') };
            } else {
                return Promise.resolve([]);
            }

            const group_by1 = {
                player_id: '$playerid',
                gametype: '$gametype',
                onoff: '$onoff',
                wowytype: '$wowytype',
                woodmoneytier: '$woodmoneytier'
            };

            if(!!~options.group_by.indexOf('season')) group_by1.season = "$season"; //not sure we can have this...
            if(!!~options.group_by.indexOf('team')) group_by1.team = "$team";

            const group_by2 = {
                player_id: '$_id.player_id'
            };

            if(!!~options.group_by.indexOf('season')) group_by2.season = "$_id.season"; //not sure we can have this...
            if(!!~options.group_by.indexOf('team')) group_by2.team = "$_id.team";

            return GameWoodmoney.aggregate([
                { $match: query },
                {
                    $group: {
                        _id: group_by1,
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
                        _id: group_by2,
                        woodmoney : {
                            $push : {

                                gametype: '$_id.gametype',
                                onoff: '$_id.onoff',
                                wowytype: '$_id.wowytype',
                                woodmoneytier: '$_id.woodmoneytier',

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

                if(options.group_by !== constants.group_by.player_season_team) {
                    data = woodmoney_formatter.flattenWoodmoneyIntoTiers(data);
                }

                let result = woodmoney_formatter.formatBulk(data, player_dict);

                return Promise.resolve(_.sortBy(result, x => woodmoney_tier_sort[x.woodmoneytier]));

            }, (err) => {
                return Promise.reject(err);
            });
        });
    };
};