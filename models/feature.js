'use strict';

let _ = require('lodash');
let constants = require('../common/constants');

module.exports = function(mongoose) {

    let Schema = mongoose.Schema;

    let schema = new Schema({
        name: {
            type: String,
            enum: {
                values: _.values(constants.features),
                message: 'Invalid feature.'
            },
            required: true
        },
        enabled: {
            type: Boolean,
            default: false
        },
        updated: {
            type: Date,
            default: Date.now
        }
    });

    schema.index({ name: 1 });

    return mongoose.model('Feature', schema, null, {
        connection: mongoose.dbs['puckiq']
    });
};