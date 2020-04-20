"use strict";

const _ = require('lodash');
const constants = require('../../../common/constants');
const calculator = require('./calculator');
const woodmoney_tier_sort = constants.woodmoney_tier_sort;

exports.formatBulk = (data, player_dict) => {

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
        if(_.has(player_dict, result._id.player_id)) {
            player_info.name = player_dict[result._id.player_id].name;
            player_info.positions = player_dict[result._id.player_id].positions;
        } else {
            console.log("cannot find player", result._id.player_id);
        }

        //returns one record per tier (should be 4 records)
        return this.format(result, player_info, all_toi);

    }).flatten().value();

    return results;
};

exports.format = (result, player_info, all_toi) => {

    return _.chain(result.woodmoney).map((woodmoney) => {

        if (woodmoney.onoff !== constants.on_off.on_ice && woodmoney.recordtype !== constants.wowy_record_type.one_and_two) {
            return null;
        }

        let off = _.find(result.woodmoney, z => {
            return z.onoff === constants.on_off.off_ice &&
                woodmoney.wowytype === z.wowytype &&
                woodmoney.woodmoneytier === z.woodmoneytier;
        });

        if (!off) {
            console.log("data issue.... (missing off)");
            return null;
        }

        //used it use is_range_query for this
        // for grouped records that are range queries these will sometimes be already calculated
        if (woodmoney.cf > 0 && !woodmoney.cf60) {
            calculator.calculateFieldsFor(woodmoney);
            calculator.calculateFieldsFor(off);
        }

        let rel_comp_stats = {
            'onshpct': (1 - (woodmoney.sf - woodmoney.gf) / (woodmoney.sf || 1)) * 100,
            'onsvpct': (woodmoney.sa - woodmoney.ga) / (woodmoney.sa || 1) * 100,
            'ozspct': (woodmoney.oz / ((woodmoney.oz + woodmoney.dz) || 1)) * 100,
            'fo60': (woodmoney.oz + woodmoney.nz + woodmoney.dz) / (woodmoney.evtoi || 1) * 3600,
            'ctoipct': (woodmoney.evtoi / (all_toi || 1)) * 100,
            'cf60rc': woodmoney.cf60 - off.cf60,
            'ca60rc': woodmoney.ca60 - off.ca60,
            'cfpctrc': woodmoney.cfpct - off.cfpct,
            'cfpctra': 0, //TODO
            'dff60rc': woodmoney.dff60 - off.dff60,
            'dfa60rc': woodmoney.dfa60 - off.dfa60,
            'dffpctrc': woodmoney.dffpct - off.dffpct,
            'dffpctra': 0, //TODO
        };

        rel_comp_stats.pdo = Math.round((rel_comp_stats.onshpct * 10) + (rel_comp_stats.onsvpct * 10));

        let formatted_data = {
            evtoi: woodmoney.evtoi / 60
        };

        woodmoney.tier_sort_index = woodmoney_tier_sort[woodmoney.woodmoneytier];

        return _.extend({}, result._id, player_info, rel_comp_stats, woodmoney, formatted_data);

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

exports.flattenWoodmoneyIntoTiers = (data) => {

    let results = _.map(data, (record)=> {
        let woodmoney = this._flattenWoodmoneyIntoTiers(record);
        return {
            _id : record._id,
            woodmoney: woodmoney
        };
    });

    return results;
};


const SUMMATION_FIELDS = ['games_played','evtoi', 'cf','ca','dff','dfa','gf','ga','sf','sa','ff','fa','sacf','saca','oz', 'nz', 'dz'];

exports._flattenWoodmoneyIntoTiers = (record) => {

    let woodmonies = record.woodmoney;

    // nothing required
    if(woodmonies.length === 8) return woodmonies;
    if(woodmonies.length === 6 && !_.some(woodmonies, x => x.woodmoneytier === constants.woodmoney_tier.all)){
        let all = this.buildAllRecords(woodmonies);
        return woodmonies.concat(all);
    }

    // initialize player total
    let player_total = { };
    _.each(_.values(constants.woodmoney_tier), (tier) => {
        player_total[tier] = {};
        let base_record = _.extend({woodmoneytier: tier, wowytype : constants.wowy_type.woodmoney }, record._id);
        player_total[tier][constants.on_off.on_ice] = _.extend({}, base_record, {onoff: constants.on_off.on_ice});
        player_total[tier][constants.on_off.off_ice] = _.extend({}, base_record, {onoff: constants.on_off.off_ice});
        _.each(SUMMATION_FIELDS, f => {
            player_total[tier][constants.on_off.on_ice][f] = 0;
            player_total[tier][constants.on_off.off_ice][f] = 0;
        });
    });

    _.each(woodmonies, (woodmoney) => {
       let rec = player_total[woodmoney.woodmoneytier][woodmoney.onoff];
       _.each(SUMMATION_FIELDS, f => {
          rec[f] = rec[f] + (woodmoney[f] || 0);
       });
    });

    let result = [];

    _.each(_.values(constants.woodmoney_tier), (tier) => {
        calculator.calculateFieldsFor(player_total[tier][constants.on_off.on_ice]);
        calculator.calculateFieldsFor(player_total[tier][constants.on_off.off_ice]);

        result.push(player_total[tier][constants.on_off.on_ice]);
        result.push(player_total[tier][constants.on_off.off_ice]);
    });

    return result;
};