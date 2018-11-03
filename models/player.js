'use strict';

let _ = require('lodash');
let constants = require('../common/constants');

module.exports = function(mongoose, config) {

    let Schema = mongoose.Schema;

    let schema = new Schema({
        playerid: {
            type: String,
            required: true
        },
        teamseasonid: {
            type: String,
            required: true
        },
        teamabbr: {
            type: String,
            required: true
        },
        teampxp: {
            type: String,
            required: true
        },
        fullName: {
            type: String,
            required: true
        },
        firstName: {
            type: String,
            required: true
        },
        lastName: {
            type: String,
            required: true
        },
        position: {
            type: String,
            required: true
        },
        type: {
            type: String,
            required: true
        },
        conference: {
            type: String,
            required: true
        },
        division: {
            type: String,
            required: true
        },
        season: {
            type: String,
            required: true
        },
        possible: [{
            type: String,
            required: true
        }]
    });

    schema.index({ playerid: 1 });
    schema.index({ fullname: 1 });


    return mongoose.model('Player', schema, config.dbs.players, {
        connection: mongoose.dbs['puckiq']
    });
};