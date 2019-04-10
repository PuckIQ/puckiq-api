const _ = require('lodash');
const constants = require('../../common/constants');
const validator = require('../../common/validator');
const InMemoryCache = require('../../common/in_memory_cache');
const AppException = require('../../common/app_exception');

class WoodmoneyQuery {

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
                offset : 0,
                sort : 'evtoi',
                sort_direction : 'desc',
                count: 50
            };

            options = _.extend({ }, defaults, options);

            if(options.team) options.team = options.team.toUpperCase();

            //todo validate player?

            if (_.has(options, "from_date") && _.has(options, "to_date")) {

                let err = validator.validateDate(options.from_date, "from_date");
                if (err) return reject(err);

                err = validator.validateDate(options.to_date, "to_date");
                if (err) return reject(err);

            } else if (_.has(options, "season")) {
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

            if (options.tier && !~_.values(constants.woodmoney_tier).indexOf(options.tier)) {
                return reject(new AppException(
                    constants.exceptions.invalid_argument,
                    `Invalid value for parameter: ${options.tier}`,
                    {param: 'tier', value: options.tier}
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
                let err = validator.validateInteger(options.count, 'count', {nullable: false, min: 1, max: 50});
                if (err) return reject(err);
            }

            return resolve(options);
        });
    }

    fetch(options) {

        let query = null;
        let date_key = null;

        if (options.from_date && options.to_date) {
            date_key = `${options.from_date}-${options.to_date}`;
            query = this.queries.range_woodmoney;
        } else {
            date_key = options.season || 'all';
            query = this.queries.season_woodmoney;
        }

        query = query(this.locator.get('mongoose'), this.locator.get('config'));

        return new Promise((resolve, reject) => {

            //dont need to cache if its just a player or team result (way less data)
            if (!options.player && !options.team && this.cache.has(date_key)) {
                let player_results = this.cache.get(date_key);
                return resolve(this.select(player_results, options));
            } else {

                this.locator.get('player_cache').all().then((player_dict) => {

                    //filter down to the queryable fields...
                    let query_options = {};
                    _.each(['season','from_date','to_date','player','team'], (key) => {
                        if(options[key]) query_options[key] = options[key];
                    });

                    query(query_options, player_dict).then((results) => {

                        let player_results = {};
                        _.each(results, x => {
                            if (!player_results[x.player_id]) {
                                player_results[x.player_id] = {
                                    positions: _.map(x.positions, pos => pos.toLowerCase())
                                };
                            }
                            player_results[x.player_id][x.woodmoneytier] = x
                        });

                        this.cache.set(date_key, player_results);

                        return resolve(this.select(player_results, options));

                    }, (err) => {
                        return reject(new AppException(constants.exceptions.database_error, "Error searching Woodmoney",
                            {err: err, step: 'fetch_data'}));
                    });

                }, (err) => {
                    return reject(new AppException(constants.exceptions.database_error, "Error searching Woodmoney",
                        {err: err, step: 'load_player_cache'}));
                });

            }
        });

    }

    select(player_results, options) {

        console.log('select', JSON.stringify(options));

        const dir = options.sort_direction === constants.sort.ascending ? 1 : -1;
        const filter_positions = _.map(options.positions, x => x);

        let result = _.chain(player_results)
            .filter(x => {

                if (options.positions !== "all") {
                    if (_.intersection(x.positions, filter_positions).length === 0) {
                        return false;
                    }
                } else {
                    //lets ignore goalies...
                    return !(x.positions.length === 1 && x.positions[0] === 'g');
                }

                return true;
            })
            .sortBy(x => {
                let tier = options.tier || 'All';
                return x[tier][options.sort] * dir;
            })
            .slice(options.offset, options.offset + options.count)
            .map(x => {

                let tiers = _.map(_.values(constants.woodmoney_tier), tier => {
                    if(!options.tier || tier === options.tier) return x[tier];
                    return null;
                });

                return _.compact(tiers);
            })
            .flatten()
            .value();

        return result;
    }


}

module.exports = WoodmoneyQuery;