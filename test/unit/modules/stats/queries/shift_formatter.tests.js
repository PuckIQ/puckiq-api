'use strict';

let _ = require('lodash');
let should = require('should');
let constants = require('../../../../../common/constants');
let ShiftFormatter = require('../../../../../modules/stats/queries/shift_formatter');

describe("shift formatter tests", () => {

    describe("formatTeamBulk tests", () => {

        it("will format oilers", () => {

            let data = [
                {
                    "season": 20192020,
                    "team": "EDM",
                    "shifts": 3419,
                    "ca": 2756,
                    "cf": 2511,
                    "shifttype": "nstart",
                    "gf": 111,
                    "toi": 193266,
                    "ga": 119,
                    "dff": 2069.6,
                    "dfa": 1854.4
                },
                {
                    "season": 20192020,
                    "team": "EDM",
                    "shifts": 2221,
                    "ca": 2299,
                    "cf": 1176,
                    "shifttype": "dstart",
                    "gf": 62,
                    "toi": 108550,
                    "ga": 91,
                    "dff": 971.6,
                    "dfa": 1587.7999999999997
                },
                {
                    "season": 20192020,
                    "team": "EDM",
                    "shifts": 2458,
                    "ca": 1399,
                    "cf": 2026,
                    "shifttype": "ostart",
                    "gf": 103,
                    "toi": 120591,
                    "ga": 82,
                    "dff": 1496.3000000000004,
                    "dfa": 1068.1999999999998
                },
                {
                    "season": 20192020,
                    "team": "EDM",
                    "shifts": 11645,
                    "ca": 9334,
                    "cf": 8755,
                    "shifttype": "otf",
                    "gf": 422,
                    "toi": 596204,
                    "ga": 470,
                    "dff": 6852.0999999999985,
                    "dfa": 7189.799999999999
                }
            ];

            let gf = _.sumBy(data, 'gf');
            let ga = _.sumBy(data, 'ga');
            let toi = _.sumBy(data, 'toi');
            let shifts = _.sumBy(data, 'shifts');

            let result = ShiftFormatter.formatTeamBulk(data);

            (result.length).should.equal(5);

            let by_shift_type = _.keyBy(result, 'shift_type');
            (by_shift_type.all._id.season).should.equal(20192020);
            (by_shift_type.all._id.team).should.equal('EDM');
            (by_shift_type.all.gf).should.equal(gf);
            (by_shift_type.all.ga).should.equal(ga);
            (by_shift_type.all.shifts).should.equal(shifts);
            (by_shift_type.all.gf_pct).should.equal((gf/(ga+gf))*100);
            (Math.round(by_shift_type.all.gf60, 4)).should.equal(Math.round(gf/toi*60*60, 4));

            (by_shift_type.otf._id.season).should.equal(20192020);
            (by_shift_type.otf._id.team).should.equal('EDM');
            (by_shift_type.otf.shift_pct).should.equal(by_shift_type.otf.shifts/by_shift_type.all.shifts*100);
            (by_shift_type.otf.avgshift).should.equal(by_shift_type.otf.toi/by_shift_type.otf.shifts);
            (by_shift_type.otf.gf60).should.equal(by_shift_type.otf.gf/by_shift_type.otf.toi*60);
        });

    });

});

