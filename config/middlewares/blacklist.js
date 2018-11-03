'use strict';

let constants = require('../constants');
let SamException = require('../sam_exception');

module.exports = function(locator) {

    let ErrorHandler = locator.get('error_handler');
    let BlacklistService = locator.get('blacklist_service');

    return function(req, res, next) {
        BlacklistService.isBlacklisted(req, (err, result) => {
            if (err) return next(err);
            if (result) {
                ErrorHandler.log(new SamException('blacklist_rejection', 'Blacklist attempt detected', {}, { level: constants.log_levels.info }), req);
                return res.status(403).send();
            }
            next();
        });
    };

};