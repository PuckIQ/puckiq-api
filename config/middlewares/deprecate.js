'use strict';

const constants = require('../../common/constants');
const AppException = require('../../common/app_exception');

module.exports = function(locator) {

    let ErrorHandler = locator.get("error_handler");

    return function(req, res, next) {
        // would normally be a 299 status code however, we just want to email and forget about it.
        // Needs 500 in order for email to go.
        ErrorHandler.logAndNotify(new AppException(constants.exceptions.deprecated_request, 'This endpoint has been deprecated'), req);
        next();
    };
};