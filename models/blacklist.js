'use strict';

let _ = require('lodash');
let constants = require('../common/constants');

module.exports = function(mongoose) {

    let Schema = mongoose.Schema;

    let schema = new Schema({
        ip: {
            type: String,
            required: true
        },
        last_seen: {
            type: Date
        },
        access_count: {
            type: Number
        },
        created: {
            type: Date,
            default: Date.now
        }
    });

    return mongoose.model('Blacklist', schema, null, {
        connection: mongoose.dbs['puckiq']
    });

};