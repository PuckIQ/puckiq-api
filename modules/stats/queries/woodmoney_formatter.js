const _ = require('lodash');
const constants = require('../../../common/constants');
const woodmoney_tier_sort = constants.woodmoney_tier_sort;

exports.format = (x, player_info, all_toi, game_summary) => {

    return _.chain(x.woodmoney).map((y) => {

        if (y.onoff === constants.on_off.off_ice) return null;

        let off = _.find(x.woodmoney, z => {
            return z.onoff === constants.on_off.off_ice && y.wowytype === z.wowytype && y.woodmoneytier === z.woodmoneytier;
        });

        if (!off) {
            console.log("data issue.... (missing off)");
            return null;
        }

        if (game_summary) {
            this.calculateFieldsFor(y);
            this.calculateFieldsFor(off);
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

        y.tier_sort_index = woodmoney_tier_sort[y.woodmoneytier];

        return _.extend({}, x._id, player_info, rel_comp_stats, y, formatted_data);

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

const PCT_MULTIPLIER = 100;
const safeDivide = (x, y) => {
    if(y === 0) return 0;
    return x/y;
};

exports.calculateFieldsFor = (x) => {

    const hours = x.evtoi / 3600;

    x.cf60 = safeDivide(x.cf, hours);
    x.ca60 = safeDivide(x.ca, hours);
    x.cfpct = safeDivide(x.cf, x.cf + x.ca) * PCT_MULTIPLIER;
    x.dff60 = safeDivide(x.dff, hours);
    x.dfa60 = safeDivide(x.dfa, hours);
    x.dffpct = safeDivide(x.dff, x.dff + x.dfa) * PCT_MULTIPLIER;
    x.gf60 = safeDivide(x.gf, hours);
    x.ga60 = safeDivide(x.ga, hours);
    x.gfpct = safeDivide(x.gf, x.gf + x.ga) * PCT_MULTIPLIER;
    x.sf60 = safeDivide(x.sf, hours);
    x.sa60 = safeDivide(x.sa, hours);
    x.sfpct = safeDivide(x.sf, x.sf + x.sa) * PCT_MULTIPLIER;
    x.ff60 = safeDivide(x.ff, hours);
    x.fa60 = safeDivide(x.fa, hours);
    x.ffpct = safeDivide(x.ff, x.ff + x.fa) * PCT_MULTIPLIER;
    x.sacf60 = safeDivide(x.sacf, hours);
    x.saca60 = safeDivide(x.saca, hours);
    x.sacfpct = safeDivide(x.sacf, x.sacf + x.saca) * PCT_MULTIPLIER;
};