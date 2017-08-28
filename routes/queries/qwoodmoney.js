var PuckIQHelper = require('../helpers');

function preCannedQueries() {
  "use strict";
  var helper = new PuckIQHelper();

  this.qWoodMoney = function(options, collection) {
    var query = helper.mongoQueryBuilder(options);
    return collection.aggregate([
      { $match: query },
      { $lookup: { from: 'nhlplayers', localField: "playerseasonid", foreignField: "_id", as: "playerinfo" } },
      { $unwind: "$playerinfo" },
      { $sort: { 'PlayerId': 1 } }
    ]);
  }
}

module.exports = preCannedQueries;