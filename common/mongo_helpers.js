"use strict";

const _ = require('lodash');

class MongoHelpers {

    constructor() {

    }

    mongoQueryBuilder(options) {
        let queryBuilder = new Object();
        Object.keys(options).forEach(function(key) {
            if(key !== 'qmethod' && key !== 'qtype') {
                if(_.isArray(options[key])) {
                    let qarr = new Array();
                    options[key].forEach(function(val) {
                        if(_.isNumber(val)) {
                            qarr.push(parseInt(val));
                        } else {
                            qarr.push(val);
                        }
                    });
                    queryBuilder[key] = { $in: qarr }
                } else if(_.isNumber(options[key])) {
                    queryBuilder[key] = parseInt(options[key]);
                } else {
                    queryBuilder[key] = options[key];
                }
            }
        });

        return queryBuilder;
    }

    mongoFieldBuilder(fields) {
        if(typeof fields === 'undefined')
            return {};
        else {
            let fieldBuilder = new Object();
            let fieldList = fields.split(',');
            fieldList.forEach((val) => {
                if(val === '-_id')
                    fieldBuilder[val.substr(1)] = 0;
                else
                    fieldBuilder[val] = 1;
            });
            return fieldBuilder;
        }
    }

    mongoRangeQueryBuilder(colName, options) {

        let q1 = {};
        let q2 = {};
        let dateset = false;

        Object.keys(options).forEach((name) => {
            switch(name.substr(0, 2)) {
                case 'q1':
                    if(name.substr(2, 4) === 'date') {
                        dateset = true;
                        q1[name.substr(2)] = new Date(options[name]);
                    } else if(name.substr(2) === 'team') {
                        q1['$or'] = [{ 'home': options[name] }, { 'away': options[name] }];
                    } else {
                        q1[name.substr(2)] = _.isNumeric(options[name]) ? parseInt(options[name]) : options[name];
                    }
                    break;
                case 'q2':
                    if(_.isArray(options[name])) {
                        let optArr = [];
                        for(let i = 0; i < options[name].length; i++) {
                            let d = _.isNumeric(options[name][i]) ? parseInt(options[name][i]) : options[name][i];
                            optArr.push(d);
                        }
                        q2[colName + '.' + name.substr(2)] = { $in: optArr };
                    } else {
                        q2[colName + '.' + name.substr(2)] = _.isNumber(options[name]) ? parseInt(options[name]) : options[name];
                    }
                    break;
            }
        });

        return { q1, q2, dateset };

        //let primequery = (dateset) ? { $match: { gamedate: { $gte: new Date(q1.datestart.toISOString()), $lte: new Date(q1.dateend.toISOString()) } } } : { $match: q1 };
    }


}

module.exports = MongoHelpers;