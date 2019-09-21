const _ = require('lodash');
const constants = require('../../common/constants');
const validator = require('../../common/validator');
const InMemoryCache = require('../../common/in_memory_cache');
const AppException = require('../../common/app_exception');

class WoodwowyQuery {

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
                teammates: [],
                team : null,
                tier: null
            };

            options = _.extend({ }, defaults, options);
            if(options.team) options.team = options.team.toUpperCase();

            /* required params */
            if (!options.player) {
                return reject(new AppException(constants.exceptions.missing_argument, "player is required"));
            }

            if (!(options.teammates && options.teammates.length)) {
                return reject(new AppException(constants.exceptions.missing_argument, "at least one teammate is required"));
            }

            options.player = parseInt(options.player);
            let err = validator.validateInteger(options.player, "player", {nullable: false, min: 1});
            if (err) return reject(err);

            options.teammates = _.map(options.teammates, x => parseInt(x));
            err = validator.validateArray(options.teammates, "teamates", {
                nullable: false,
                iterator : (x) => {
                    validator.validateInteger(x, 'teammate', {nullable: false, min: 1})
                }});
            if (err) return reject(err);

            /* filters */

            if (_.has(options, "from_date") && _.has(options, "to_date") && options.from_date && options.to_date) {

                let err = validator.validateDate(parseInt(options.from_date), "from_date");
                if (err) return reject(err);

                err = validator.validateDate(parseInt(options.to_date), "to_date");
                if (err) return reject(err);

                options.from_date = new Date(parseInt(options.from_date));
                options.to_date = new Date(parseInt(options.to_date));

                if (options.from_date > options.to_date) {
                    return reject(new AppException(constants.exceptions.invalid_request,
                        "From_Date cannot be greater than To_Date",
                        {err: err, step: 'fetch_data'}));
                }

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

            if (options.tier && !~_.values(constants.woodmoney_tier).indexOf(options.tier)) {
                return reject(new AppException(
                    constants.exceptions.invalid_argument,
                    `Invalid value for parameter: ${options.tier}`,
                    {param: 'tier', value: options.tier}
                ));
            }

            return resolve(options);
        });
    }

    fetch(options) {

        let query = null;

        if (options.from_date && options.to_date) {
            query = this.queries.range_woodwowy;
        } else {
            query = this.queries.season_woodwowy;
        }

        query = query(this.locator.get('mongoose'), this.locator.get('config'));

        return new Promise((resolve, reject) => {

            this.locator.get('player_cache').all().then((player_dict) => {

                //filter down to the queryable fields...
                let query_options = {};
                _.each(['season', 'from_date', 'to_date', 'player', 'team','teammates'], (key) => {
                    if (options[key]) query_options[key] = options[key];
                });

                query(query_options, player_dict).then((results) => {

                    let player_results = {};
                    _.each(results, x => {
                        let key = `${x.season}-${x.player_1_id}-${x.player_2_id}-${x.team}`;
                        if (!player_results[key]) {
                            player_results[key] = {
                                positions: _.map(x.positions, pos => pos.toLowerCase())
                            };
                        }
                        player_results[key][x.woodmoneytier] = x
                    });

                    return resolve(this.select(player_results, options));

                }, (err) => {
                    return reject(new AppException(constants.exceptions.database_error, "Error searching Woodwowy",
                        {err: err, step: 'fetch_data'}));
                });

            }, (err) => {
                return reject(new AppException(constants.exceptions.database_error, "Error searching Woodwowy",
                    {err: err, step: 'load_player_cache'}));
            });

        });

    }

    select(player_results, options) {

        const dir = options.sort_direction === constants.sort.ascending ? 1 : -1;
        const filter_positions = _.map(options.positions, x => x);

        let result = _.chain(player_results)
            .filter(x => {

                if(x.positions.length === 1 && x.positions[0] === 'g') return false;

                if(options.positions !== "all") {
                    if(_.intersection(x.positions, filter_positions).length === 0) {
                        return false;
                    }
                }

                if(options.min_toi) {
                    let tier = options.tier || 'All';
                    if(x[tier]['evtoi'] < options.min_toi) return false;
                }

                if(options.max_toi) {
                    let tier = options.tier || 'All';
                    if(x[tier]['evtoi'] > options.max_toi) return false;
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

module.exports = WoodwowyQuery;