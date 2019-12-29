"use strict";

const _ = require("lodash");
const constants = require('../../../common/constants');
const MongoHelpers = require('../../../common/mongo_helpers');
const woodmoney_formatter = require('./woodmoney_formatter');

module.exports = (mongoose, config) => {

    return (options, player_dict) => {

        let SeasonWoodmoney = mongoose.model('SeasonWoodmoney');
        let helper = new MongoHelpers();

        //NOTE: we need both and calculate the rels
        if (options.onoff) delete options.onoff;
        if (options.positions === 'all') delete options.positions;

        let query = helper.mongoQueryBuilder(options);

        delete query.group_by;

        if (query.player) {
            query.playerid = query.player;
            delete query.player;
        }

        if (_.isArray(options.season) && options.season.length > 1) {
            query.season = {$in: _.map(options.season, x => parseInt(x))};
        } else if (options.season && options.season !== 'all') {
            options.season = _.isArray(options.season) ? parseInt(options.season[0]) : parseInt(options.season);
        }

        if(options.season === 20192020 && new Date() < new Date(2019, 9, 1, 18, 0, 0, 0)){
            query.gametype = constants.schedule_game_type.pre_season;
        } else {
            query.gametype = constants.schedule_game_type.regular_season;
        }

        let group_id = {
            player_id: '$playerid'
        };

        if(!!~options.group_by.indexOf('season')) group_id.season = "$season";
        if(!!~options.group_by.indexOf('team')) group_id.team = "$team";

        return SeasonWoodmoney.aggregate([
            { $match: query },
            {
                $group: {
                    _id: group_id,
                    woodmoney: {
                        $push: {
                            player_id: '$_id.player_id',
                            season: '$season',
                            team: '$team',
                            games_played: '$gamesplayed',
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

            if(options.group_by !== constants.group_by.player_season_team) {
                data = woodmoney_formatter.groupRecords(data, options.group_by);
            }

            let result = woodmoney_formatter.formatBulk(data, player_dict, false);

            let sorted = _.orderBy(result,['season', 'tier_sort_index'], ['desc', 'asc']);
            // let sorted;
            // if (!!~options.group_by.indexOf("season")) {
            //     sorted = _.orderBy(result, ['season', 'tier_sort_index'], ['desc', 'asc']);
            // } else {
            //     sorted = _.orderBy(result, x => x.tier_sort_index);
            // }

            return Promise.resolve(sorted);

        }, (err) => {
            return Promise.reject(err);
        });
    };
};