'use strict';

let _ = require('lodash');
let should = require('should');
let constants = require('../../../../common/constants');
let ServiceLocator = require('../../../../common/service_locator');
let InMemoryCache = require('../../../../common/in_memory_cache');
let WoodmoneyQuery = require('../../../../modules/stats/woodmoney');

let oilers_20172018_data = require('../../../data/oilers_20172018');

describe('woodmoney query tests', function() {

    let locator = new ServiceLocator();

    let request_count = 0;
    let mock_queries = {
        season_woodmoney : function() {
            return function (options) {
                request_count++;
                return Promise.resolve(oilers_20172018_data);
            }
        }
    };

    beforeEach(() => {
        request_count = 0;
    });

    before(() => {
        locator.register('mongoose', {});
        locator.register('config', { api : { host : 'http://testenv'}});
        locator.register('player_cache', {
            all : function(){
                let players = _.keyBy(oilers_20172018_data, x => x.player_id);
                return Promise.resolve(players);
            }
        })
    });

    describe("exec tests", function(){

        it('will get top 5 dman vs elite tier2', function(done) {

            let options = {
                positions: 'd',
                count: 5,
                tier: constants.woodmoney_tier.elite,
                season: 20172018
            };

            let query = new WoodmoneyQuery(locator, {queries: mock_queries});
            query.exec(options).then((results) => {
                (results.length).should.equal(5);
                // _.each(results, x => {
                //    console.log(x.name, x.player_id, x.evtoi);
                // });
                (results[0].player_id).should.equal(8477498);
                (results[0].evtoi).should.equal(537.1333333333333);
                return done();

            }, (err) => {
                should.fail('this should not be called');
                return done();
            });

        });

        it('will get top 5 players', function(done) {

            let options = {
                positions: 'all',
                count: 5,
                tier: null
            };

            let query = new WoodmoneyQuery(locator, {queries: mock_queries});
            query.exec(options).then((results) => {

                (results.length).should.equal(20);
                _.each(results, x => {
                    console.log(x.name, x.player_id, x.evtoi);
                });
                (results[0].player_id).should.equal(8477498); //Nurse again...?
                (results[0].evtoi).should.equal(1543.2666666666667);
                return done();
            }, (err) => {
                should.fail('this should not be called');
                return done();
            });

        });

        it('will 2nd page of players by cf', function(done) {

            let options = {
                positions: 'all',
                count: 5,
                tier: null,
                offset: 5,
                sort: 'cfpct'
            };

            let query = new WoodmoneyQuery(locator, {queries: mock_queries});
            query.exec(options).then((results) => {

                (results.length).should.equal(20);
                _.each(results, x => {
                    console.log(x.name, x.player_id, x.evtoi, x.cfpct);
                });
                (results[0].player_id).should.equal(8479483); //Auvitu
                (results[0].cfpct).should.equal(52.4);
                return done();
            }, (err) => {
                should.fail('this should not be called');
                return done();
            });

        });

        it('will only get as many results as there are players', function(done) {

            let options = {
                positions: 'd',
                count: 50,
                tier: constants.woodmoney_tier.elite,
                sort : 'evtoi',
                sort_direction : 'desc'
            };

            let query = new WoodmoneyQuery(locator, {queries: mock_queries});
            query.exec(options).then((results) => {
                (results.length).should.equal(11);
                return done();
            }, (err) => {
                should.fail('this should not be called');
                return done();
            });

        });

        it('will sort results descending', function(done) {

            let options = {
                positions: 'd',
                count: 50,
                tier: constants.woodmoney_tier.elite,
                sort : 'evtoi',
                sort_direction : 'desc'
            };

            let query = new WoodmoneyQuery(locator, {queries: mock_queries});
            query.exec(options).then((results) => {
                (results.length).should.equal(11);
                let last = Number.MAX_VALUE;
                for(var i=0; i< results.length; i++){
                    (results[i][options.sort]).should.be.belowOrEqual(last);
                    last = results[i][options.sort];
                }
                return done();
            }, (err) => {
                should.fail('this should not be called');
                return done();
            });

        });

        it('will sort results ascending', function(done) {

            let options = {
                positions: 'd',
                count: 50,
                tier: constants.woodmoney_tier.elite,
                sort : 'evtoi',
                sort_direction : 'asc'
            };

            let query = new WoodmoneyQuery(locator, {queries: mock_queries});
            query.exec(options).then((results) => {
                (results.length).should.equal(11);
                let last = 0;
                for(var i=0; i< results.length; i++){
                    (results[i][options.sort]).should.be.aboveOrEqual(last);
                    last = results[i][options.sort];
                }
                return done();
            }, (err) => {
                should.fail('this should not be called');
                return done();
            });

        });

        it('will cache results', function(done) {

            let options = {
                positions: 'd',
                count: 50,
                tier: constants.woodmoney_tier.elite
            };

            let cache = new InMemoryCache();

            let query = new WoodmoneyQuery(locator, {queries: mock_queries, cache: cache});
            let query2 = new WoodmoneyQuery(locator, {queries: mock_queries, cache: cache});

            query.exec(options).then((results) => {
                (request_count).should.equal(1);
                query2.exec(options).then((results) => {
                    (request_count).should.equal(1);
                    return done();
                });
            }, (err) => {
                should.fail('this should not be called');
                return done();
            });

        });

        it('will wont cache player results', function(done) {

            let options = {
                positions: 'd',
                count: 50,
                tier: constants.woodmoney_tier.elite,
                player : 8479483
            };

            let cache = new InMemoryCache();

            let query = new WoodmoneyQuery(locator, {queries: mock_queries, cache: cache});

            query.exec(options).then((results) => {
                (request_count).should.equal(1);
                (_.keys(cache.data).length).should.equal(0);
                done();
            }, (err) => {
                should.fail('this should not be called');
                return done();
            });

        });

    });

    describe('validation tests', function() {

        it('will get top 5 dman vs elite tier2', function(done) {

            let options = {
                positions: 'dx',
                count: 5,
                tier: constants.woodmoney_tier.elite,
                season: 20172018
            };

            let query = new WoodmoneyQuery(locator, {queries: mock_queries});
            query.exec(options).then((results) => {
                should.fail('this should not be called');
                return done();
            }, (err) => {
                (err.type).should.equal(constants.exceptions.invalid_argument);
                return done();
            });

        });

    });

});
