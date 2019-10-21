'use strict';

let _ = require('lodash');
let should = require('should');
let constants = require('../../../../../common/constants');
let formatter = require('../../../../../modules/stats/queries/woodwowy_formatter');

const mcdavid_drai_wowy = require('../../../../data/woodwowy/97_29_season_20172018');

describe('woodwowy formatBulk tests', function() {

    it('will get results for mcdavid and drai', function () {

        let player_dict = {
            '8478402': {
                player_id: 8478402,
                season: 20172018,
                name: 'Connor McDavid'
            },
            '8477934': {
                player_id: 8477934,
                season: 20172018,
                name: 'Leon Draisatl'
            },
            '8477498': {
                player_id: 8477498,
                season: 20172018,
                name: 'Darnell Nurse'
            },
        };

        let formatted = formatter.formatBulk(mcdavid_drai_wowy, player_dict, false);

        (formatted.length).should.equal(12);

        formatted = _.orderBy(formatted, ['season', 'tier_sort_index', 'recordtype'], ['desc', 'asc', 'asc']);

        // _.each(formatted, x => {
        //     console.log(`${x.onoff},${x.wowytype},${x.woodmoneytier},${x.recordtype}`);
        // });

        _.each(formatted, x => x.player1._id.should.equal(8478402));
        _.each(formatted, x => x.player2._id.should.equal(8477934));
        _.each(formatted, x => x.wowytype.should.equal(constants.wowy_type.woodwowy));

        (_.filter(formatted, x => x.recordtype === constants.wowy_record_type.one_and_two).length.should.equal(6));
        (_.filter(formatted, x => x.recordtype === constants.wowy_record_type.one_not_two).length.should.equal(3));
        (_.filter(formatted, x => x.recordtype === constants.wowy_record_type.two_not_one).length.should.equal(3));

        (_.filter(formatted, x => x.woodmoneytier === constants.woodmoney_tier.elite).length.should.equal(4));
        (_.filter(formatted, x => x.woodmoneytier === constants.woodmoney_tier.middle).length.should.equal(4));
        (_.filter(formatted, x => x.woodmoneytier === constants.woodmoney_tier.gritensity).length.should.equal(4));

        //assume calculator still does its job

    });

});