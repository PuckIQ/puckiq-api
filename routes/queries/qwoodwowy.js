function preCannedQueries() {
  "use strict";

  this.qWoodWowy = function (options, collection) {
    var query = mongoQueryBuilder(options);
    return collection.aggregate([
      { $match: query },
      { $lookup: { from: 'nhlplayers', localField: "playerkey1", foreignField: "_id", as: "player1info" } },
      { $lookup: { from: 'nhlplayers', localField: "playerkey2", foreignField: "_id", as: "player2info" } },
      { $unwind: "$player1info" },
      { $unwind: "$player2info" },
      { $sort: { 'Player1Id': 1, 'Player2Id': 1 } },
    ]);
  }

  function mongoQueryBuilder(options) {
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

  function mongoFieldBuilder(fields) {
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

module.exports = preCannedQueries;