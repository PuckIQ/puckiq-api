const _ = require('lodash');
const constants = require('../../common/constants');
const Cache = require('../../common/in_memory_cache');
const AllPlayers = require('./queries/all');

class PlayerCache {

    constructor(locator) {
        this.locator = locator;
        this._cache = new Cache(1800); // 30 min
    }

    /**
     */
    initialize() {

        //todo handle race condition on this...

        return new Promise((resolve, reject) => {
            AllPlayers(this.locator.get('mongoose'), this.locator.get('config'))({})
                .then((players) => {
                    this._cache.set('all', _.keyBy(players, 'playerid'));
                    resolve(players)
                }, (e) => {
                    reject(e)
                });
        });

    }

    get(key) {

        let player_id = _.isNumber(key) ? key.toString() : key;

        return new Promise((resolve, reject) => {

            let players = this._cache.get('all');

            if (!players) {
                this.initialize().then((players) => {
                    resolve(_.has(players, player_id) ? players[player_id] : null);
                }, (e) => {
                    reject(e);
                });
            }

            resolve(_.has(players, player_id) ? players[player_id] : null);
        });

    }

    all(){

        return new Promise((resolve, reject) => {

            let players = this._cache.get('all');

            if (!players) {
                this.initialize().then((players) => {
                    resolve(players);
                }, (e) => {
                    reject(e);
                });
            } else {
                resolve(players);
            }
        });
    }

}

module.exports = PlayerCache;