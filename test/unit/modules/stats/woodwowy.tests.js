'use strict';

let _ = require('lodash');
let should = require('should');
let constants = require('../../../../common/constants');
let ServiceLocator = require('../../../../common/service_locator');
let InMemoryCache = require('../../../../common/in_memory_cache');
let WoodwowyQuery = require('../../../../modules/stats/woodwowy');
let WoodwowyFormatter = require('../../../../modules/stats/queries/woodwowy_formatter');

let mcdavid_klefbom_raw = require('../../../data/woodwowy/20192020_mcdavid_klefbom');

const player_dict = {
    '8478402': {
        name  : 'Connor McDavid',
        positions: ['c']
    },
    '8476472' : {
        name  : 'Oscar Klefbom',
        positions: ['d']
    }
};

describe('woodwowy query tests', function() {

    let locator = new ServiceLocator();

    let request_count = 0;
    let mock_queries = {
        season_woodwowy : function() {
            return function (options) {
                request_count++;
                let result = WoodwowyFormatter.formatBulk(mcdavid_klefbom_raw, player_dict, false);
                return Promise.resolve(result);
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
                let players = _.keyBy(mcdavid_klefbom_raw, x => x.player_id);
                return Promise.resolve(players);
            }
        })
    });

    describe("exec tests", function(){

        it('will format right', function(done) {

            let options = {
                player: 8478402,
                teammates : [8476472],
                season: 20192020
            };

            let query = new WoodwowyQuery(locator, {queries: mock_queries});
            query.exec(options).then((results) => {
                (results.length).should.equal(12);
                return done();
            }, (err) => {
                should.fail('this should not be called');
                return done();
            });

        });

    });

});


