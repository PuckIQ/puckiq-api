const _ = require('lodash');
const Cache = require('../../common/in_memory_cache');
const AllPlayers = require('./queries/all');

class PlayerCache {

    constructor(locator) {

        this._cache = new Cache({ timeout: 1800 }); // 30 min

        this.locator = locator;
        this.last_fetch = new Date(0);
        this.initializing = null;

    }

    /**
     */
    initialize() {

        if(this.initializing) return this.initializing;

        this.initializing = new Promise((resolve, reject) => {
            AllPlayers(this.locator.get('mongoose'), this.locator.get('config'))({})
                .then((players) => {
                    this.last_fetch = new Date();
                    this._cache.set('all', _.keyBy(players, 'playerid'));
                    resolve(players)
                }, (e) => {
                    reject(e)
                });
        });

        return this.initializing;

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

            return resolve(_.has(players, player_id) ? players[player_id] : null);
        });

    }

    all() {

        return new Promise((resolve, reject) => {

            let players = this._cache.get('all');

            if (!players) {
                this.initialize().then((players) => {
                    resolve(players);
                }, (e) => {
                    reject(e);
                });
            } else {
                if(this.isStale()) {
                    // this.initialize();, the in memory cache expires after 30 min
                }
                resolve(players);
            }
        });
    }

    refresh() {

        return new Promise((resolve, reject) => {

            this.initialize().then((players) => {
                resolve(players);
            }, (e) => {
                reject(e);
            });

        });
    }

    isStale() {
        return Date.now() - this.last_fetch.getTime() > 300000;
    }

}

module.exports = PlayerCache;