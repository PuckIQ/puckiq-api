"use strict";

const _ = require('lodash');

const PCT_MULTIPLIER = 100;
const safeDivide = (x, y) => {
    if(y === 0) return 0;
    return x/y;
};

exports.calculateFieldsFor = (x) => {

    const hours = x.evtoi / 3600;

    x.cf60 = safeDivide(x.cf, hours);
    x.ca60 = safeDivide(x.ca, hours);
    x.cfpct = safeDivide(x.cf, x.cf + x.ca) * PCT_MULTIPLIER;
    x.dff60 = safeDivide(x.dff, hours);
    x.dfa60 = safeDivide(x.dfa, hours);
    x.dffpct = safeDivide(x.dff, x.dff + x.dfa) * PCT_MULTIPLIER;
    x.gf60 = safeDivide(x.gf, hours);
    x.ga60 = safeDivide(x.ga, hours);
    x.gfpct = safeDivide(x.gf, x.gf + x.ga) * PCT_MULTIPLIER;
    x.sf60 = safeDivide(x.sf, hours);
    x.sa60 = safeDivide(x.sa, hours);
    x.sfpct = safeDivide(x.sf, x.sf + x.sa) * PCT_MULTIPLIER;
    x.ff60 = safeDivide(x.ff, hours);
    x.fa60 = safeDivide(x.fa, hours);
    x.ffpct = safeDivide(x.ff, x.ff + x.fa) * PCT_MULTIPLIER;
    x.sacf60 = safeDivide(x.sacf, hours);
    x.saca60 = safeDivide(x.saca, hours);
    x.sacfpct = safeDivide(x.sacf, x.sacf + x.saca) * PCT_MULTIPLIER;
};