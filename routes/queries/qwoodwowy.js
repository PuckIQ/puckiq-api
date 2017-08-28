var PuckIQHelper = require('../helpers');

function preCannedQueries() {
  "use strict";
  var helper = new PuckIQHelper();

  this.qWoodWowy = function (options, collection) {
    var query = helper.mongoQueryBuilder(options);
    return collection.aggregate([
      { $match: query },
      { $lookup: { from: 'nhlplayers', localField: "playerkey1", foreignField: "_id", as: "player1info" } },
      { $lookup: { from: 'nhlplayers', localField: "playerkey2", foreignField: "_id", as: "player2info" } },
      { $unwind: "$player1info" },
      { $unwind: "$player2info" },
      { $sort: { 'Player1Id': 1, 'Player2Id': 1 } },
    ]);
  }
}

module.exports = preCannedQueries;