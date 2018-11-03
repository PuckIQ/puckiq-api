"use strict";

exports.getIpAddress = function(req) {
    if(!_.isObject(req)) return '';

    let ip = '';

    if(req.headers['x-forwarded-for']) {
        ip = req.headers['x-forwarded-for'];
    } else if(req.connection && req.connection.remoteAddress) {
        ip = req.connection.remoteAddress;
    }

    return ip.split(',')[0];
};