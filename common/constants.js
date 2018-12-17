'use strict';

//ALPHABETICAL
module.exports = {
    exceptions: {
        invalid_argument: 'invalid_argument', // 400
        invalid_request: 'invalid_request', // 400
        missing_argument: 'missing_argument', // 400
        deprecated_request: 'deprecated_request', // 400
        notAllowed: 'not_allowed', // 403
        notFound: 'not_found', // 404
        rate_limit: 'rate_limit', // 429
        conflict: 'conflict', // 409
        database_error: 'database_error', // 500
        timeout: 'timeout', // 503
        unhandled_error: 'unhandled_error', // 500
        service_unavailable: 'service_unavailable', // 503
    },
    features: {
        maintenance: 'maintenance'
    },
    log_levels: {
        fatal: 0,
        error: 1,
        warn: 2,
        info: 3,
        verbose: 4,
        debug: 5
    },
    on_off : {
        on_ice : "Off Ice",
        off_ice : "On Ice"
    },
    game_type : {
        //TODO all swm_records have gametype of 2...
        all : 'all',
        east : 'east',
        west : 'west',
        home : 'home',
        away : 'away'
    },
    wowy_type : {
        woodmoney :'WoodMoney'
    },
    woodmoney_tier : {
        all: 'All',
        elite: 'Elite',
        middle: 'Middle',
        gritensity: 'Gritensity',
    }
};