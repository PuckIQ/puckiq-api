"use strict";

const _ = require('lodash');
const constants = require('../../../common/constants');

const shift_types = _.keys(constants.shift_type);
const base_shift = {
    toi: 0, shifts: 0,
    gf: 0, ga: 0, gf60: 0, ga60: 0,
    cf: 0, ca: 0, cf60: 0, ca60: 0,
    dff:0, dfa: 0, dff60: 0, dfa60: 0
};

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
                const toi = (s[`${st}_shifts`] * s[`${st}_avgshift`])/60;

                shifts[st][`shifts`] += s[`${st}_shifts`];
                shifts[st][`gf`] += s[`${st}_gf`];
                shifts[st][`ga`] += s[`${st}_ga`];
                shifts[st][`cf`] += s[`${st}_cf`];
                shifts[st][`ca`] += s[`${st}_ca`];
                shifts[st][`dff`] += s[`${st}_dff`];
                shifts[st][`dfa`] += s[`${st}_dfa`];
                shifts[st][`toi`] += toi;

                shifts.all[`shifts`] += s[`${st}_shifts`];
                shifts.all[`gf`] += s[`${st}_gf`];
                shifts.all[`ga`] += s[`${st}_ga`];
                shifts.all[`cf`] += s[`${st}_cf`];
                shifts.all[`ca`] += s[`${st}_ca`];
                shifts.all[`dff`] += s[`${st}_dff`];
                shifts.all[`dfa`] += s[`${st}_dfa`];
                shifts.all[`toi`] += toi;
            });
        });

        if(shifts.all.shifts > 0) {
            this.calculateFieldsFor(shifts.all);
        }

        _.each(shift_types, st => {
            this.calculateFieldsFor(shifts[st]);
            shifts[st][`shift_pct`] = shifts.all[`shifts`] ? (shifts[st][`shifts`] / shifts.all[`shifts`] * 100) : 0;
            results.push(_.extend({}, res, {shift_type: st}, shifts[st]));
        });

        results.push(_.extend({}, res, {shift_type: 'all'}, shifts.all));
    });

    return results;

};

exports.formatTeamBulk = (data) => {

    data = _.map(data, row => {

        let item = _.extend({}, base_shift, row);

        item._id = { team : row.team, season: row.season };

        item.shift_type = item.shifttype;
        delete item.shifttype;

        item.toi = item.toi/60; //toi is in minutes for other shift data

        this.calculateFieldsFor(item);

        return item;
    });

    let keyed = _.groupBy(data, x => `${x.team}-${x.season}`);

    _.each(_.keys(keyed), (key) => {
        let all = this.buildAllFrom(keyed[key]);
         keyed[key].push(all);
    });

    return _.flatten(_.values(keyed));

};

exports.buildAllFrom = (items) => {

    if(!items.length) {
        console.log("Data issue.. no records?");
        return null;
    }

    let all = _.extend({
        _id: { team: items[0].team, season: items[0].season },
        team: items[0].team,
        season: items[0].season,
        shift_type: 'all',
        shift_pct : 100}, base_shift);

    _.each(items, item => {
        all.shifts += item.shifts;
        all.gf += item.gf;
        all.ga += item.ga;
        all.cf += item.cf;
        all.ca += item.ca;
        all.dff += item.dff;
        all.dfa += item.dfa;
        all.toi += item.toi;
    });

    _.each(items, item => {
        item.shift_pct = all.shifts ? (item.shifts / all.shifts * 100) : 0;
    });

    this.calculateFieldsFor(all);

    return all;
};

exports.calculateFieldsFor = (item) => {

    item.avgshift = item.shifts ? item.toi / item.shifts * 60 : 0;
    item.gf_pct = (item.gf / ((item.gf + item.ga) || 1))*100;
    item.cf_pct = (item.cf / ((item.cf + item.ca) || 1))*100;
    item.dff_pct = (item.dff / ((item.dff + item.dfa) || 1))*100;

    const hours = item.toi / 60;
    if(hours > 0) {
        item.gf60 = item.gf/hours;
        item.ga60 = item.ga/hours;
        item.cf60 = item.cf/hours;
        item.ca60 = item.ca/hours;
        item.dff60 = item.dff/hours;
        item.dfa60 = item.dfa/hours;
    }

};
