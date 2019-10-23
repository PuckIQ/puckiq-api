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

exports.format = (result, player_1_info, player_2_info, is_range_query) => {

    const inverse_gametype_of = (gt) => {
        return gt === constants.on_off.off_ice ?
            constants.on_off.on_ice :
            constants.on_off.off_ice;
    };

    return _.chain(result.woodwowy).map((item) => {

        if(!(item.onoff === constants.on_off.on_ice || (
            item.onoff === constants.on_off.off_ice && item.recordtype === constants.wowy_record_type.one_and_two))) {
            //these records are redundant
            return null;
        }

        // console.log(`${item.onoff},${item.woodmoneytier},${item.recordtype}`);
        let inverse = _.find(result.woodwowy, x => {
            let match = (item.onoff === inverse_gametype_of(x.onoff) &&
                item.wowytype === x.wowytype &&
                item.recordtype === x.recordtype &&
                item.woodmoneytier === x.woodmoneytier);
            // console.log(`\t${x.onoff},${x.woodmoneytier},${x.recordtype},${match}`);
            return match;
        });

        if (!inverse) {
            console.log("\tdata issue.... (missing inverse)");
            console.log(`\t${item.onoff},${item.woodmoneytier},${item.recordtype}`);
            return null;
        }

        if (is_range_query) {
            calculator.calculateFieldsFor(item);
            calculator.calculateFieldsFor(inverse);
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