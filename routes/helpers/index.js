function PuckIQHelpers() {
  "use strict";

  this.mongoQueryBuilder = function (options) {
    var queryBuilder = new Object();
    Object.keys(options).forEach(function (key) {
      if (key != 'qmethod') {
        if (isNumeric(options[key]))
          queryBuilder[key] = parseInt(options[key]);
        else
          queryBuilder[key] = options[key];
      }
    });

    return queryBuilder;
  }

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
  }

  /* Helper Functions */
  function isNumeric(n) {
    return !isNaN(n) && isFinite(n);
  }

  function isFloat(n) {
    return n % 1 === 0;
  }
}

module.exports = PuckIQHelpers;