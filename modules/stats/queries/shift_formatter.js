"use strict";

const _ = require('lodash');
const constants = require('../../../common/constants');

const shift_types = _.keys(constants.shift_type);
const base_shift = {shifts: 0, gf: 0, ga: 0, cf: 0, ca: 0, dff:0, dfa: 0, toi: 0};

exports.formatBulk = (data, player_dict) => {

    let results = [];
    _.each(data, (item) => {

        let res = {_id: item._id};

        // till we get a real nhlplayers collection
        if (_.has(player_dict, item._id.player_id)) {
            res.name = player_dict[item._id.player_id].name;
            res.positions = player_dict[item._id.player_id].positions;
        } else {
            console.log("cannot find player", result._id.player_id);
            res.name = 'unknown';
            res.positions = ['?'];
        }

        res.total_shifts = 0;

        let shifts = {all: _.extend({ shift_pct : 100 }, base_shift)};
        _.each(shift_types, st => {
            shifts[st] = _.extend({}, base_shift);
        });

        _.each(item.results, s => {
            res.total_shifts += s.total_shifts;
            _.each(shift_types, st => {
                shifts[st][`shifts`] += s[`${st}_shifts`];
                shifts[st][`gf`] += s[`${st}_gf`];
                shifts[st][`ga`] += s[`${st}_ga`];
                shifts[st][`cf`] += s[`${st}_cf`];
                shifts[st][`ca`] += s[`${st}_ca`];
                shifts[st][`dff`] += s[`${st}_dff`];
                shifts[st][`dfa`] += s[`${st}_dfa`];
                shifts[st][`toi`] += (s[`${st}_shifts`] * s[`${st}_avgshift`])/60;
                shifts.all[`shifts`] += s[`${st}_shifts`];
                shifts.all[`gf`] += s[`${st}_gf`];
                shifts.all[`ga`] += s[`${st}_ga`];
                shifts.all[`cf`] += s[`${st}_cf`];
                shifts.all[`ca`] += s[`${st}_ca`];
                shifts.all[`dff`] += s[`${st}_dff`];
                shifts.all[`dfa`] += s[`${st}_dfa`];
                shifts.all[`toi`] += (s[`${st}_shifts`] * s[`${st}_avgshift`])/60;
            });
        });

        if(shifts.all.shifts > 0) {
            shifts.all[`gf_pct`] = (shifts.all.gf/(shifts.all.gf + shifts.all.ga))*100;
            shifts.all[`cf_pct`] = (shifts.all.cf/(shifts.all.cf + shifts.all.ca))*100;
            shifts.all[`dff_pct`] = (shifts.all.dff/((shifts.all.dff + shifts.all.dfa) || 1))*100;
        }

        _.each(shift_types, st => {

            shifts[st][`avgshift`] = shifts[st][`shifts`] ? shifts[st][`toi`] / shifts[st][`shifts`] : 0;
            shifts[st][`shift_pct`] = shifts.all[`shifts`] ? (shifts[st][`shifts`] / shifts.all[`shifts`] * 100) : 0;
            shifts[st][`gf_pct`] = (shifts[st][`gf`] / ((shifts[st][`gf`] + shifts[st][`ga`]) || 1))*100;
            shifts[st][`cf_pct`] = (shifts[st][`cf`] / ((shifts[st][`cf`] + shifts[st][`ca`]) || 1))*100;
            shifts[st][`dff_pct`] = (shifts[st][`dff`] / ((shifts[st][`dff`] + shifts[st][`dfa`]) || 1))*100;

            results.push(_.extend({}, res, {shift_type: st}, shifts[st]));
        });

        shifts.all[`avgshift`] = shifts.all[`shifts`] ? shifts.all[`toi`] / shifts.all[`shifts`] : 0;
        results.push(_.extend({}, res, {shift_type: 'all'}, shifts.all));
    });

    return results;

};