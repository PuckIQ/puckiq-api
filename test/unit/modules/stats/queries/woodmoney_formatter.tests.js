'use strict';

let _ = require('lodash');
let should = require('should');
let constants = require('../../../../../common/constants');
let WoodmoneyFormatter = require('../../../../../modules/stats/queries/woodmoney_formatter');

const mcdavid_20182019 = require('../../../../data/woodmoney/mcdavid_20182019');
const taylor_hall_by_player = require('../../../../data/woodmoney/taylor_hall_by_player');
const taylor_hall_by_player_season = require('../../../../data/woodmoney/taylor_hall_by_player_season');
const taylor_hall_by_player_season_team = require('../../../../data/woodmoney/taylor_hall_by_player_season_team');
const taylor_hall_by_player_team = require('../../../../data/woodmoney/taylor_hall_by_player_team');

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

    describe('flattenWoodmoneyIntoTiers tests - Taylor Hall', function(){

        it('will get by player', function(){

            let data = taylor_hall_by_player;

            // preconditions - 1 Taylor Hall
            (data.length).should.equal(1);

            //7 seasons x 4 tiers * on/off
            //we dont have woodmoney until 201415
            (data[0].woodmoney.length).should.equal(7*4*2);

            let on_all_cf = 0;
            _.each(data[0].woodmoney, (rec) => {
                if(rec.woodmoneytier === constants.woodmoney_tier.all && rec.onoff === constants.on_off.on_ice){
                    on_all_cf += rec.cf;
                }
            });

            let formatted = WoodmoneyFormatter.flattenWoodmoneyIntoTiers(data, constants.group_by.player);

            // assertions
            (formatted.length).should.equal(1);
            (formatted[0].woodmoney.length).should.equal(8); //1 per tier * each on/of

            let all_on = _.find(formatted[0].woodmoney, x => {
                return x.woodmoneytier === constants.woodmoney_tier.all &&
                    x.onoff === constants.on_off.on_ice;
            });

            should.exist(all_on);
            (all_on.cf).should.equal(on_all_cf);
            (all_on.games_played).should.equal(350);
        });

        it('will get by player/team', function(){

            let data = taylor_hall_by_player_team;

            // preconditions - 1 per team
            (data.length).should.equal(3);

            //7 seasons x 4 tiers * on/off
            //we dont have woodmoney until 201415

            (data[0].woodmoney.length +  data[1].woodmoney.length + data[2].woodmoney.length).should.equal(7*4*2);

            let devils_before = _.find(data, x => x._id.team ==='NJD');
            let on_all_cf = 0;
            _.each(devils_before.woodmoney, (rec) => {
                if(rec.woodmoneytier === constants.woodmoney_tier.all && rec.onoff === constants.on_off.on_ice){
                    on_all_cf += rec.cf;
                }
            });

            let formatted = WoodmoneyFormatter.flattenWoodmoneyIntoTiers(data, constants.group_by.player);

            // assertions
            (formatted.length).should.equal(3);
            _.each(formatted, x => {
                (x.woodmoney.length).should.equal(8);
            });

            let devils_after = _.find(formatted, x => x._id.team ==='NJD');

            should.exist(devils_after);

            let all_on = _.find(devils_after.woodmoney, x => {
                return x.woodmoneytier === constants.woodmoney_tier.all &&
                    x.onoff === constants.on_off.on_ice;
            });

            should.exist(all_on);
            (all_on.cf).should.equal(on_all_cf);
            (all_on.games_played).should.equal(211);
        });


        it('will get by player/team and calc relcomp', function(){

            const data = taylor_hall_by_player_team;
            const player_dict = {
                '8475791': { name: "Taylor Hall", positions: ['LW'] }
            };

            // preconditions - 1 per team
            (data.length).should.equal(3);

            //7 seasons x 4 tiers * on/off
            //we dont have woodmoney until 201415
            (data[0].woodmoney.length +  data[1].woodmoney.length + data[2].woodmoney.length).should.equal(7*4*2);

            let devils_before = _.find(data, x => x._id.team ==='NJD');
            let on_all_cf = 0;
            _.each(devils_before.woodmoney, (rec) => {
                if(rec.woodmoneytier === constants.woodmoney_tier.all && rec.onoff === constants.on_off.on_ice){
                    on_all_cf += rec.cf;
                }
            });

            let formatted = WoodmoneyFormatter.flattenWoodmoneyIntoTiers(data, constants.group_by.player);

            // assertions 1
            (formatted.length).should.equal(3);
            _.each(formatted, x => {
                (x.woodmoney.length).should.equal(8);
            });

            formatted = WoodmoneyFormatter.formatBulk(formatted, player_dict, false);

            // assertions 2
            (formatted.length).should.equal(12);

            let all_on = _.find(formatted, x => x.team ==='NJD' && x.woodmoneytier === constants.woodmoney_tier.all);
            should.exist(all_on);
            (all_on.ctoipct).should.equal(100);
            (all_on.cf).should.equal(on_all_cf);
            (all_on.games_played).should.equal(211);
        });

    });

});
