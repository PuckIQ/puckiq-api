'use strict';

const constants = require('../../common/constants');
const AppException = require('../../common/app_exception');

module.exports = function(locator) {

    let error_handler = locator.get("error_handler");

    return function(err, req, res, next) {

        try {

            console.error(err);

            let ex = new AppException(constants.exceptions.unhandled_error, 'An error has occurred. Please try again.', { level: constants.log_levels.error });
            if(err.stack) {
                ex.stack = err.stack;
            }

            error_handler.handle(req, res, ex);

        } catch(ex) {
            try {
                error_handler.log(req, err);
            } catch(innerEx) {
                console.log('serious issue here. log and notify failed', innerEx);
            } finally {
                try {
                    res.status(500).send("An error has occurred. :(");
                } catch(ex2) {
                    // oh well, not much we can do at this point.
                    console.error('Error sending 500!', ex2.stack);
                }
            }
        }
    };
};