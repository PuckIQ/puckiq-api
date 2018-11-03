'use strict';

const fs = require('fs');
const path = require('path');
const EventEmitter = require('events').EventEmitter;

let bus = new EventEmitter();

bus.init = function(locator) {
    //Bootstrap event handlers
    let handlers_path = path.join(__dirname, '../event_handlers');
    fs.readdirSync(handlers_path).forEach(function(file) {
        require(handlers_path + '/' + file)(bus, locator);
    });
};

module.exports = bus;