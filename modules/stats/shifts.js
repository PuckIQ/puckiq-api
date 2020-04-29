"use strict";

const _ = require('lodash');
const constants = require('../../common/constants');
const validator = require('../../common/validator');
const InMemoryCache = require('../../common/in_memory_cache');
const AppException = require('../../common/app_exception');

const MAX_COUNT = 100;
const all_shift_types = ['all'].concat(_.keys(constants.shift_type));

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
                seasons: null,
                player: null,
                team : null,
                shift_type: null,
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

            } else if (!_.has(options, "seasons")){

                return reject(new AppException(constants.exceptions.missing_argument,
                    "Missing seasons parameter",
                    {step: 'fetch_data'}));

            } else if (_.has(options, "seasons")) {

                //just in case
                delete options.from_date;
                delete options.to_date;

                if (_.isArray(options.seasons)) {
                    options.seasons = _.map(options.seasons, x => parseInt(x));
                } else if (options.seasons === "all" || options.seasons === null) {
                    //its valid, carry on...
                    delete options.seasons;
                } else if (_.isString(options.seasons)) {
                    // needed to support GETs for testing
                    options.seasons = _.map(options.seasons.split(","), x => parseInt(x));
                } else {
                    options.seasons = parseInt(options.seasons);
                    let err = validator.validateSeason(options.season, "season");
                    if (err) return reject(err);
                }

                if (options.seasons) {
                    options.seasons = _.compact(options.seasons);
                    let err = null;
                    if (_.some(options.seasons, season => {
                        err = validator.validateSeason(season, "season");
                        if (err) return true;
                    })) {
                        return reject(err);
                    }
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

            if (options.shift_type && !~_.values(constants.shift_type).indexOf(options.shift_type)) {
                return reject(new AppException(
                    constants.exceptions.invalid_argument,
                    `Invalid value for parameter: ${options.shift_type}`,
                    {param: 'shift_type', value: options.shift_type}
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
        } else if(options.group_by === constants.group_by.team_season) {
            cache_key = `${options.seasons || 'all'}-${options.group_by}`;
            query = this.queries.season_team_shifts;
        } else {
            if (_.isArray(options.seasons)) {
                cache_key = `${options.seasons.join(",") || 'all'}-${options.group_by}`;
                query = this.queries.season_shifts;
            } else {
                cache_key = `${options.seasons || 'all'}-${options.group_by}`;
                query = this.queries.season_shifts;
            }
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
                    _.each(['seasons', 'player', 'team', 'group_by'], (key) => {
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
                            case constants.group_by.team_season:
                                return `${id.season}-${id.team}`;
                            default:
                                return 'something_wrong';
                        }
                    };

                    query(query_options, player_dict).then((results) => {

                        let player_results = {};
                        _.each(results, x => {
                            let key = key_function(x);
                            if (!player_results[key]) {
                                player_results[key] = {
                                    positions: _.map(x.positions, pos => pos.toLowerCase())
                                };
                            }

                            if(_.has(player_results[key], x.shift_type)) {
                                console.log("duplicate record for", key);
                            } else {
                                player_results[key][x.shift_type] = x;
                            }
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

                if (options.min_toi) {
                    let shift_type = options.shift_type || 'all';
                    if (x[shift_type]['toi'] < options.min_toi) return false;
                }

                if (options.max_toi) {
                    let shift_type = options.shift_type || 'all';
                    if (x[shift_type]['toi'] > options.max_toi) return false;
                }

                return true;
            });

        if (options.player) {
            expression = expression.sortBy(['season'], ['desc']);
        } else if(options.group_by === constants.group_by.team_season) {
            //already sorted
        } else {
            expression = expression.sortBy(x => {
                let shift_type = options.shift_type || 'all';
                return x[shift_type][options.sort] * dir;
            });
        }

        let result = expression.slice(options.offset, options.offset + options.count)
            .map(x => {

                let shift_types = _.map(all_shift_types, st => {
                    if (!options.shift_type || st === options.shift_type) return x[st];
                    return null;
                });

                return _.compact(shift_types);
            })
            .flatten()
            .value();

        return result;
    }

}

module.exports = ShiftsQuery;