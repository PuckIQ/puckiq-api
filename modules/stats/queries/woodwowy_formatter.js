const _ = require('lodash');
const constants = require('../../../common/constants');
const calculator = require('./calculator');
const woodmoney_tier_sort = constants.woodmoney_tier_sort;

exports.formatBulk = (data, player_dict, is_range_query) => {

    let results = _.chain(data).map(result => {

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

        //returns one record per tier
        return this.format(result, player_info, is_range_query);

    }).flatten().value();

    return results;
};

exports.format = (result, player_info, is_range_query) => {

    return _.chain(result.woodwowy).map((item) => {

        if (item.onoff === constants.on_off.off_ice) return null;

        let off = _.find(result.woodwowy, x => {
            // console.log(`${x.onoff},${x.wowytype},${x.woodmoneytier},${x.recordtype}`);
            return x.onoff === constants.on_off.off_ice &&
                item.wowytype === x.wowytype &&
                item.recordtype === x.recordtype &&
                item.woodmoneytier === x.woodmoneytier;
        });

        if (!off) {
            console.log("data issue.... (missing off)");
            return null;
        }

        if (is_range_query) {
            calculator.calculateFieldsFor(item);
            calculator.calculateFieldsFor(off);
        }

        let rel_comp_stats = {
            'onshpct': (1 - (item.sf - item.gf) / (item.sf || 1)) * 100,
            'onsvpct': (item.sa - item.ga) / (item.sa || 1) * 100,
            'ozspct': (item.oz / ((item.oz + item.dz) || 1)) * 100,
            'fo60': (item.oz + item.nz + item.dz) / (item.evtoi || 1) * 3600,
            // 'ctoipct': (item.evtoi / (all_toi || 1)) * 100,
            'cf60rc': item.cf60 - off.cf60,
            'ca60rc': item.ca60 - off.ca60,
            'cfpctrc': item.cfpct - off.cfpct,
            'cfpctra': 0, //TODO
            'dff60rc': item.dff60 - off.dff60,
            'dfa60rc': item.dfa60 - off.dfa60,
            'dffpctrc': item.dffpct - off.dffpct,
            'dffpctra': 0, //TODO
        };

        rel_comp_stats.pdo = Math.round((rel_comp_stats.onshpct * 10) + (rel_comp_stats.onsvpct * 10));

        let formatted_data = {
            evtoi: item.evtoi / 60
        };

        //hack until g gets the data for season collections
        if(!item.games_played) item.games_played = "n/a";

        item.tier_sort_index = woodmoney_tier_sort[item.woodmoneytier];

        return _.extend({}, result._id, player_info, rel_comp_stats, item, formatted_data);

    }).compact().value();

};