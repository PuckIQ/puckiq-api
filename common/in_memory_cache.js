'use strict';

function InMemoryCache(params) {
    params = params || {};

    this.data = {};
    this.timeout = params.timeout; // in seconds
}

InMemoryCache.prototype.has = function(key, cb) {
    var has = this.data.hasOwnProperty(key);
    return cb ? cb(null, has) : has;
};

InMemoryCache.prototype.get = function(key, cb) {
    var val = this.data[key] || null;
    return cb ? cb(null, val) : val;
};

InMemoryCache.prototype.set = function(key, val, cb) {
    this.data[key] = val;
    if(cb) cb();
    if(this.timeout) {
        var self = this;
        setTimeout(function() {
            delete self.data[key];
        }, this.timeout * 1000);
    }
};

module.exports = InMemoryCache;
