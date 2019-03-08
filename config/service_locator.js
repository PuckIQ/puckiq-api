'use strict';

let _ = require('lodash');
let path = require('path');
let async = require('async');
let ServiceLocator = require('../common/service_locator');
let constants = require('../common/constants');;

module.exports = {
    init: function(config, mongoose, done) {

        let locator = new ServiceLocator();

        locator.register('mongoose', mongoose);
        locator.register('config', config);
        locator.register('error_handler', require('../common/error_handler'));
        locator.register('bus', require('../common/bus'));

        // services
        // locator.register('event_store', require('../common/event_store')(locator));
        locator.register('blacklist_service', require('../modules/application/blacklist_service')(locator));
        locator.register('feature_service', require('../modules/application/feature_service')(locator));
        locator.register('email_service', require('../modules/application/email_service')(locator));

        //TODO modules
        locator.register('player_cache', new (require('../modules/players/player_cache'))(locator));

        async.eachSeries(locator.keys(), (key, cb) => {
            let service = locator.get(key);
            if (_.isFunction(service.initialize)) {
                service.initialize().then(() => cb());
            } else {
                cb();
            }
        }, (err) => {
            done && done(err, locator);
        });

    }
};