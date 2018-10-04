"use strict";

function PuckIQHelpers() {

  this.mongoQueryBuilder = function (options) {
    var queryBuilder = new Object();
    Object.keys(options).forEach(function (key) {
      if (key !== 'qmethod' && key !== 'qtype') {
        if (isArray(options[key])) {
          var qarr = new Array();
          options[key].forEach(function (val) {
            if (isNumeric(val)) {
              qarr.push(parseInt(val));
            } else {
              qarr.push(val);
            }
          });
          queryBuilder[key] = { $in: qarr }
        } else if (isNumeric(options[key])) {
          queryBuilder[key] = parseInt(options[key]);
        } else {
          queryBuilder[key] = options[key];
        }
      }
    });

    return queryBuilder;
  };

  this.mongoFieldBuilder = function (fields) {
    if (typeof fields === 'undefined')
      return {};
    else {
      var fieldBuilder = new Object();
      var fieldList = fields.split(',');
      fieldList.forEach((val) => {
        if (val === '-_id')
          fieldBuilder[val.substr(1)] = 0;
        else
          fieldBuilder[val] = 1;
      });
      return fieldBuilder;
    }
  };

  this.mongoRangeQueryBuilder = function (colName, options) {

    var q1 = {};
    var q2 = {};
    var dateset = false;

    Object.keys(options).forEach((name) => {
      switch (name.substr(0, 2)) {
        case 'q1':
          if (name.substr(2, 4) === 'date') {
            dateset = true;
            q1[name.substr(2)] = new Date(options[name]);
          } else if (name.substr(2) === 'team') {
            q1['$or'] = [{ 'home': options[name] }, { 'away': options[name] }];
          } else {
            q1[name.substr(2)] = isNumeric(options[name]) ? parseInt(options[name]) : options[name];
          }
          break;
        case 'q2':
          if (isArray(options[name])) {
            var optArr = [];
            for (var i = 0; i < options[name].length; i++) {
              var d = isNumeric(options[name][i]) ? parseInt(options[name][i]) : options[name][i];
              optArr.push(d);
            }
            q2[colName + '.' + name.substr(2)] = { $in: optArr };
          } else {
            q2[colName + '.' + name.substr(2)] = isNumeric(options[name]) ? parseInt(options[name]) : options[name];
          }
          break;
      }
    });

    return {q1, q2, dateset};

    //var primequery = (dateset) ? { $match: { gamedate: { $gte: new Date(q1.datestart.toISOString()), $lte: new Date(q1.dateend.toISOString()) } } } : { $match: q1 };
  };

  /* Helper Functions */
  function isNumeric(n) {
    return !isNaN(n) && isFinite(n);
  }

  function isFloat(n) {
    return n % 1 === 0;
  }

  function isArray(n) {
    return Array.isArray(n);
  }
}

module.exports = PuckIQHelpers;