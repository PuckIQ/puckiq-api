'use strict';

let _ = require('lodash');
let async = require('async');
let constants = require('../../common/constants');
let Cache = require('../../common/in_memory_cache');

module.exports = function(locator) {
    return new BlacklistService(locator);
};

function BlacklistService(locator) {

    let service = this;
    let mongoose = locator.get('mongoose');
    let Blacklist = mongoose.model('Blacklist');

    let _cache = new Cache({ timeout: 30 }); //30s

    service.isBlacklisted = function(req, done) {
        let ip = utils.getIpAddress(req);
        async.waterfall([
            (cb) => {
                getBlacklist((err, blacklist) => {
                    cb(err, blacklist);
                });
            },
            (blacklist, cb) => {
                let blacklist_item = _.find(blacklist, (item) => {
                    return item.ip === ip;
                });
                if (!blacklist_item) return cb(null, false);
                Blacklist.update({
                    _id: blacklist_item._id
                }, {
                    $set: {
                        last_seen: new Date()
                    },
                    $inc: {
                        access_count: 1
                    }
                }, (err) => {
                    cb(err, true);
                });
            }
        ], (err, result) => {
            done(err, result);
        });
    };

    function getBlacklist(done) {
        let blacklist = _cache.get('');
        if (blacklist) return done(null, blacklist);
        Blacklist.find({}, { _id: 1, ip: 1 }).lean().exec((err, blacklist) => {
            if (err) return done(err);
            _cache.set('', blacklist);
            done(null, blacklist);
        });
    }

}