"use strict";

const _ = require("lodash");
const constants = require('../../../common/constants');
const MongoHelpers = require('../../../common/mongo_helpers');
const woodmoney_formatter = require('./woodmoney_formatter');
const woodmoney_tier_sort = constants.woodmoney_tier_sort;

module.exports = (mongoose, config) => {

    return (options, player_dict) => {

        let SeasonWoodwowy = mongoose.model('SeasonWoodwowy');
        let helper = new MongoHelpers();

        //NOTE: we need both and calculate the rels
        if (options.onoff) delete options.onoff;
        if (options.positions === 'all') delete options.positions;

        let query = helper.mongoQueryBuilder(options);

        query.gametype = constants.schedule_game_type.regular_season;

        if (query.player) {
            query.player1id = query.player;
            delete query.player;
        }

        if (query.teammates && query.teammates.length) {
            query.player2id = {$in : query.teammates };
            delete query.teammates;
        }

        if (_.isArray(options.season) && options.season.length > 1) {
            query.season = {$in: _.map(options.season, x => parseInt(x))};
        } else if (options.season && options.season !== 'all') {
            options.season = _.isArray(options.season) ? parseInt(options.season[0]) : parseInt(options.season);
        }

        return SeasonWoodwowy.aggregate([
            { $match: query },
            {
                $group: {
                    _id: {
                        player_1_id: '$player1id',
                        player_2_id: '$player2id',
                        season: '$season',
                        team: '$team'
                    },
                    woodwowy: {
                        $push: {
                            player_1_id: '$_id.player_1_id',
                            player_2_id: '$_id.player_2_id',
                            team: '$_id.team',
                            games_played: '$games_played',
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

            let results = _.chain(data).map(result => {

                //NOTE: wowytype is always WoodWOWY in this query

                let all = _.find(result.woodwowy, z => {
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
                if(_.has(player_dict, result._id.player_1_id)) {
                    player_info.name = player_dict[result._id.player_1_id].name;
                    player_info.positions = player_dict[result._id.player_1_id].positions;
                } else {
                    console.log("cannot find player", result._id.player_1_id);
                }

                if(_.has(player_dict, result._id.player_2_id)) {
                    player_info.name = player_dict[result._id.player_2_id].name;
                    player_info.positions = player_dict[result._id.player_2_id].positions;
                } else {
                    console.log("cannot find player", result._id.player_2_id);
                }

                //hmmm can I use the wm formatter???
                result.woodmoney = result.woodwowy;

                //returns one record per tier
                return woodmoney_formatter.format(result, player_info, all_toi);

            }).flatten().sortBy(x => woodmoney_tier_sort[x.woodmoneytier]).value();

            return Promise.resolve(results);

        }, (err) => {
            return Promise.reject(err);
        });
    };
};