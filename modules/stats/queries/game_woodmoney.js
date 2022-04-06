"use strict";

const _ = require("lodash");
const constants = require('../../../common/constants');
const MongoHelpers = require('../../../common/mongo_helpers');
const woodmoney_formatter = require('./woodmoney_formatter');

module.exports = (mongoose, config) => {

    return (options, player_dict) => {

        const GameWoodmoney = mongoose.model('GameWoodmoney');
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

        query.gametype = constants.schedule_game_type.regular_season;

        return GameWoodmoney.find(query).lean().then((data) => {

            if(!options.tier || options.tier.toUpperCase() === 'ALL') {
                let by_game = _.groupBy(data, 'gamekey');
                _.each(_.keys(by_game), game => {
                    let all = woodmoney_formatter.buildAllRecords(by_game[game], true);
                    data.push(...all);
                });
            }

            return Promise.resolve(data);
        }, (err) => {
            return Promise.reject(err);
        });
    };
};