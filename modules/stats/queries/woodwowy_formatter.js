const _ = require('lodash');
const constants = require('../../../common/constants');
const calculator = require('./calculator');
const woodmoney_tier_sort = constants.woodmoney_tier_sort;

exports.formatBulk = (data, player_dict, is_range_query) => {

    let results = _.chain(data).map(result => {

        let player_1_info = {
            _id: result._id.player_1_id,
            name: 'unknown',
            positions: ['?']
        };

        let player_2_info = {
            _id: result._id.player_2_id,
            name : 'unknown',
            positions : ['?']
        };

        // y.evtoi = y.evtoi/60;// convert to minutes
        // till we get a real nhlplayers collection
        if(_.has(player_dict, result._id.player_1_id)) {
            player_1_info.name = player_dict[result._id.player_1_id].name;
            player_1_info.positions = player_dict[result._id.player_1_id].positions;
        } else {
            console.log("cannot find player 1", result._id.player_1_id);
        }

        if(_.has(player_dict, result._id.player_2_id)) {
            player_2_info.name = player_dict[result._id.player_2_id].name;
            player_2_info.positions = player_dict[result._id.player_2_id].positions;
        } else {
            console.log("cannot find player 2", result._id.player_2_id);
        }

        //returns one record per tier
        return this.format(result, player_1_info, player_2_info, is_range_query);

    }).flatten().value();

    return results;
};

const _tiers = [constants.woodmoney_tier.elite,constants.woodmoney_tier.middle,constants.woodmoney_tier.gritensity];

exports.format = (result, player_1_info, player_2_info, is_range_query) => {

    let tier_aggregates = {};
    _.each(_tiers, x =>  tier_aggregates[x] = null);

    _.each(result.woodwowy, (item) => {

        if(!(item.onoff === constants.on_off.on_ice || (
            item.onoff === constants.on_off.off_ice && item.recordtype === constants.wowy_record_type.one_and_two))) {
            //these records are redundant
            return;
        }

        if(item.onoff === constants.on_off.off_ice) return;

        if(!tier_aggregates[item.woodmoneytier]) {
            // if(item.woodmoneytier === 'Elite') console.log("init", item.woodmoneytier, item.wowytype, item.recordtype, item.evtoi, item.cf);
            tier_aggregates[item.woodmoneytier] = _.extend({}, item);
        } else {
            // if(item.woodmoneytier === 'Elite') console.log("append", item.woodmoneytier, item.wowytype, item.recordtype, item.evtoi, item.cf);
            calculator.combineWowyRecord(tier_aggregates[item.woodmoneytier], item);
        }
    });

    _.each(_tiers, x =>  calculator.calculateFieldsFor(tier_aggregates[x]));

    return _.chain(result.woodwowy).map((item) => {

        if(!(item.onoff === constants.on_off.on_ice || (
            item.onoff === constants.on_off.off_ice && item.recordtype === constants.wowy_record_type.one_and_two))) {
            //these records are redundant
            return null;
        }

        let inverse = tier_aggregates[item.woodmoneytier];

        if (!inverse) {
            console.log("\tdata issue.... (missing inverse)");
            console.log(`\t${item.onoff},${item.woodmoneytier},${item.recordtype}`);
            return null;
        }

        if (is_range_query) {
            calculator.calculateFieldsFor(item);
        }

        let rel_comp_stats = {
            'onshpct': (1 - (item.sf - item.gf) / (item.sf || 1)) * 100,
            'onsvpct': (item.sa - item.ga) / (item.sa || 1) * 100,
            'ozspct': (item.oz / ((item.oz + item.dz) || 1)) * 100,
            'fo60': (item.oz + item.nz + item.dz) / (item.evtoi || 1) * 3600,
            // 'ctoipct': (item.evtoi / (all_toi || 1)) * 100,
            'cf60rc': item.cf60 - inverse.cf60,
            'ca60rc': item.ca60 - inverse.ca60,
            'cfpctrc': item.cfpct - inverse.cfpct,
            'cfpctra': 0, //TODO
            'dff60rc': item.dff60 - inverse.dff60,
            'dfa60rc': item.dfa60 - inverse.dfa60,
            'dffpctrc': item.dffpct - inverse.dffpct,
            'dffpctra': 0, //TODO
        };

        rel_comp_stats.pdo = Math.round((rel_comp_stats.onshpct * 10) + (rel_comp_stats.onsvpct * 10));

        let formatted_data = {
            evtoi: item.evtoi / 60,
            description : this._getDescriptionFor(item, player_1_info, player_2_info)
        };

        item.tier_sort_index = woodmoney_tier_sort[item.woodmoneytier];

        delete result._id.player_1_id;
        delete result._id.player_2_id;

        return _.extend({
            player1 : player_1_info,
            player2 : player_2_info
        }, result._id, rel_comp_stats, item, formatted_data);

    }).compact().value();

};

exports._getDescriptionFor = (result, player1, player2) => {

    if(result.recordtype === constants.wowy_record_type.one_and_two){
        if(result.onoff === constants.on_off.on_ice) {
            return `${player1.name} with ${player2.name}`;
        } else {
            return `${player1.name} and ${player2.name} both off`;
        }
    } else if (result.recordtype === constants.wowy_record_type.one_not_two) {
        return `${player1.name} without ${player2.name}`;
    } else if(result.recordtype === constants.wowy_record_type.two_not_one) {
        return `${player2.name} without ${player1.name}`;
    } else {
        return 'unknown';
    }

};