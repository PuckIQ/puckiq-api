'use strict';

//ALPHABETICAL
module.exports = {
    dbCollections: {
        players: 'players',
        playerseasons: 'playerseasons',
        nhlplayers: 'nhlplayers', //old
        gameboxcar: 'gameboxcars',
        gamewoodmoney: 'gamewoodmoney',
        gamewoodwowy: 'gamewoodwowy',
        gamewowy: 'gamewowy',
        schedule: 'schedule',
        seasonboxcar: 'seasonboxcars',
        seasonroster: 'seasonroster',
        seasonshift: 'seasonshifts',
        seasonteamshift: 'seasonteamshifts',
        seasonwoodmoney: 'seasonwoodmoney',
        seasonwowy: 'seasonwowy',
        seasonwoodwowy: 'seasonwoodwowy'
    },
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
    group_by : {
        player_season_team : 'player_season_team',
        player_season : 'player_season',
        player_team : 'player_team',
        player : 'player',
        team_season: 'team_season'
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
        on_ice : "On Ice",
        off_ice : "Off Ice"
    },
    game_type : {
        //TODO all swm_records have gametype of 2...
        all : 'all',
        east : 'east',
        west : 'west',
        home : 'home',
        away : 'away'
    },
    positions : {
        l : 'LW',
        r : 'RW',
        c : 'C',
        d : 'D'
    },
    schedule_game_type : {
        "pre_season" : 1,
        "regular_season" : 2,
        "playoffs" : 3
    },
    shift_type : {
        "all": "all",
        "ostart": "ostart",
        "nstart":"nstart",
        "dstart":"dstart",
        "otf":"otf"
    },
    sort : {
        ascending : 'asc',
        descending : 'desc'
    },
    wowy_type : {
        woodmoney :'WoodMoney',
        woodwowy :'WoodWOWY'
    },
    wowy_record_type : {
        one_not_two :'1 not 2',
        one_and_two :'1 and 2',
        two_not_one :'2 not 1'
    },
    woodmoney_tier : {
        all: 'All',
        elite: 'Elite',
        middle: 'Middle',
        gritensity: 'Gritensity'
    },
    woodmoney_tier_sort : {
        'All': 1,
        'Elite': 2,
        'Middle': 3,
        'Gritensity': 4
    }
};