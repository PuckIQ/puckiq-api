"use strict";

const _ = require("lodash");
const constants = require('../../../common/constants');
const MongoHelpers = require('../../../common/mongo_helpers');
const shift_formatter = require('./shift_formatter');

const helper = new MongoHelpers();

module.exports = (mongoose, config) => {

    return (options, player_dict) => {

        const SeasonTeamShift = mongoose.model('SeasonTeamShift');

        //NOTE: we need both and calculate the rels
        if (options.onoff) delete options.onoff;
        if (options.positions === 'all') delete options.positions;

        let query = helper.mongoQueryBuilder(options);

        delete query.seasons;
        delete query.group_by;
        delete query.tier;
        delete query.player;

        if (_.isArray(options.seasons) && options.seasons.length > 1) {
            query.season = {$in: _.map(options.seasons, x => parseInt(x))};
        } else if (options.seasons && options.seasons !== 'all') {
            query.season = _.isArray(options.seasons) ? parseInt(options.seasons[0]) : parseInt(options.seasons);
        }

        //assume season/team for now
        // let group_id = {
        //     team: 'team',
        //     season: 'season'
        // };

        return SeasonTeamShift.find(query).lean().then((data) => {

            data = shift_formatter.formatTeamBulk(data);

            let sorted = _.orderBy(data,['_id.season', '_id.team'], ['desc','asc']);

            return Promise.resolve(sorted);

        }, (err) => {
            return Promise.reject(err);
        });
    };
};