const _ = require('lodash');
const constants = require('../../../common/constants');
const woodmoney_tier_sort = constants.woodmoney_tier_sort;

exports.format = (x, player_info, all_toi) => {

    return _.chain(x.woodmoney).map((y) => {

        if (y.onoff === constants.on_off.off_ice) return null;

        let off = _.find(x.woodmoney, z => {
            return z.onoff === constants.on_off.off_ice && y.wowytype === z.wowytype && y.woodmoneytier === z.woodmoneytier;
        });

        if (!off) {
            console.log("data issue.... (missing off)");
            return null;
        }

        let rel_comp_stats = {
            'onshpct': (1 - (y.sf - y.gf) / (y.sf || 1)) * 100,
            'onsvpct': (y.sa - y.ga) / (y.sa || 1)*100,
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
            'dffpctra': 0 //TODO
        };

        rel_comp_stats.pdo = Math.round((rel_comp_stats.onshpct * 10) + (rel_comp_stats.onsvpct * 10));

        let formatted_data = {
            evtoi: y.evtoi / 60
        };

        y.tier_sort_index = woodmoney_tier_sort[y.woodmoneytier];

        return _.extend({}, x._id, player_info, rel_comp_stats, y, formatted_data);

    }).compact().value();

};