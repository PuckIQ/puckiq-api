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

        delete query.seasons;
        delete query.group_by;
        delete query.tier;
        delete query.group_by;

        if (query.player) {
            query.playerid = query.player;
            delete query.player;
        }

        if (_.isArray(options.seasons) && options.seasons.length > 1) {
            query.season = {$in: _.map(options.seasons, x => parseInt(x))};
        } else if (options.seasons && options.seasons !== 'all') {
            query.season = _.isArray(options.seasons) ? parseInt(options.seasons[0]) : parseInt(options.seasons);
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
                            total_shifts: '$totalshifts',

                            ostart_shifts : '$ostart.shifts',
                            ostart_gf : '$ostart.gf',
                            ostart_ga : '$ostart.ga',
                            ostart_cf : '$ostart.cf',
                            ostart_ca : '$ostart.ca',
                            ostart_dff : '$ostart.dff',
                            ostart_dfa : '$ostart.dfa',
                            ostart_avgshift : '$ostart.avgshift',
                            dstart_shifts : '$dstart.shifts',
                            dstart_gf : '$dstart.gf',
                            dstart_ga : '$dstart.ga',
                            dstart_cf : '$dstart.cf',
                            dstart_ca : '$dstart.ca',
                            dstart_dff : '$dstart.dff',
                            dstart_dfa : '$dstart.dfa',
                            dstart_avgshift : '$dstart.avgshift',
                            nstart_shifts : '$nstart.shifts',
                            nstart_gf : '$nstart.gf',
                            nstart_ga : '$nstart.ga',
                            nstart_cf : '$nstart.cf',
                            nstart_ca : '$nstart.ca',
                            nstart_dff : '$nstart.dff',
                            nstart_dfa : '$nstart.dfa',
                            nstart_avgshift : '$nstart.avgshift',
                            otf_shifts : '$otf.shifts',
                            otf_gf : '$otf.gf',
                            otf_ga : '$otf.ga',
                            otf_cf : '$otf.cf',
                            otf_ca : '$otf.ca',
                            otf_dff : '$otf.dff',
                            otf_dfa : '$otf.dfa',
                            otf_avgshift : '$otf.avgshift'
                        }
                    }
                }
            }
        ]).then((data) => {

            data = shift_formatter.formatBulk(data, player_dict);

            let sorted = !group_id.season ?
                _.orderBy(data,['_id.season'], ['desc']) :
                data;

            return Promise.resolve(sorted);

        }, (err) => {
            return Promise.reject(err);
        });
    };
};