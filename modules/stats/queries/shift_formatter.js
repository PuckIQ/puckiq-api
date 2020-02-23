"use strict";

const _ = require('lodash');
const constants = require('../../../common/constants');

const shift_types = _.keys(constants.shift_types);

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

        let shifts = {};
        _.each(shift_types, st => {
            shifts[st] = {shifts: 0, gf: 0, ga: 0, cf: 0, ca: 0, toi: 0};
        });

        _.each(item.results, s => {
            res.total_shifts += s.total_shifts;
            _.each(shift_types, st => {
                shifts[st][`shifts`] += s[`${st}_shifts`];
                shifts[st][`gf`] += s[`${st}_gf`];
                shifts[st][`ga`] += s[`${st}_ga`];
                shifts[st][`cf`] += s[`${st}_cf`];
                shifts[st][`ca`] += s[`${st}_ca`];
                shifts[st][`toi`] += (s[`${st}_shifts`] * s[`${st}_avgshift`]);
            });
        });

        _.each(shift_types, st => {
            shifts[st][`avgshift`] = shifts[st][`toi`] ? shifts[st][`shifts`] / shifts[st][`toi`] : 0;
            results.push(_.extend({}, res, {shift_type: st}, shifts[st]));
        });

    });

    return results;

};