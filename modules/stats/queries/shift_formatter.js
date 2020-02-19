"use strict";

const _ = require('lodash');

const shift_types = ["ostart","nstart","dstart","otf", "pureotf"];

exports.formatBulk = (data, player_dict) => {

    return _.map(data, (item) => {

        let res = { _id : item._id };

        // till we get a real nhlplayers collection
        if(_.has(player_dict, item._id.player_id)) {
            res.name = player_dict[item._id.player_id].name;
            res.positions = player_dict[item._id.player_id].positions;
        } else {
            console.log("cannot find player", result._id.player_id);
            res.name = 'unknown';
            res.positions = ['?'];
        }

        if(item.results > 0) {
            _.each(item.results, s => {
                res.total_shifts += (res.total_shifts || 0) + s.total_shifts;
                _.each(shift_types, st => {
                    res[`${st}_shifts`] += (res[`${st}_shifts`] || 0) + s[`${st}_shifts`];
                    res[`${st}_gf`] +=  (res[`${st}_gf`] || 0) + s[`${st}_gf`];
                    res[`${st}_ga`] +=  (res[`${st}_ga`] || 0) + s[`${st}_ga`];
                    res[`${st}_cf`] +=  (res[`${st}_cf`] || 0) + s[`${st}_cf`];
                    res[`${st}_ca`] +=  (res[`${st}_ca`] || 0) + s[`${st}_ca`];
                    res[`${st}_toi`] += (res[`${st}_toi`] || 0) + (s[`{$st}_shifts`] * s[`${st}_avgshift`]);
                });
            });

            _.each(shift_types, st => {
                res[`${st}_avgshift`] = res[`${st}_toi`] ? res[`${st}_shifts`] / res[`${st}_toi`] : 0;
            });

            res = _.extend(res, shift);
        } else {
            res = _.extend(res, item.results[0]);
        }

        delete item.results;
        return res;
    });

};