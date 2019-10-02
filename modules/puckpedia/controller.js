"use strict";

const _ = require('lodash');
const async = require('async');

const constants = require('../../common/constants');
const utils = require('../../common/utils');
const AppException = require('../../common/app_exception');

class StatsController {

    constructor(locator) {
        this.locator = locator;
        this.config = locator.get('config');
        this.error_handler = locator.get('error_handler');
        this.mongoose = locator.get('mongoose');
    }

    getNightlyStats(req, res) {

        let SeasonBoxcar = this.locator.get('mongoose').model('SeasonBoxcar');
        let SeasonWoodmoney = this.locator.get('mongoose').model('SeasonWoodmoney');

        //support both post and get
        let {ex, base_query} = this.validate(_.extend({}, req.body, req.query));

        if (ex) {
            return this.error_handler.handle(req, res, ex);
        }

        async.parallel({
            player_dict: (cb) => {
                this.locator.get('player_cache').all().then((player_dict) => {
                    return cb(null, player_dict);
                }, (err) => {
                    let ex = new AppException(constants.exceptions.database_error, "Error fetching players", {err: err});
                    return cb(ex);
                });
            },
            boxcars: (cb) => {

                let query = _.extend({situation: '5v5', recordtype: 'boxcar'}, base_query);

                return SeasonBoxcar.find(query).lean().then((results) => {
                    let keyed = _.keyBy(results, 'playerid');
                    return cb(null, keyed);
                }, (err) => {
                    let ex = new AppException(constants.exceptions.database_error, "Error fetching boxcars", {err: err});
                    return cb(ex);
                });
            },
            woodmoney: (cb) => {

                let query = _.extend({woodmoneytier: 'All'}, base_query);

                return SeasonWoodmoney.find(query).lean().sort({season:1, team: 1, playerid:1}).then((results) => {
                    return cb(null, results);
                }, (err) => {
                    let ex = new AppException(constants.exceptions.database_error, "Error fetching woodmoney", {err: err});
                    return cb(ex);
                });
            }
        }, (err, results) => {

            if (err) return this.error_handler.handle(req, res, err);

            let player_dict = results.player_dict;

            let formatted = _.chain(results.woodmoney)
                .filter(wm => wm.onoff !== constants.on_off.off_ice)
                .map((wm) => {

                    // filter out goalies
                    // till we get a real nhlplayers collection
                    if (_.has(player_dict, wm.playerid)) {
                        wm.name = player_dict[wm.playerid].name;
                        wm.positions = player_dict[wm.playerid].positions;
                        if(!!~wm.positions.indexOf("G")) return null;
                    } else {
                        console.log("cannot find player", wm.player_id);
                    }

                    let off = _.find(results.woodmoney, x => {
                        return x.playerid === wm.playerid &&
                            x.team === wm.team &&
                            x.season === wm.season &&
                            x.onoff === constants.on_off.off_ice &&
                            x.wowytype === wm.wowytype &&
                            x.woodmoneytier === wm.woodmoneytier;
                    });

                    if (!off) {
                        console.log("data issue.... (missing off)");
                        return null;
                    }

                    let boxcar = results.boxcars[wm.playerid] || {iG: 0, iP: 0, iA: 0};

                    let record = {
                        player_id: wm.playerid,
                        name: wm.name || 'unknown',
                        positions: wm.positions || [],
                        season: wm.season,
                        team: wm.team,
                        evtoi: wm.evtoi,
                        gfpct : wm.gfpct,
                        dffpct: wm.dffpct,
                        dffpctrc: wm.dffpct - off.dffpct,
                        cfpct: wm.cfpct,
                        cfpctrc: wm.cfpct - off.cfpct,
                        g60: (boxcar.iG / (wm.evtoi || 1)) * 3600,
                        p60: (boxcar.iP / (wm.evtoi || 1)) * 3600,
                        a60: (boxcar.iA / (wm.evtoi || 1)) * 3600
                    };

                    return record;

                }).compact().value();

            return res.jsonp(formatted);
        });

    }

    validate(options) {

        //season
        if (!options.season) {
            let ex = new AppException(constants.exceptions.missing_argument, "Missing argument: season");
            return {ex};
        }

        let season = parseInt(options.season);

        if (!season) {
            let ex = new AppException(constants.exceptions.missing_argument, "Invalid arguement: season", {season: options.season});
            return {ex};
        }

        if (options.season === 20192020 && new Date() < new Date(2019, 9, 1, 18, 0, 0, 0)) {
            options.gametype = constants.schedule_game_type.pre_season;
        } else {
            options.gametype = constants.schedule_game_type.regular_season;
        }

        options.season = season;

        //player
        if (options.player) {

            let player = parseInt(options.player);

            if (!player) {
                let ex = new AppException(constants.exceptions.missing_argument, "Invalid arguement: player", {player: options.player});
                return {ex};
            }

            options.playerid = player;
            delete options.player;
        }

        //team
        if (options.team) {
            options.team = options.team.toUpperCase();
        }

        return {base_query: options};

    }
}

module.exports = StatsController;