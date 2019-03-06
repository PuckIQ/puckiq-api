'use strict';

let _ = require('lodash');
let constants = require('../common/constants');

module.exports = function(mongoose, config) {

    let Schema = mongoose.Schema;

    let schema = new Schema({
        playerid: {
            type: Number,
            required: true
        },
        fullName: {
            type: String,
            required: true
        },
        weight: {
            type: String
        },
        height: {
            type: String,
        },
        hand: {
            type: String,
        },
        birthcountry: {
            type: String,
        },
        team: { type: String },
        seasons: [{ type: Number }],
        positions: [{type: String}]
    });

    schema.index({ playerid: 1 });
    schema.index({ fullName: 1 });

    return mongoose.model('Player', schema, constants.dbCollections.players, {
        connection: mongoose.dbs['puckiq']
    });
};