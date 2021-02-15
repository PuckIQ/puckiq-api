'use strict';

const _ = require('lodash');
const should = require('should');
const ServiceLocator = require('../../../../common/service_locator');
const PlayerCache = require('../../../../modules/players/player_cache');

describe('player cache tests', function() {

    let locator = new ServiceLocator();

    let request_count = 0;
    let mock_queries = {
        all_players : function() {
            return function (options) {
                request_count++;
                return Promise.resolve([
                    { playerid: 1, name: 'lolo'},
                    {playerid:2, name:'lulu'}
                ]);
            }
        }
    };

    beforeEach(() => {
        request_count = 0;
    });

    before(() => {
        locator.register('mongoose', {});
        locator.register('config', { api : { host : 'http://testenv'}});
    });

    it('will refresh cache', function(done) {

        let players = new PlayerCache(locator, mock_queries.all_players);

        players.initialize().then((results) => {
            (results.length).should.equal(2);
            (request_count).should.equal(1);

            players.get(1).then((player) => {
                should.exist(player);
                (request_count).should.equal(1);
                setTimeout(() => {
                    players.refresh().then(() => {
                        setTimeout(() => {
                            (request_count).should.equal(2);
                            return done();
                        }, 50);
                    });
                }, 50);

            }, (err) => {
                should.not.exist(err);
                should.fail('this should not be called');
                return done();
            });

        }, (err) => {
            should.fail('this should not be called');
            return done();
        });

    });

    it('will only request once', function(done) {

        let players = new PlayerCache(locator, mock_queries.all_players);

        players.initialize();
        players.initialize().then((results) => {
            (results.length).should.equal(2);
            (request_count).should.equal(1);
            return done();
        }, (err) => {
            should.fail('this should not be called');
            return done();
        });

    });

    it('will only request once 2', function(done) {

        let players = new PlayerCache(locator, mock_queries.all_players);

        let p = players.initialize();

        players.initialize().then((results) => {
            (results.length).should.equal(2);
            (request_count).should.equal(1);
            p.then((results) => {
                (results.length).should.equal(2);
                (request_count).should.equal(1);
                return done();
            });
        }, (err) => {
            should.fail('this should not be called');
            return done();
        });

    });


});

