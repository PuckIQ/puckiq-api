"use strict";

const _ = require("lodash");
const constants = require('../../../common/constants');
const MongoHelpers = require('../../../common/mongo_helpers');
const shift_formatter = require('./shift_formatter');

const helper = new MongoHelpers();

module.exports = (mongoose, config) => {

    return (options, player_dict) => {

        let SeasonShift = mongoose.model('SeasonShift');

        //NOTE: we need both and calculate the rels
        if (options.onoff) delete options.onoff;
        if (options.positions === 'all') delete options.positions;

        let query = helper.mongoQueryBuilder(options);

        delete query.group_by;
        delete query.tier;
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

        let group_id = {
            player_id: '$playerid'
        };

        if(!!~options.group_by.indexOf('season')) group_id.season = "$season";
        if(!!~options.group_by.indexOf('team')) group_id.team = "$team";

        return SeasonShift.aggregate([
            { $match: query },
            {
                $group: {
                    _id: group_id,
                    results: {
                        $push: {
                            player_id: '$_id.player_id',
                            season: '$season',
                            team: '$team',
                            games_played: '$gamesplayed',
                            
                            ostart_shifts : '$ostart.shifts',
                            ostart_gf : '$ostart.gf',
                            ostart_ga : '$ostart.ga',
                            ostart_cf : '$ostart.cf',
                            ostart_ca : '$ostart.ca',
                            ostart_avgshift : '$ostart.avgshift',
                            dstart_shifts : '$dstart.shifts',
                            dstart_gf : '$dstart.gf',
                            dstart_ga : '$dstart.ga',
                            dstart_cf : '$dstart.cf',
                            dstart_ca : '$dstart.ca',
                            dstart_avgshift : '$dstart.avgshift',
                            nstart_shifts : '$nstart.shifts',
                            nstart_gf : '$nstart.gf',
                            nstart_ga : '$nstart.ga',
                            nstart_cf : '$nstart.cf',
                            nstart_ca : '$nstart.ca',
                            nstart_avgshift : '$nstart.avgshift',
                            otf_shifts : '$otf.shifts',
                            otf_gf : '$otf.gf',
                            otf_ga : '$otf.ga',
                            otf_cf : '$otf.cf',
                            otf_ca : '$otf.ca',
                            otf_avgshift : '$otf.avgshift',
                            pureotf_shifts : '$pureotf.shifts',
                            pureotf_gf : '$pureotf.gf',
                            pureotf_ga : '$pureotf.ga',
                            pureotf_cf : '$pureotf.cf',
                            pureotf_ca : '$pureotf.ca',
                            pureotf_avgshift : '$pureotf.avgshift',
                        }
                    }
                }
            }
        ]).then((data) => {

            if(options.group_by !== constants.group_by.player_season_team) {
                data = shift_formatter.flatten(data, player_dict);
            }

            let sorted = data; //todo
            // let result = woodmoney_formatter.formatBulk(data, player_dict);
            // let sorted = _.orderBy(result,['season', 'tier_sort_index'], ['desc', 'asc']);

            return Promise.resolve(sorted);

        }, (err) => {
            return Promise.reject(err);
        });
    };
};