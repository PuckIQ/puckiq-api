'use strict';

const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const express = require('express');
const compression = require('compression');
const favicon = require('serve-favicon');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const constants = require('../common/constants');
const AppException = require('../common/app_exception');

module.exports = function(app, locator) {

    let config = locator.get('config');

    app.set('showStackError', true);

    // should be placed before express.static
    app.use(compression({
        filter: function(req, res) {
            return (/json|text|javascript|css/).test(res.getHeader('Content-Type'));
        },
        level: 9
    }));

    // setting the fav icon and static folder
    app.use(favicon(__dirname + '/../public/img/favicon.ico'));
    //TODO figure this out better
    app.use(express.static(path.join(__dirname, '/../../public'))); // path of js files

    if(config.env === 'load' || config.env === 'production') {
        app.enable('view cache');
    } else {
        app.use(morgan('dev'));
    }

    // set views path, template engine and default layout
    app.set('views', config.root + '/views');

    // enable jsonp
    app.enable('jsonp callback');

    // parse application/x-www-form-urlencoded
    app.use(bodyParser.urlencoded({ extended: true }));

    // parse application/json
    app.use(bodyParser.json());

    // parse plaintext
    app.use(bodyParser.text());

    // catch errors caused by garbled input
    app.use(function(err, req, res, next) {
        if(_.isNil(err) || !(err instanceof SyntaxError)) return next();

        error_handler.log(new AppException(constants.exceptions.invalid_request, 'Received Syntax Error parsing body content.'), { level: constants.log_levels.warn });

        if(req.xhr) {
            return res.status(500).send({ error: 'Could not parse request. Please try again.' });
        } else {
            return res.status(500).render('500');
        }
    });

    // overrides for PUT and DELETE methods
    app.use(methodOverride());

    app.disable('x-powered-by');

    // dynamic helpers
    // app.use(helpers(config.app.name));

    require('./routes')(app, locator);

    // assume "not found" in the error msgs is a 404. this is somewhat silly,
    // but valid, you can do whatever you like, set properties, use instanceof etc.
    app.use(function(err, req, res, next) {

        // Treat as 404
        if(~err.message.indexOf('not found')) return next();

        if(err.message === 'invalid csrf token') {
            ErrorHandler.log(new AppException('invalid_csrf_token', 'Invalid CSRF Token'), req);
            if(req && !req.xhr) {
                req.session.invalid_csrf = true;
                return res.redirect(req.headers.referer || '/signin');
            } else {
                return res.status(499).send();
            }
        }

        next();
    });

    app.use(require('./middlewares/exception')(locator));

    //Assume 404 since no middleware responded
    app.use(function(req, res, next) {
        res.status(404).render('404', {
            url: req.originalUrl,
            error: 'Not found'
        });
    });

};