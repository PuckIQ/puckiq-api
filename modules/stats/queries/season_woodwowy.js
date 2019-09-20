"use strict";

const _ = require("lodash");
const constants = require('../../../common/constants');
const MongoHelpers = require('../../../common/mongo_helpers');
const woodmoney_formatter = require('./woodmoney_formatter');
const wowy_type = constants.wowy_type;
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

            let result = woodmoney_formatter.formatBulk(wowy_type.woodwowy, data, player_dict, false);

            return Promise.resolve(_.orderBy(result,['season', 'tier_sort_index','recordtype'], ['desc', 'asc', 'asc']));

        }, (err) => {
            return Promise.reject(err);
        });
    };
};