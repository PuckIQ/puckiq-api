// For functions directly calling NHL game data
const _ = require('lodash');
const moment = require('moment');
const timezone = require('moment-timezone');

const today = moment.tz('America/New_York').subtract(4, 'hours');
const adjToday = today.format('YYYY-MM-DD');

const constants = require('../../common/constants');
const utils = require('../../common/utils');
const AppException = require('../../common/app_exception');
const MongoHelpers = require('../../common/mongo_helpers');
const InMemoryCache = require('../../common/in_memory_cache');
const Queries = require('./queries');
const WoodmoneyQuery = require('./woodmoney');

class StatsController {

    constructor(locator) {
        this.locator = locator;
        this.config = locator.get('config');
        this.error_handler = locator.get('error_handler');
        this.mongoose = locator.get('mongoose');
        this.woodmoney_cache = new InMemoryCache({timeout: 600});//10 min
    }

    wowySeasons(req, res) {

        let WowySeason = this.locator.get('mongoose').model('SeasonWowy');

        return WowySeason.aggregate([
            { $match: { season: { $exists: true } } },
            { $group: { _id: "$season" } },
            { $sort: { _id: -1 } }]).then((results) => {
            res.jsonp(results);
        }, (err) => {
            let ex = new AppException(constants.exceptions.database_error, "Error searching players", { err: err });
            return this.error_handler.handle(req, res, ex);
        });
    }

    woodMoneySeasons(req, res) {

        let WoodmoneySeason = this.locator.get('mongoose').model('SeasonWoodmoney');

        return WoodmoneySeason.aggregate([
            { $match: { season: { $exists: true } } },
            { $group: { _id: "$season" } },
            { $sort: { _id: -1 } }]).then((results) => {
            res.jsonp(results);
        }, (err) => {
            let ex = new AppException(constants.exceptions.database_error, "Error searching players", { err: err });
            return this.error_handler.handle(req, res, ex);
        });
    }

    /**
     * query
     *  player_id* : string,
     *  teammate_id : [player_id],
     *  season_id : [int],
     *
     *  Not supported: range
     *
     *  Client side: position
     */
    getWowyForPlayer(req, res) {

        let options = req.query; //TODO

        if(!(req.query.teammate_id && req.query.teammate_id.length)) {
            return res.send(400).jsonp({ message: 'invalid request' });
        }

        if(!req.query.season) {
            //todo default season
        }

        //todo if range options, call getRangeWowy

        Queries.season_wowy(this.mongoose, this.config)(options).then((results) => {
            res.jsonp(results);
        }, (err) => {
            let ex = new AppException(constants.exceptions.database_error, "Error searching Woodmoney", { err: err });
            return this.error_handler.handle(req, res, ex);
        });

    }


    /**
     * team: ie 3 digit code
     * season: if not set, current
     * competition (woodmoneytier)
     *  - possible values Middle/Elite/Gritensity
     * game type (gametype)
     *  - possible values Home, Away, vs East, vs West
     * (position is client side)
     * @param req
     * @param res
     */
    getWoodmoney(req, res) {

        let query = new WoodmoneyQuery(this.locator, {
            queries : Queries,
            cache : this.woodmoney_cache
        });

        query.validate(req.query).then((options) => {

            query.fetch(options).then((results) => {

                let response = {
                    request: _.extend({ _id: req.query.request_id || utils.uid(20)}, options),
                    results
                };

                if (options.player) {
                    this.locator.get('player_cache').all().then((player_dict) => {
                        response.player = player_dict[options.player.toString()];
                        res.jsonp(response);
                    }, (err) => {
                        return this.error_handler.handle(req, res, err);
                    });
                } else {
                    res.jsonp(response);
                }

            }, (err) => {
                return this.error_handler.handle(req, res, err);
            });

        }, (err) => {
            console.log("validation error", err);
            return this.error_handler.handle(req, res, err);
        });

    }

    /**
     * query
     *  team : string,
     *  player_id : [],
     *  season_id : [int],
     *  range : {from, to }
     *  position : string,
     *
     *  team or player_ids is required
     */
    getWoodmoneyForPlayer(req, res) {

        let options = {
            playerid: parseInt(req.params.player_id || 0),
            onoff : "On Ice"
        };

        if(!options.playerid) {
            return this.error_handler.handle(req, res, new AppException(constants.exceptions.invalid_argument, "Invalid player_id", { player_id: options.player_id }));
        }

        //if(req.query.woodmoneytier) options.woodmoneytier = req.query.woodmoneytier;

        let query = Queries.season_woodmoney;
        if(req.query.season) {
            if(_.isArray(req.query.season) && req.query.season.length > 1) {
                options.season = { $in: _.map(req.query.season, x => parseInt(x)) };
            } else if(_.isString(req.query.season) && req.query.season.toLowerCase() === "all") {
                //dont set season
            } else {
                options.season = _.isArray(req.query.season) ? parseInt(req.query.season[0]) : parseInt(req.query.season);
            }
        } else if(req.query.range_from && req.query.range_to) {
            query = Queries.range_woodmoney;
        } else {
            //todo error?
            options.season = constants.current_season;
        }

        this.locator.get('player_cache').all().then((player_dict) => {
            query(this.mongoose, this.config)(options, player_dict).then((results) => {
                console.log(results.length, "total results");
                res.jsonp(results);
            }, (err) => {
                let ex = new AppException(constants.exceptions.database_error, "Error searching player Woodmoney", { err: err });
                return this.error_handler.handle(req, res, ex);
            });
        }, (e) => {
            let ex = new AppException(constants.exceptions.database_error, "Error searching player Woodmoney", { err: e });
            return this.error_handler.handle(req, res, ex);
        });

    }

    /**
     * team: ie 3 digit code
     * season: if not set, current
     * competition (woodmoneytier)
     *  - possible values Middle/Elite/Gritensity
     * game type (gametype)
     *  - possible values Home, Away, vs East, vs West
     * (position is client side)
     * @param req
     * @param res
     */
    getWoodmoneyForTeam(req, res) {

        // TODO this is almost the same as getWoodmoneyForPlayer
        let options = {
            team: req.params.team,
            onoff: "On Ice"
        };

        if (!options.team) {
            return this.error_handler.handle(req, res, new AppException(constants.exceptions.invalid_argument, "Invalid team", {team: options.team}));
        }

        options.team = options.team.toUpperCase();

        //if(req.query.woodmoneytier) options.woodmoneytier = req.query.woodmoneytier;

        let query = Queries.season_woodmoney;
        if (req.query.season) {
            if (_.isArray(req.query.season) && req.query.season.length > 1) {
                options.season = {$in: _.map(req.query.season, x => parseInt(x))};
            } else if (_.isString(req.query.season) && req.query.season.toLowerCase() === "all") {
                //dont set season
            } else {
                options.season = _.isArray(req.query.season) ? parseInt(req.query.season[0]) : parseInt(req.query.season);
            }
        } else if (req.query.range_from && req.query.range_to) {
            query = Queries.range_woodmoney;
        } else {
            //todo error?
            options.season = constants.current_season;
        }

        this.locator.get('player_cache').all().then((player_dict) => {
            query(this.mongoose, this.config)(options, player_dict).then((results) => {
                res.jsonp(results);
            }, (err) => {
                let ex = new AppException(constants.exceptions.database_error, "Error searching Woodmoney", {err: err});
                return this.error_handler.handle(req, res, ex);
            });
        }, (e) => {
            let ex = new AppException(constants.exceptions.database_error, "Error searching player Woodmoney", {err: e});
            return this.error_handler.handle(req, res, ex);
        });
    }
}

module.exports = StatsController;