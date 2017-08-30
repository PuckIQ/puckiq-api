var PuckIQHelper = require('../helpers');

function preCannedQueries() {
  "use strict";
  var helper = new PuckIQHelper();

  /* ------------Generic Queries------------ */
  this.getSeasonList = function (colname, collection) {
    return collection.aggregate([{ $match: { season: { $exists: true } } }, { $group: { _id: "$season" } }, { $sort: { _id: -1 } }]);
  };

  this.getSeasonCount = function (colname, collection) {
    return collection.aggregate([{ $match: { season: { $exists: true } } }, { $group: { _id: "$season", count: { $sum: 1 } } }, { $sort: { "_id.season": -1 } }]);
  };
  /* ------------Generic Queries------------ */



  /* ------------Players Queries------------ */
  this.getPlayer = function (options, colname, collection) {
    if (colname != 'players')
      throw Error(colname + ': Method not available');

    var query = helper.mongoQueryBuilder(options);
    return collection.find(query).sort({ conference: 1, division: 1 });
  }
  /* ------------Players Queries------------ */

  /* ------------Team Queries------------ */
  this.getTeam = function (options, colname, collection) {
    if(colname != 'teams')
      throw Error(colname + ': Method not available');

    var query = helper.mongoQueryBuilder(options);
    return collection.find(query).sort({season: 1, conference: 1, division: 1});
  }
  /* ------------Team Queries------------ */


  /* ------------Schedule Queries------------ */
  this.getSchedule = function(options, colname, collection) {
    if(colname != 'schedule')
      throw Error(colname + ': Method not available');

    var query = helper.mongoQueryBuilder(options);
    return collection.find(query).sort({gamedate: 1, _id: 1});
  }
  /* ------------Schedule Queries------------ */



  /* ------------Rosters Queries------------ */
  this.getGameRoster = function (options, colname, collection) {
    if (colname != 'roster')
      throw Error(colname + ': Method not available');

    var query = helper.mongoQueryBuilder(options);
    return collection.aggregate([
      { $match: query },
      { $unwind: "$roster" },
    ]);
  }
  /* ------------Rosters Queries------------ */



  /* ------------WoodMoney Queries------------ */
  this.getWoodMoney = function (options, colname, collection) {
    if (colname != 'woodmoney')
      throw Error(colname + ': Method not available');

    var query = helper.mongoQueryBuilder(options);
    return collection.aggregate([
      { $match: query },
      { $lookup: { from: 'nhlplayers', localField: "playerseasonid", foreignField: "_id", as: "playerinfo" } },
      { $unwind: "$playerinfo" },
      { $sort: { 'PlayerId': 1 } }
    ]);
  }
  /* ------------WoodMoney Queries------------ */



  /* ------------WOWY Queries------------ */
  this.getWowy = function (options, colname, collection) {
    if (colname != 'wowy')
      throw Error(colname + ': Method not available');

    var query = helper.mongoQueryBuilder(options);
    if (Object.keys(options).length > 2) {
      return collection.aggregate([
        { $match: query },
        { $lookup: { from: 'nhlplayers', localField: "playerkey1", foreignField: "_id", as: "player1info" } },
        { $lookup: { from: 'nhlplayers', localField: "playerkey2", foreignField: "_id", as: "player2info" } },
        { $unwind: "$player1info" },
        { $unwind: "$player2info" },
        { $sort: { 'Player1Id': 1, 'Player2Id': 1 } },
      ]);
    } else {
      return collection.aggregate([
        { $match: query },
        { $lookup: { from: 'nhlplayers', localField: "playerkey1", foreignField: "_id", as: "player1info" } },
        { $lookup: { from: 'nhlplayers', localField: "playerkey2", foreignField: "_id", as: "player2info" } },
        { $unwind: "$player1info" },
        { $unwind: "$player2info" },
        { $sort: { 'Player1Id': 1, 'Player2Id': 1 } },
        { $limit: 1000 }
      ]);
    }
  }
  /* ------------WOWY Queries------------ */



  /* ------------WoodWOWY Queries------------ */
  this.getWoodWowy = function (options, colname, collection) {
    if (colname != 'woodwowy')
      throw Error(colname + ': Method not available');

    var query = helper.mongoQueryBuilder(options);
    if (Object.keys(options).length > 2) {
      return collection.aggregate([
        { $match: query },
        { $lookup: { from: 'nhlplayers', localField: "playerkey1", foreignField: "_id", as: "player1info" } },
        { $lookup: { from: 'nhlplayers', localField: "playerkey2", foreignField: "_id", as: "player2info" } },
        { $unwind: "$player1info" },
        { $unwind: "$player2info" },
        { $sort: { 'Player1Id': 1, 'Player2Id': 1 } },
      ]);
    } else {
      return collection.aggregate([
        { $match: query },
        { $lookup: { from: 'nhlplayers', localField: "playerkey1", foreignField: "_id", as: "player1info" } },
        { $lookup: { from: 'nhlplayers', localField: "playerkey2", foreignField: "_id", as: "player2info" } },
        { $unwind: "$player1info" },
        { $unwind: "$player2info" },
        { $sort: { 'Player1Id': 1, 'Player2Id': 1 } },
        { $limit: 500 }
      ]);
    }
  }
  /* ------------WoodWOWY Queries------------ */
}

module.exports = preCannedQueries;