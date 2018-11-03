'use strict';

module.exports = function(locator) {

    let ErrorHandler = locator.get("error_handler");

    return function(req, res, next) {
        // would normally be a 299 status code however, we just want to email and forget about it.
        // Needs 500 in order for email to go.
        ErrorHandler.logAndNotify(new SamError('this endpoint has been deprecated', 'should_not_be_called', 500), req);
        next();
    };
};