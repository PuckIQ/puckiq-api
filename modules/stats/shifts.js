"use strict";

const _ = require('lodash');
const constants = require('../../common/constants');
const validator = require('../../common/validator');
const InMemoryCache = require('../../common/in_memory_cache');
const AppException = require('../../common/app_exception');

const MAX_COUNT = 100;

class ShiftsQuery {

    constructor(locator, options = {}){
        this.locator = locator;
        this.queries = options.queries || require('./queries'); //for unit testing
        this.cache = options.cache || new InMemoryCache({timeout: 600});//10 min
    }

    exec(options){

        return new Promise((resolve, reject) => {
            this.validate(options).then((options) => {
                return resolve(this.fetch(options));
            }, (err) => {
                return reject(err);
            });
        });

    }

    validate(options) {

        return new Promise((resolve, reject) => {

            let defaults = {
                positions : 'all',
                season: null,
                player: null,
                team : null,
                tier: null,
                //min_toi: null,
                //max_toi: null,
                offset : 0,
                group_by : constants.group_by.player_season_team,
                sort : 'totalshifts',
                sort_direction : 'desc',
                count: MAX_COUNT
            };

            options = _.extend({ }, defaults, options);

            if(options.team) options.team = options.team.toUpperCase();

            if (options.player) {
                options.player = parseInt(options.player);
                let err = validator.validateInteger(options.player, "player", {nullable: true, min: 0});
                if (err) return reject(err);
            }

            if (_.has(options, "from_date") && _.has(options, "to_date") && options.from_date && options.to_date) {

                return reject(new AppException(constants.exceptions.invalid_request,
                    "Date range not an option for Shift Data",
                    {step: 'fetch_data'}));

            } else if (!_.has(options, "season")){

                return reject(new AppException(constants.exceptions.missing_argument,
                    "Missing season parameter",
                    {step: 'fetch_data'}));

            } else if (_.has(options, "season")) {

                //just in case
                delete options.from_date;
                delete options.to_date;

                if (_.isArray(options.season)) {
                    options.season = _.map(options.season, x => parseInt(x));
                    let err = null;
                    if (_.some(options.season, season => {
                        err = validator.validateSeason(season, "season");
                        if (err) return true;
                    })) {
                        return reject(err);
                    }
                } else if (options.season === "all" || options.season === null) {
                    delete options.season; //its valid, carry on...
                } else {
                    options.season = parseInt(options.season);
                    let err = validator.validateSeason(options.season, "season");
                    if (err) return reject(err);
                }
            }

            if (options.positions !== 'all') {
                options.positions = options.positions.toLowerCase();
                const all_positions = _.keys(constants.positions);
                for (var i = 0; i < options.positions.length; i++) {
                    if (!~all_positions.indexOf(options.positions[i])) {
                        return reject(new AppException(
                            constants.exceptions.invalid_argument,
                            `Invalid value for parameter: ${options.positions}`,
                            {param: 'tier', value: options.positions}
                        ));
                    }
                }
            }

            if (options.min_toi) {
                options.min_toi = parseInt(options.min_toi);
                let err = validator.validateInteger(options.min_toi, "min_toi", {nullable: true, min: 0});
                if (err) return reject(err);
            }

            if (options.max_toi) {
                options.max_toi = parseInt(options.max_toi);
                let err = validator.validateInteger(options.max_toi, "max_toi", {nullable: true, min: 0});
                if (err) return reject(err);
            }

            if(options.min_toi && options.max_toi && options.min_toi > options.max_toi){
                return new AppException(
                    constants.exceptions.invalid_argument,
                    `Min toi cannot be greater than max toi`,
                    {param: 'min_toi', value: value}
                );
            }

            if (options.tier && !~_.values(constants.woodmoney_tier).indexOf(options.tier)) {
                return reject(new AppException(
                    constants.exceptions.invalid_argument,
                    `Invalid value for parameter: ${options.tier}`,
                    {param: 'tier', value: options.tier}
                ));
            }

            if (options.group_by && !~_.values(constants.group_by).indexOf(options.group_by)) {
                return reject(new AppException(
                    constants.exceptions.invalid_argument,
                    `Invalid value for parameter: ${options.group_by}`,
                    {param: 'group_by', value: options.group_by}
                ));
            }

            //TODO validate sort
            // if(options.sort && !~constants.sortable_columns).indexOf(options.sort)){
            //     return new AppException(
            //         constants.exceptions.invalid_argument,
            //         `Invalid value for parameter: ${options.tier}`,
            //         { param: 'tier', value: value }
            //     );
            // }

            if (options.count) {
                options.count = parseInt(options.count);
                let err = validator.validateInteger(options.count, 'count', {nullable: false } ); //, min: 1, max: MAX_COUNT});
                if (err) return reject(err);
            }

            return resolve(options);
        });
    }

    fetch(options) {

        let query = null;
        let cache_key = null;

        if (options.from_date && options.to_date) {
            cache_key = `${options.from_date}-${options.to_date}-${options.group_by}`;
            return Promise.reject("Invalid argments, no from/to date for shift data");
        } else {
            cache_key = `${options.season || 'all'}-${options.group_by}`;
            query = this.queries.season_shifts;
        }

        query = query(this.locator.get('mongoose'), this.locator.get('config'));

        return new Promise((resolve, reject) => {

            //dont need to cache if its just a player or team result (way less data)
            if (!options.player && !options.team && this.cache.has(cache_key)) {
                // console.log("pulling data from cache...", options.player, options.team, date_key);
                let player_results = this.cache.get(cache_key);
                return resolve(this.select(player_results, options));
            } else {

                this.locator.get('player_cache').all().then((player_dict) => {

                    //filter down to the queryable fields...
                    let query_options = {};
                    _.each(['season', 'player', 'team', 'group_by'], (key) => {
                        if (options[key]) query_options[key] = options[key];
                    });

                    const key_function = (rec) => {
                        let id = rec._id;
                        switch (options.group_by) {
                            case constants.group_by.player_season_team:
                                return `${id.season}-${id.player_id}-${id.team}`;
                            case constants.group_by.player_season:
                                return `${id.season}-${id.player_id}`;
                            case constants.group_by.player_team:
                                return `${id.player_id}-${id.team}`;
                            case constants.group_by.player:
                                return `${id.player_id}`;
                            default:
                                return 'something_wrong';
                        }
                    };

                    query(query_options, player_dict).then((results) => {

                        let player_results = {};
                        _.each(results, x => {
                            let key = key_function(x);
                            player_results[key] = x;
                        });

                        if (!options.player && !options.team) {
                            this.cache.set(cache_key, player_results);
                        }

                        let selected_player_results = this.select(player_results, options);

                        return resolve(selected_player_results);

                    }, (err) => {
                        return reject(new AppException(constants.exceptions.database_error, "Error searching Shifts",
                            {err: err, step: 'fetch_data'}));
                    });

                }, (err) => {
                    return reject(new AppException(constants.exceptions.database_error, "Error searching Shifts",
                        {err: err, step: 'load_player_cache'}));
                });

            }
        });

    }

    select(player_results, options) {

        const dir = options.sort_direction === constants.sort.ascending ? 1 : -1;
        const filter_positions = _.map(options.positions, x => x);

        let expression = _.chain(player_results)
            .filter(x => {

                if (x.positions.length === 1 && x.positions[0] === 'g') return false;

                if (options.positions !== "all") {
                    if (_.intersection(x.positions, filter_positions).length === 0) {
                        return false;
                    }
                }

                return true;
            });

        if (options.player) {
            expression = expression.sortBy(['season'], ['desc']);
        } else {
            expression = expression.sortBy(x => {
                let tier = options.totalshifts || 'All';
                return x[tier][options.sort] * dir;
            });
        }

        let result = expression.slice(options.offset, options.offset + options.count)
            .flatten()
            .value();

        return result;
    }

}

module.exports = ShiftsQuery;