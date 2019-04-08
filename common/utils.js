"use strict";

const _ = require("lodash");

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

exports.uid = function(len, options) {

    if(!options) {
        // by default if no options are provided
        // assume all options are true
        options = {
            uppercase: true,
            lowercase: true,
            numbers: true
        };
    }

    // the default value for all options is false
    // this way options is additive not subtractive
    options = _.extend({
        uppercase: false,
        lowercase: false,
        numbers: false
    }, options);

    let chars = '';
    if(options.uppercase) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if(options.lowercase) chars += 'abcdefghijklmnopqrstuvwxyz';
    if(options.numbers) chars += '0123456789';

    let charlen = chars.length;
    if(!charlen) throw new Error('Invalid options');

    let buf = [];
    for(let i = 0; i < len; ++i) {
        buf.push(chars[exports.randomInt(0, charlen)]);
    }

    return buf.join('');
};

exports.randomInt = function(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
};