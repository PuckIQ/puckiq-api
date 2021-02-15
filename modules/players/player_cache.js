'use strict';

const _ = require('lodash');
const Cache = require('../../common/in_memory_cache');

class PlayerCache {

    constructor(locator, all_players_query) {

        this._cache = new Cache({ timeout: 0 }); // no time out, let the player cache control it...

        this.locator = locator;
        this.last_fetch = new Date(0);
        this.initializing = null;

        this.all_players_query = all_players_query || require('./queries/all');

    }

    initialize() {

        if(this.initializing) return this.initializing;

        this.initializing = new Promise((resolve, reject) => {
            this.all_players_query(this.locator.get('mongoose'), this.locator.get('config'))({})
                .then((players) => {
                    this.last_fetch = new Date();
                    this._cache.set('all', _.keyBy(players, 'playerid'));
                    resolve(players)
                    this.initializing = null;
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
                    this.initialize();
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
        return Date.now() - this.last_fetch.getTime() > 1500000;
    }

}

module.exports = PlayerCache;
