const _ = require('lodash');
const constants = require('../../../common/constants');
const calculator = require('./calculator');
const woodmoney_tier_sort = constants.woodmoney_tier_sort;

exports.formatBulk = (data, player_dict, is_range_query) => {

    let results = _.chain(data).map(result => {

        let all = _.find(result.woodmoney, z => {
            return z.onoff === constants.on_off.on_ice &&
                z.wowytype === constants.wowy_type.woodmoney &&
                z.woodmoneytier === constants.woodmoney_tier.all;
        });

        if (!all) {
            let all_records = this.buildAllRecords(result.woodmoney);
            all = all_records[0];
            result.woodmoney = result.woodmoney.concat(all_records);
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

        //returns one record per tier
        return this.format(result, player_info, all_toi, is_range_query);

    }).flatten().value();

    return results;
};

exports.format = (result, player_info, all_toi, is_range_query) => {

    return _.chain(result.woodmoney).map((y) => {

        if (y.onoff === constants.on_off.off_ice) return null;

        let off = _.find(result.woodmoney, z => {
            return z.onoff === constants.on_off.off_ice &&
                y.wowytype === z.wowytype &&
                y.woodmoneytier === z.woodmoneytier;
        });

        if (!off) {
            console.log("data issue.... (missing off)");
            return null;
        }

        if (is_range_query) {
            calculator.calculateFieldsFor(y);
            calculator.calculateFieldsFor(off);
        }

        let rel_comp_stats = {
            'onshpct': (1 - (y.sf - y.gf) / (y.sf || 1)) * 100,
            'onsvpct': (y.sa - y.ga) / (y.sa || 1) * 100,
            'ozspct': (y.oz / ((y.oz + y.dz) || 1)) * 100,
            'fo60': (y.oz + y.nz + y.dz) / (y.evtoi || 1) * 3600,
            'ctoipct': (y.evtoi / (all_toi || 1)) * 100,
            'cf60rc': y.cf60 - off.cf60,
            'ca60rc': y.ca60 - off.ca60,
            'cfpctrc': y.cfpct - off.cfpct,
            'cfpctra': 0, //TODO
            'dff60rc': y.dff60 - off.dff60,
            'dfa60rc': y.dfa60 - off.dfa60,
            'dffpctrc': y.dffpct - off.dffpct,
            'dffpctra': 0, //TODO
        };

        rel_comp_stats.pdo = Math.round((rel_comp_stats.onshpct * 10) + (rel_comp_stats.onsvpct * 10));

        let formatted_data = {
            evtoi: y.evtoi / 60
        };

        //hack until g gets the data for season collections
        if(!y.games_played) y.games_played = "n/a";

        y.tier_sort_index = woodmoney_tier_sort[y.woodmoneytier];

        return _.extend({}, result._id, player_info, rel_comp_stats, y, formatted_data);

    }).compact().value();

};

exports.buildAllRecords = (woodmoney) => {

    let tmp = {};
    tmp[constants.on_off.on_ice] = null;
    tmp[constants.on_off.off_ice] = null;

    _.each(woodmoney, x => {
        if (!tmp[x.onoff]) {
            tmp[x.onoff] = _.extend({}, x, {woodmoneytier: constants.woodmoney_tier.all});
        } else {
            let wm = tmp[x.onoff];
            wm.sacf += x.sacf;
            wm.saca += x.saca;
            wm.ca += x.ca;
            wm.cf += x.cf;
            wm.gf += x.gf;
            wm.ga += x.ga;
            wm.evtoi += x.evtoi;
            wm.nz += x.nz;
            wm.dff += x.dff;
            wm.dfa += x.dfa;
            wm.fa += x.fa;
            wm.dz += x.dz;
            wm.ff += x.ff;
            wm.oz += x.oz;
            wm.sa += x.sa;
            wm.sf += x.sf;
        }
    });

    let all_records = _.values(tmp);

    // done later anyways...
    // _.each(all_records, x => {
    //     this.calculateFieldsFor(x);
    // });

    return all_records;
};