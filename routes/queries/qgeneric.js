function preCannedQueries() {
  "use strict";

  // Generic Queries
  this.qSeasonList = function (collection) {
    return collection.aggregate([{ $match: { season: { $exists: true } } }, { $group: { _id: "$season" } }, { $sort: { _id: -1 } }]);
  };

  this.qSeasonCount = function (collection) {
    return collection.aggregate([{ $match: { season: { $exists: true } } }, { $group: { _id: "$season", count: { $sum: 1 } } }, { $sort: { "_id.season": -1 } }]);
  };
}

module.exports = preCannedQueries;