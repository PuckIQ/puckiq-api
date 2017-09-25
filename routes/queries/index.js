var round = require('mongo-round');
var config = require('../../config');
var PuckIQHelper = require('../helpers');

function preCannedQueries() {
  "use strict";
  var helper = new PuckIQHelper();

  /* ------------Generic Queries------------ */
  // Use these methods in conjunction with /g
  this.getSeasonList = function (colname, collection) {
    return collection.aggregate([{ $match: { season: { $exists: true } } }, { $group: { _id: "$season" } }, { $sort: { _id: -1 } }]);
  };

  this.getSeasonCount = function (colname, collection) {
    return collection.aggregate([{ $match: { season: { $exists: true } } }, { $group: { _id: "$season", count: { $sum: 1 } } }, { $sort: { "_id": -1 } }]);
  };
  /* ------------Generic Queries------------ */



  /* ------------Schedule Queries------------ */
  // Use these methods in conjunction with /s/schedule
  this.getSchedule = function (options, colname, collection) {
    if (colname != 'schedule')
      throw Error(colname + ': Method not available');

    var query = helper.mongoQueryBuilder(options);
    return collection.find(query).sort({ gamedate: 1, _id: 1 });
  }

  this.getTeamSchedule = function (options, colname, collection) {
    if (colname != 'schedule')
      throw Error(colname + ': Method not available');

    var season = parseInt(options.season);
    var team = options.tm;
    return collection.find({ season: season, $or: [{ home: team }, { away: team }] });
  }
  /* ------------Schedule Queries------------ */



  /* ------------Team Queries------------ */
  // Use these methods in conjunction with /t/teams
  this.getTeam = function (options, colname, collection) {
    if (colname != 'teams')
      throw Error(colname + ': Method not available');

    var query = helper.mongoQueryBuilder(options);
    return collection.find(query).sort({ season: 1, conference: 1, division: 1 });
  }

  this.getTeamList = function (colname, collection) {
    if (colname != 'teams')
      throw Error(colname + ': Method not available');

    return collection.find().sort({ season: 1, conference: 1, division: 1 });
  }

  this.getTeamSearch = function (options, colname, collection) {
    if (colname != 'teams')
      throw Error(colname + ': Method not available');

    var regex = new RegExp('^' + options.abbr + '.*', 'i');

    return collection.aggregate([
      { $match: { abbr: regex } },
      { $group: { _id: { name: '$abbr' } } },
      { $project: { team: '$_id.name', _id: 0 } }
    ]);
  }
  /* ------------Team Queries------------ */



  /* ------------Players Queries------------ */
  // Use these methods in conjunction with /p/players
  this.getPlayer = function (options, colname, collection) {
    if (colname != 'players')
      throw Error(colname + ': Method not available');

    var query = helper.mongoQueryBuilder(options);
    return collection.find(query).sort({ conference: 1, division: 1 });
  }

  this.getPlayerSearch = function (options, colname, collection) {
    if (colname != 'players')
      throw Error(colname + ': Method not available');

    var regex = new RegExp('.*' + options.fullName + '.*', 'i');

    return collection.aggregate([
      { $match: { fullName: regex } },
      { $group: { _id: { fullName: '$fullName', playerid: '$playerid' } } },
      { $limit: 10 },
      { $project: { fullName: '$_id.fullName', playerid: '$_id.playerid', _id: 0 } }
    ]);
  }
  /* ------------Players Queries------------ */



  /* ------------Rosters Queries------------ */
  // Use these methods in conjunction with /r/roster
  this.getGameRoster = function (options, colname, collection) {
    if (colname != 'roster')
      throw Error(colname + ': Method not available');

    var query = helper.mongoQueryBuilder(options);
    return collection.aggregate([
      { $match: query },
      { $unwind: "$roster" },
    ]);
  }

  this.getRosters = function (options, colname, collection) {
    if (colname != 'roster')
      throw Error(colname + ': Method not available');

    var query = helper.mongoQueryBuilder(options);
    return collection.aggregate([
      { $unwind: "$roster" },
      { $project: { _id: 1, season: 1, gamedate: 1, gamestart: 1, jerseynum: '$roster.jerseynum', playerseasonid: '$roster.playerseasonid' } },
      { $lookup: { from: config.dbCollections.players, localField: "playerseasonid", foreignField: "_id", as: "playerseasonid" } },
      { $unwind: "$playerseasonid" },
      { $project: { _id: 1, season: 1, gamedate: 1, gamestart: 1, jerseynum: 1, playerseasonid: "$playerseasonid._id", playerid: "$playerseasonid.playerid", teamseasonid: "$playerseasonid.teamseasonid", team: "$playerseasonid.teamabbr", fullName: "$playerseasonid.fullName", firstName: "$playerseasonid.firstName", lastName: "$playerseasonid.lastName", pos: "$playerseasonid.position", possible: "$playerseasonid.possible", conference: "$playerseasonid.conference", division: "$playerseasonid.division" } },
      { $match: query }
    ]);
  }
  /* ------------Rosters Queries------------ */



  /* ------------WoodMoney Queries------------ */
  // Use these methods in conjunction with /wm/woodmoney
  this.getWoodMoney = function (options, colname, collection) {
    if (colname != 'woodmoney')
      throw Error(colname + ': Method not available');

    var query = helper.mongoQueryBuilder(options);
    console.log(query);
    return collection.aggregate([
      { $match: query },
      { $lookup: { from: 'nhlplayers', localField: "playerseasonid", foreignField: "_id", as: "playerinfo" } },
      { $unwind: "$playerinfo" },
      { $sort: { 'PlayerId': 1 } }
    ]);
  }
  /* ------------WoodMoney Queries------------ */



  /* ------------WOWY Queries------------ */
  // Use these methods in conjunction with /w/wowy
  this.getSeasonWowy = function (options, colname, collection) {
    if (colname != 'seasonwowy')
      throw Error(colname + ': Method not available');

    var query = helper.mongoQueryBuilder(options);
    console.log(query);
    if (Object.keys(options).length > 2) {
      return collection.aggregate([
        { $match: query },
        { $lookup: { from: 'nhlplayers', localField: "playerkey1", foreignField: "_id", as: "player1info" } },
        { $lookup: { from: 'nhlplayers', localField: "playerkey2", foreignField: "_id", as: "player2info" } },
        { $unwind: "$player1info" },
        { $unwind: "$player2info" },
        { $sort: { 'player1id': 1, 'player2id': 1 } },
      ]);
    } else {
      return collection.aggregate([
        { $match: query },
        { $lookup: { from: 'nhlplayers', localField: "playerkey1", foreignField: "_id", as: "player1info" } },
        { $lookup: { from: 'nhlplayers', localField: "playerkey2", foreignField: "_id", as: "player2info" } },
        { $unwind: "$player1info" },
        { $unwind: "$player2info" },
        { $sort: { 'player1id': 1, 'player2id': 1 } },
        { $limit: 1000 }
      ]);
    }
  }

  // Although this is a WOWY calculation it uses the schedule collection as its base
  /*this.getRangeWowy = function (options, colname, collection) {
    if (colname != 'schedule')
      throw Error(colname + ': Method not available');

    var q1 = new Object();
    var q2 = new Object();
    var dateset = false;

    Object.keys(options).forEach((name) => {
      if (name != 'qtype' && name != 'qmethod') {
        if (name.substr(0, 2) === 'q1') {
          if (name.substr(2, 4) === 'date') {
            dateset = true;
            q1[name.substr(2)] = new Date(options[name]);
          } else if (name.substr(2) === 'team') {
            q1['$or'] = [{ 'home': options[name] }, { 'away': options[name] }];
          } else {
            q1[name.substr(2)] = isNumeric(options[name]) ? parseInt(options[name]) : options[name];
          }
        } else {
          q2['wowy.' + name.substr(2)] = isNumeric(options[name]) ? parseInt(options[name]) : options[name];
        }
      }
    });

    var primequery = (dateset) ? { $match: { gamedate: { $gte: new Date(q1.datestart.toISOString()), $lte: new Date(q1.dateend.toISOString()) } } } : { $match: q1 };

    return collection.aggregate([
      primequery,
      { $lookup: { from: config.dbCollections.gamewowy, localField: '_id', foreignField: 'gameid', as: 'wowy' } },
      { $unwind: '$wowy' },
      { $match: q2 },
      { $lookup: { from: config.dbCollections.players, localField: 'wowy.playerkey1', foreignField: '_id', as: 'player1info' } },
      { $lookup: { from: config.dbCollections.players, localField: 'wowy.playerkey2', foreignField: '_id', as: 'player2info' } },
      { $unwind: '$player1info' },
      { $unwind: '$player2info' },
      {
        $group: {
          _id: {
            type: '$wowy.recordtype',
            team: '$wowy.team',
            season: '$wowy.season',
            gametype: '$wowy.gametype',
            player1: '$player1info',
            player2: '$player2info'
          },
          cf: { $sum: '$wowy.cf' },
          ca: { $sum: '$wowy.ca' },
          gf: { $sum: '$wowy.gf' },
          ga: { $sum: '$wowy.ga' },
          ff: { $sum: '$wowy.ff' },
          fa: { $sum: '$wowy.fa' },
          sf: { $sum: '$wowy.sf' },
          sa: { $sum: '$wowy.sa' },
          oz: { $sum: '$wowy.oz' },
          dz: { $sum: '$wowy.dz' },
          nz: { $sum: '$wowy.nz' },
          dff: { $sum: '$wowy.dff' },
          dfa: { $sum: '$wowy.dfa' },
          sacf: { $sum: '$wowy.sacf' },
          saca: { $sum: '$wowy.saca' },
          evtoi: { $sum: '$wowy.evtoi' },
        }
      },
      {
        $project: {
          _id: 0, type: '$_id.type', team: '$_id.team', season: '$_id.season', gametype: '$_id.gametype', player1: '$_id.player1', player2: '$_id.player2',
          cf: 1, ca: 1, ff: 1, fa: 1, sf: 1, sa: 1, gf: 1, ga: 1, dff: 1, dfa: 1, sacf: 1, saca: 1, evtoi: 1, oz: 1, nz: 1, dz: 1,
          cfpct: {
            $cond: { if: { $gt: [{ $add: ['$cf', '$ca'] }, 0] }, then: round({ $multiply: [{ $divide: ['$cf', { $add: ['$cf', '$ca'] }] }, 100] }, 1), else: 0 }
          },
          cf60: {
            $cond: { if: { $gt: ['$evtoi', 0] }, then: round({ $divide: [{ $multiply: ['$cf', 3600] }, '$evtoi'] }, 1), else: 0 }
          },
          ca60: {
            $cond: { if: { $gt: ['$evtoi', 0] }, then: round({ $divide: [{ $multiply: ['$ca', 3600] }, '$evtoi'] }, 1), else: 0 }
          },
          ffpct: {
            $cond: { if: { $gt: [{ $add: ['$ff', '$fa'] }, 0] }, then: round({ $multiply: [{ $divide: ['$ff', { $add: ['$ff', '$fa'] }] }, 100] }, 1), else: 0 }
          },
          ff60: {
            $cond: { if: { $gt: ['$evtoi', 0] }, then: round({ $divide: [{ $multiply: ['$ff', 3600] }, '$evtoi'] }, 1), else: 0 }
          },
          fa60: {
            $cond: { if: { $gt: ['$evtoi', 0] }, then: round({ $divide: [{ $multiply: ['$fa', 3600] }, '$evtoi'] }, 1), else: 0 }
          },
          sfpct: {
            $cond: { if: { $gt: [{ $add: ['$sf', '$sa'] }, 0] }, then: round({ $multiply: [{ $divide: ['$sf', { $add: ['$sf', '$sa'] }] }, 100] }, 1), else: 0 }
          },
          sf60: {
            $cond: { if: { $gt: ['$evtoi', 0] }, then: round({ $divide: [{ $multiply: ['$sf', 3600] }, '$evtoi'] }, 1), else: 0 }
          },
          sa60: {
            $cond: { if: { $gt: ['$evtoi', 0] }, then: round({ $divide: [{ $multiply: ['$sa', 3600] }, '$evtoi'] }, 1), else: 0 }
          },
          gfpct: {
            $cond: { if: { $gt: [{ $add: ['$gf', '$ga'] }, 0] }, then: round({ $multiply: [{ $divide: ['$gf', { $add: ['$gf', '$ga'] }] }, 100] }, 1), else: 0 }
          },
          gf60: {
            $cond: { if: { $gt: ['$evtoi', 0] }, then: round({ $divide: [{ $multiply: ['$gf', 3600] }, '$evtoi'] }, 1), else: 0 }
          },
          ga60: {
            $cond: { if: { $gt: ['$evtoi', 0] }, then: round({ $divide: [{ $multiply: ['$ga', 3600] }, '$evtoi'] }, 1), else: 0 }
          },
          dffpct: {
            $cond: { if: { $gt: [{ $add: ['$dff', '$dfa'] }, 0] }, then: round({ $multiply: [{ $divide: ['$dff', { $add: ['$dff', '$dfa'] }] }, 100] }, 1), else: 0 }
          },
          dff60: {
            $cond: { if: { $gt: ['$evtoi', 0] }, then: round({ $divide: [{ $multiply: ['$dff', 3600] }, '$evtoi'] }, 1), else: 0 }
          },
          dfa60: {
            $cond: { if: { $gt: ['$evtoi', 0] }, then: round({ $divide: [{ $multiply: ['$dfa', 3600] }, '$evtoi'] }, 1), else: 0 }
          },
          sacfpct: {
            $cond: { if: { $gt: [{ $add: ['$sacf', '$saca'] }, 0] }, then: round({ $multiply: [{ $divide: ['$sacf', { $add: ['$sacf', '$saca'] }] }, 100] }, 1), else: 0 }
          },
          sacf60: {
            $cond: { if: { $gt: ['$evtoi', 0] }, then: round({ $divide: [{ $multiply: ['$sacf', 3600] }, '$evtoi'] }, 1), else: 0 }
          },
          saca60: {
            $cond: { if: { $gt: ['$evtoi', 0] }, then: round({ $divide: [{ $multiply: ['$saca', 3600] }, '$evtoi'] }, 1), else: 0 }
          },
          ozpct: {
            $cond: { if: { $gt: [{ $add: ['$oz', '$nz', '$dz'] }, 0] }, then: round({ $multiply: [{ $divide: ['$oz', { $add: ['$oz', '$nz', '$dz'] }] }, 100] }, 1), else: 0 }
          },
          oz60: {
            $cond: { if: { $gt: ['$evtoi', 0] }, then: round({ $divide: [{ $multiply: ['$oz', 3600] }, '$evtoi'] }, 1), else: 0 }
          },
          nzpct: {
            $cond: { if: { $gt: [{ $add: ['$oz', '$nz', '$dz'] }, 0] }, then: round({ $multiply: [{ $divide: ['$nz', { $add: ['$oz', '$nz', '$dz'] }] }, 100] }, 1), else: 0 }
          },
          nz60: {
            $cond: { if: { $gt: ['$evtoi', 0] }, then: round({ $divide: [{ $multiply: ['$nz', 3600] }, '$evtoi'] }, 1), else: 0 }
          },
          dzpct: {
            $cond: { if: { $gt: [{ $add: ['$oz', '$nz', '$dz'] }, 0] }, then: round({ $multiply: [{ $divide: ['$dz', { $add: ['$oz', '$nz', '$dz'] }] }, 100] }, 1), else: 0 }
          },
          dz60: {
            $cond: { if: { $gt: ['$evtoi', 0] }, then: round({ $divide: [{ $multiply: ['$dz', 3600] }, '$evtoi'] }, 1), else: 0 }
          },
        }
      },
      {
        $sort: { evtoi: -1 }
      }
    ],
      { allowDiskUse: true }
    );
  }*/

  this.getRangeWowy = function (options, colname, collection) {
    if (colname != 'schedule')
      throw Error(colname + ': Method not available');

    var q1 = new Object();
    var q2 = new Object();
    var dateset = false;

    Object.keys(options).forEach((name) => {
      if (name != 'qtype' && name != 'qmethod') {
        if (name.substr(0, 2) === 'q1') {
          if (name.substr(2, 4) === 'date') {
            dateset = true;
            q1[name.substr(2)] = new Date(options[name]);
          } else if (name.substr(2) === 'team') {
            q1['$or'] = [{ 'home': options[name] }, { 'away': options[name] }];
          } else {
            q1[name.substr(2)] = isNumeric(options[name]) ? parseInt(options[name]) : options[name];
          }
        } else {
          q2['wowy.' + name.substr(2)] = isNumeric(options[name]) ? parseInt(options[name]) : options[name];
        }
      }
    });

    var primequery = (dateset) ? { $match: { gamedate: { $gte: new Date(q1.datestart.toISOString()), $lte: new Date(q1.dateend.toISOString()) } } } : { $match: q1 };

    return collection.aggregate([
      primequery,
      { $lookup: { from: config.dbCollections.gamewowy, localField: '_id', foreignField: 'gameid', as: 'wowy' } },
      { $unwind: '$wowy' },
      { $match: q2 },
      { $lookup: { from: config.dbCollections.players, localField: 'wowy.playerkey1', foreignField: '_id', as: 'wowy.player1info' } },
      { $lookup: { from: config.dbCollections.players, localField: 'wowy.playerkey2', foreignField: '_id', as: 'wowy.player2info' } },
      { $unwind: '$wowy.player1info' },
      { $unwind: '$wowy.player2info' },
      {
        $group: {
          _id: {
            p1id: '$wowy.player1info.playerid',
            p1fullname: '$wowy.player1info.fullName',
            p1firstname: '$wowy.player1info.firstName',
            p1lastname: '$wowy.player1info.lastName',
            p1possible: '$wowy.player1info.possible',
            p2id: '$wowy.player2info.playerid',
            p2fullname: '$wowy.player2info.fullName',
            p2firstname: '$wowy.player2info.firstName',
            p2lastname: '$wowy.player2info.lastName',
            p2possible: '$wowy.player2info.possible',
            wowytype: '$wowy.recordtype',
            team: '$wowy.team',
          },
          cf: { $sum: '$wowy.cf' },
          ca: { $sum: '$wowy.ca' },
          gf: { $sum: '$wowy.gf' },
          ga: { $sum: '$wowy.ga' },
          ff: { $sum: '$wowy.ff' },
          fa: { $sum: '$wowy.fa' },
          sf: { $sum: '$wowy.sf' },
          sa: { $sum: '$wowy.sa' },
          oz: { $sum: '$wowy.oz' },
          dz: { $sum: '$wowy.dz' },
          nz: { $sum: '$wowy.nz' },
          dff: { $sum: '$wowy.dff' },
          dfa: { $sum: '$wowy.dfa' },
          sacf: { $sum: '$wowy.sacf' },
          saca: { $sum: '$wowy.saca' },
          evtoi: { $sum: '$wowy.evtoi' }
        }
      },
      {
        $group: {
          _id: {
            p1id: '$_id.p1id',
            p2id: '$_id.p2id'
          },
          wowy: {
            $push: {
              pinfo: '$_id',
              cf: '$cf',
              ca: '$ca',
              cfpct: { $cond: { if: { $gt: [{ $add: ['$cf', '$ca'] }, 0] }, then: { $multiply: [{ $divide: ['$cf', { $add: ['$cf', '$ca'] }] }, 100] }, else: 0 } },
              cf60: { $cond: { if: { $gt: ['$evtoi', 0] }, then: { $divide: [{ $multiply: ['$cf', 3600] }, '$evtoi'] }, else: 0 } },
              ca60: { $cond: { if: { $gt: ['$evtoi', 0] }, then: { $divide: [{ $multiply: ['$ca', 3600] }, '$evtoi'] }, else: 0 } },
              gf: '$gf',
              ga: '$ga',
              gfpct: { $cond: { if: { $gt: [{ $add: ['$gf', '$ga'] }, 0] }, then: { $multiply: [{ $divide: ['$gf', { $add: ['$gf', '$ga'] }] }, 100] }, else: 0 } },
              gf60: { $cond: { if: { $gt: ['$evtoi', 0] }, then: { $divide: [{ $multiply: ['$gf', 3600] }, '$evtoi'] }, else: 0 } },
              ga60: { $cond: { if: { $gt: ['$evtoi', 0] }, then: { $divide: [{ $multiply: ['$ga', 3600] }, '$evtoi'] }, else: 0 } },
              ff: '$ff',
              fa: '$fa',
              ffpct: { $cond: { if: { $gt: [{ $add: ['$ff', '$fa'] }, 0] }, then: { $multiply: [{ $divide: ['$ff', { $add: ['$ff', '$fa'] }] }, 100] }, else: 0 } },
              ff60: { $cond: { if: { $gt: ['$evtoi', 0] }, then: { $divide: [{ $multiply: ['$ff', 3600] }, '$evtoi'] }, else: 0 } },
              fa60: { $cond: { if: { $gt: ['$evtoi', 0] }, then: { $divide: [{ $multiply: ['$fa', 3600] }, '$evtoi'] }, else: 0 } },
              sf: '$sf',
              sa: '$sa',
              sfpct: { $cond: { if: { $gt: [{ $add: ['$sf', '$sa'] }, 0] }, then: { $multiply: [{ $divide: ['$sf', { $add: ['$sf', '$sa'] }] }, 100] }, else: 0 } },
              sf60: { $cond: { if: { $gt: ['$evtoi', 0] }, then: { $divide: [{ $multiply: ['$sf', 3600] }, '$evtoi'] }, else: 0 } },
              sa60: { $cond: { if: { $gt: ['$evtoi', 0] }, then: { $divide: [{ $multiply: ['$sa', 3600] }, '$evtoi'] }, else: 0 } },
              oz: '$oz',
              ozpct: { $cond: { if: { $gt: [{ $add: ['$oz', '$nz', '$dz'] }, 0] }, then: { $multiply: [{ $divide: ['$oz', { $add: ['$oz', '$nz', '$dz'] }] }, 100] }, else: 0 } },
              oz60: { $cond: { if: { $gt: ['$evtoi', 0] }, then: { $divide: [{ $multiply: ['$oz', 3600] }, '$evtoi'] }, else: 0 } },
              dz: '$dz',
              dzpct: { $cond: { if: { $gt: [{ $add: ['$oz', '$nz', '$dz'] }, 0] }, then: { $multiply: [{ $divide: ['$dz', { $add: ['$oz', '$nz', '$dz'] }] }, 100] }, else: 0 } },
              dz60: { $cond: { if: { $gt: ['$evtoi', 0] }, then: { $divide: [{ $multiply: ['$dz', 3600] }, '$evtoi'] }, else: 0 } },
              nz: '$nz',
              nzpct: { $cond: { if: { $gt: [{ $add: ['$oz', '$nz', '$dz'] }, 0] }, then: { $multiply: [{ $divide: ['$nz', { $add: ['$oz', '$nz', '$dz'] }] }, 100] }, else: 0 } },
              nz60: { $cond: { if: { $gt: ['$evtoi', 0] }, then: { $divide: [{ $multiply: ['$nz', 3600] }, '$evtoi'] }, else: 0 } },
              dff: '$dff',
              dfa: '$dfa',
              dffpct: { $cond: { if: { $gt: [{ $add: ['$dff', '$dfa'] }, 0] }, then: { $multiply: [{ $divide: ['$dff', { $add: ['$dff', '$dfa'] }] }, 100] }, else: 0 } },
              dff60: { $cond: { if: { $gt: ['$evtoi', 0] }, then: { $divide: [{ $multiply: ['$dff', 3600] }, '$evtoi'] }, else: 0 } },
              dfa60: { $cond: { if: { $gt: ['$evtoi', 0] }, then: { $divide: [{ $multiply: ['$dfa', 3600] }, '$evtoi'] }, else: 0 } },
              sacf: '$sacf',
              saca: '$saca',
              sacfpct: { $cond: { if: { $gt: [{ $add: ['$sacf', '$saca'] }, 0] }, then: { $multiply: [{ $divide: ['$sacf', { $add: ['$sacf', '$saca'] }] }, 100] }, else: 0 } },
              sacf60: { $cond: { if: { $gt: ['$evtoi', 0] }, then: { $divide: [{ $multiply: ['$sacf', 3600] }, '$evtoi'] }, else: 0 } },
              saca60: { $cond: { if: { $gt: ['$evtoi', 0] }, then: { $divide: [{ $multiply: ['$saca', 3600] }, '$evtoi'] }, else: 0 } },
              evtoi: '$evtoi',
            }
          }
        }
      }
    ], { allowDiskUse: true });
  };
  /* ------------WOWY Queries------------ */



  /* ------------WoodWOWY Queries------------ */
  // Use these methods in conjunction with /w/woodmoney
  this.getWoodWowy = function (options, colname, collection) {
    if (colname != 'woodwowy')
      throw Error(colname + ': Method not available');

    var query = helper.mongoQueryBuilder(options);
    if (Object.keys(options).length > 2) {
      return collection.aggregate([
        { $match: query },
        { $lookup: { from: config.dbCollections.players, localField: "playerkey1", foreignField: "_id", as: "player1info" } },
        { $lookup: { from: config.dbCollections.players, localField: "playerkey2", foreignField: "_id", as: "player2info" } },
        { $unwind: "$player1info" },
        { $unwind: "$player2info" },
        { $sort: { 'Player1Id': 1, 'Player2Id': 1 } },
      ]);
    } else {
      return collection.aggregate([
        { $match: query },
        { $lookup: { from: config.dbCollections.players, localField: "playerkey1", foreignField: "_id", as: "player1info" } },
        { $lookup: { from: config.dbCollections.players, localField: "playerkey2", foreignField: "_id", as: "player2info" } },
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

function isNumeric(n) {
  return !isNaN(n) && isFinite(n);
}