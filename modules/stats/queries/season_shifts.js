"use strict";

const _ = require("lodash");
const constants = require('../../../common/constants');
const MongoHelpers = require('../../../common/mongo_helpers');

module.exports = (mongoose, config) => {

    return (options, player_dict) => {

        let Shift = mongoose.model('Shift');
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

        return Shift.find(query).lean().then((data) => {

            let sorted = data; //todo
            // if(options.group_by !== constants.group_by.player_season_team) {
            //     data = woodmoney_formatter.flattenWoodmoneyIntoTiers(data);
            // }
            //
            // let result = woodmoney_formatter.formatBulk(data, player_dict);
            //
            // let sorted = _.orderBy(result,['season', 'tier_sort_index'], ['desc', 'asc']);

            return Promise.resolve(sorted);

        }, (err) => {
            return Promise.reject(err);
        });
    };
};