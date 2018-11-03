'use strict';

const constants = require("../../common/constants");

module.exports = function(locator) {

    const FeatureService = locator.get("feature_service");

    return function(req, res, next) {

        FeatureService.isEnabled(constants.features.maintenance, function(err, enabled) {

            if(err) return next(err);
            if(!enabled) return next();
            if(req.url.startsWith('/admin')) return next();
            if(req.url.startsWith('/alive')) return next();

            if(req.xhr) {
                return res.sendStatus(420);
            } else {
                res.status(503).render('503', {
                    layout: 'main.hbs'
                });
            }
        });
    };
};
