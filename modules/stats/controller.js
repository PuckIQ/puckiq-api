"use strict";

// For functions directly calling NHL game data
const _ = require('lodash');
const constants = require('../../common/constants');
const utils = require('../../common/utils');
const AppException = require('../../common/app_exception');
const InMemoryCache = require('../../common/in_memory_cache');
const Queries = require('./queries');
const WoodmoneyQuery = require('./woodmoney');
const WoodwowyQuery = require('./woodwowy');

class StatsController {

    constructor(locator) {
        this.locator = locator;
        this.config = locator.get('config');
        this.error_handler = locator.get('error_handler');
        this.mongoose = locator.get('mongoose');
        this.woodmoney_cache = new InMemoryCache({timeout: 600});//10 min
    }

    /**
     * player: player id to run wowy for
     * teammates: array of player ids to compare vs player
     * team: ie 3 digit code
     * season: if not set, current
     * from_date/to_date:
     * positions: all or array of []
     * from_date/to_date:
     * tier (woodmoneytier):
     *  - possible values Middle/Elite/Gritensity
     * gametype (gametype):
     *  - possible values Home, Away, vs East, vs West
     * @param req
     * @param res
     */
    getWowy(req, res) {

        let query = new WoodwowyQuery(this.locator, {
            queries : Queries,
            cache : this.woodmoney_cache
        });

        let input = _.extend({}, req.body);

        query.validate(input).then((options) => {

            query.fetch(options).then((results) => {

                let response = {
                    request: _.extend({ _id: req.query.request_id || utils.uid(20)}, options),
                    results
                };

                if(response.request.from_date) response.request.from_date = response.request.from_date.getTime();
                if(response.request.to_date) response.request.to_date = response.request.to_date.getTime();

                this.locator.get('player_cache').all().then((player_dict) => {
                    response.player = player_dict[options.player.toString()];
                    response.teammates = _.map(options.teammates, x => {
                        return player_dict[x.toString()]
                    });
                    res.jsonp(response);
                }, (err) => {
                    return this.error_handler.handle(req, res, err);
                });

            }, (err) => {
                return this.error_handler.handle(req, res, err);
            });

        }, (err) => {
            console.log("validation error", err);
            return this.error_handler.handle(req, res, err);
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
            queries : Queries
        });

        let input = _.extend({}, req.query, req.body);

        query.validate(input).then((options) => {

            query.fetch(options).then((results) => {

                let response = {
                    request: _.extend({ _id: req.query.request_id || utils.uid(20)}, options),
                    results
                };

                if(response.request.from_date) response.request.from_date = response.request.from_date.getTime();
                if(response.request.to_date) response.request.to_date = response.request.to_date.getTime();

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
}

module.exports = StatsController;