'use strict';

let _ = require('lodash');
let async = require('async');
let constants = require('../../common/constants');
let Cache = require('../../common/in_memory_cache');

module.exports = function(locator) {
    return new FeatureService(locator);
};

function FeatureService(locator) {

    let service = this;
    let config = locator.get('config');
    // let EventStore = locator.get('event_store');

    let mongoose = locator.get('mongoose');
    let Feature = mongoose.model('Feature');

    let _cache = new Cache({ timeout: 30 }); //30s

    service.listFeatures = function(done) {

        Feature.find({}, function(err, features) {

            if(err) return done(err);

            let f = {};
            _.each(_.keys(constants.features), function(key) {
                let feature = _.find(features, function(feature) {
                    return feature.name === constants.features[key];
                });
                f[key] = { enabled: feature ? feature.enabled : false };
            });

            return done(null, f);

        });

    };

    //returns true if it changed
    service.enable = function(name, enable, options, done) {

        if(_.isFunction(options)) {
            done = options;
            options = {};
        }

        options = _.extend({
            user: null
        }, options);

        _cache.set(name, enable);

        Feature.findOneAndUpdate({ name: name }, { $set: { enabled: enable, updated: new Date() } }, {
            new: false,
            upsert: true
        }, (err, old_feature) => {

            if(err) return done(err);

            // with new:false, if it is upserted, old_feature is null
            // this checks if the enabled value has changed - short out if it hasn't
            if(!old_feature || old_feature.enabled === enable) return done();

            let event_type = enable ?
                constants.events.feature.enabled :
                constants.events.feature.disabled;

            let data = {
                feature: {
                    name: name
                }
            };

            if(options.user) {
                data.user = options.user;
            }

            // EventStore.fireEvent(event_type, {
            //     data: data
            // });

            return done();
        });

    };

    service.isEnabled = function(name, done) {

        if(_cache.has(name)) {
            return done(null, _cache.get(name));
        }

        Feature.findOne({
            name: name
        }, function(err, feature) {
            if(err) return done(err);
            if(feature) {
                _cache.set(name, feature.enabled);
                return done(null, feature.enabled);
            } else {
                return done(null, false);
            }
        });

    };
}

