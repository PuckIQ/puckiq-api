'use strict';

let _ = require('lodash');
let should = require('should');
let constants = require('../../../../../common/constants');
let formatter = require('../../../../../modules/stats/queries/woodwowy_formatter');

const mcdavid_drai_wowy = require('../../../../data/woodwowy/97_29_season_20172018');

describe('formatBulk tests', function() {

    it('will get results for mcdavid and drai', function() {

        let player_dict = {
            '8478402' : {
                player_id : 8478402,
                season: 20172018,
                name : 'Connor McDavid'
            },
            '8477934' : {
                player_id : 8477934,
                season: 20172018,
                name : 'Leon Draisatl'
            },
            '8477498' : {
                player_id : 8477498,
                season: 20172018,
                name : 'Darnell Nurse'
            },
        };

        let formatted = formatter.formatBulk(mcdavid_drai_wowy, player_dict, false);

        formatted = _.orderBy(formatted, ['season', 'tier_sort_index','recordtype'], ['desc', 'asc', 'asc']);

        _.each(formatted, x => {
            console.log(`${x.onoff},${x.wowytype},${x.woodmoneytier},${x.recordtype}`);
        });

        (formatted.length).should.equal(18);

        // let keyed = _.keyBy(formatted, 'woodmoneytier');
        //
        // should.exist(keyed.All);
        //
        // let all = keyed.All;
        //
        // (10.776).should.equal(Math.round(all.onshpct*1000)/1000);
        // (90.456).should.equal(Math.round(all.onsvpct*1000)/1000);
        // (1012).should.equal(all.pdo);
    });

});