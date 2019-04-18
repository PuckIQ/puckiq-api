'use strict';

let _ = require('lodash');
let should = require('should');
let constants = require('../../../../../common/constants');
let WoodmoneyFormatter = require('../../../../../modules/stats/queries/woodmoney_formatter');

let mcdavid_20182019 = require('../../../../data/mcdavid_20182019');

describe('woodmoney formatter tests', function() {

    it('will calculate onsvpct onshpct and pdo for All', function() {

        //"gf": 75,
        //"ga": 69,
        //"sa": 723,
        //"sf": 696,

        let player_info = {
            _id : {
                player_id : 8478402,
                season: 20182019
            }
        };

        let woodmoney = [{
            wowytype: constants.wowy_type.woodmoney,
            woodmoneytier : constants.woodmoney_tier.all,
            onoff : constants.on_off.off_ice
        }].concat(mcdavid_20182019);

        let formatted = WoodmoneyFormatter.format({ woodmoney }, player_info, 1298);

        (formatted.length).should.equal(1);

        let keyed = _.keyBy(formatted, 'woodmoneytier');

        should.exist(keyed.All);

        let all = keyed.All;

        (10.776).should.equal(Math.round(all.onshpct*1000)/1000);
        (90.456).should.equal(Math.round(all.onsvpct*1000)/1000);
        (1012).should.equal(all.pdo);
    });

});
