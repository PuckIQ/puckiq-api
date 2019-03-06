"use strict";

const config = require('../../config')['local']; //todo

const round = require('mongo-round');
const PuckIQHelper = require('../helpers');

function preCannedQueries() {

    let helper = new PuckIQHelper();

    //#region Generic Queries
    // Use these methods in conjunction with /g
    this.getSeasonList = function(colname, collection) {
        return collection.aggregate([
            { $match: { season: { $exists: true } } },
            { $group: { _id: "$season" } },
            { $sort: { _id: -1 } }]);
    };

    this.getSeasonCount = function(colname, collection) {
        return collection.aggregate([
            { $match: { season: { $exists: true } } },
            { $group: { _id: "$season", count: { $sum: 1 } } },
            { $sort: { "_id": -1 } }]);
    };
    //#endregion

    //#region Schedule Queries
    // Use these methods in conjunction with /s/schedule
    this.getSchedule = function(options, colname, collection) {

        if(colname !== 'schedule')
            throw Error(colname + ': Method not available');

        let query = helper.mongoQueryBuilder(options);
        return collection.find(query).sort({ gamedate: 1, _id: 1 });
    };

    this.getTeamSchedule = function(options, colname, collection) {

        if(colname !== 'schedule')
            throw Error(colname + ': Method not available');

        let season = parseInt(options.season);
        let team = options.tm;
        return collection.find({ season: season, $or: [{ home: team }, { away: team }] });
    };
    //#endregion

    //#region Team Queries
    // Use these methods in conjunction with /t/teams
    this.getTeam = function(options, colname, collection) {

        if(colname !== 'teams')
            throw Error(colname + ': Method not available');

        let query = helper.mongoQueryBuilder(options);
        return collection.find(query).sort({ season: 1, conference: 1, division: 1 });
    };

    this.getTeamList = function(colname, collection) {

        if(colname !== 'teams')
            throw Error(colname + ': Method not available');

        return collection.find().sort({ season: 1, conference: 1, division: 1 });
    };

    this.getTeamSearch = function(options, colname, collection) {

        if(colname !== 'teams')
            throw Error(colname + ': Method not available');

        let regex = new RegExp('^' + options.abbr + '.*', 'i');

        return collection.aggregate([
            { $match: { abbr: regex } },
            { $group: { _id: { name: '$abbr' } } },
            { $project: { team: '$_id.name', _id: 0 } }
        ]);
    };

    this.getTeamStats = function(colname, collection) {

        if(colname !== 'teamstats')
            throw Error(colname + ": Method not available");

        return collection.find({}, { _id: 0 }).sort({ team: 1 });
    };
    //#endregion

    //#region Player Queries
    // Use these methods in conjunction with /p/players
    this.getPlayer = function(options, colname, collection) {

        if(colname !== 'players')
            throw Error(colname + ': Method not available');

        let query = helper.mongoQueryBuilder(options);
        return collection.find(query).sort({ conference: 1, division: 1 });
    };

    this.getPlayerSearch = function(options, colname, collection) {

        if(colname !== 'players')
            throw Error(colname + ': Method not available');

        let regex = new RegExp('.*' + options.fullName + '.*', 'i');

        return collection.aggregate([
            { $match: { fullName: regex } },
            { $group: { _id: { fullName: '$fullName', playerid: '$playerid' } } },
            { $limit: 10 },
            { $project: { fullName: '$_id.fullName', playerid: '$_id.playerid', _id: 0 } }
        ]);
    };

    this.getAllPlayers = function(colname, collection) {

        if(colname !== 'players')
            throw Error(colname + ": Method not available");

        return collection.aggregate([
            {
                $group: {
                    _id: {
                        playerid: "$playerid",
                        fullName: "$fullName"
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    playerid: "$_id.playerid",
                    fullName: "$_id.fullName"
                }
            }
        ])
    };
    //#endregion

    //#region Roster Queries
    // Use these methods in conjunction with /r/roster
    this.getGameRoster = function(options, colname, collection) {

        if(colname !== 'roster')
            throw Error(colname + ': Method not available');

        let query = helper.mongoQueryBuilder(options);
        return collection.aggregate([
            { $match: query },
            { $unwind: "$roster" },
        ]);
    };

    this.getRosters = function(options, colname, collection) {

        if(colname !== 'roster')
            throw Error(colname + ': Method not available');

        let query = helper.mongoQueryBuilder(options);
        return collection.aggregate([
            { $unwind: "$roster" },
            {
                $project: {
                    _id: 1,
                    season: 1,
                    gamedate: 1,
                    gamestart: 1,
                    jerseynum: '$roster.jerseynum',
                    playerseasonid: '$roster.playerseasonid'
                }
            },
            {
                $lookup: {
                    from: constants.dbCollections.nhlplayers,
                    localField: "playerseasonid",
                    foreignField: "_id",
                    as: "playerseasonid"
                }
            },
            { $unwind: "$playerseasonid" },
            {
                $project: {
                    _id: 1,
                    season: 1,
                    gamedate: 1,
                    gamestart: 1,
                    jerseynum: 1,
                    playerseasonid: "$playerseasonid._id",
                    playerid: "$playerseasonid.playerid",
                    teamseasonid: "$playerseasonid.teamseasonid",
                    team: "$playerseasonid.teamabbr",
                    fullName: "$playerseasonid.fullName",
                    firstName: "$playerseasonid.firstName",
                    lastName: "$playerseasonid.lastName",
                    pos: "$playerseasonid.position",
                    possible: "$playerseasonid.possible",
                    conference: "$playerseasonid.conference",
                    division: "$playerseasonid.division"
                }
            },
            { $match: query }
        ]);
    };

    //#endregion

    //#region WoodMoney Queries

    // Use these methods in conjunction with /wm/woodmoney
    this.getSeasonWoodMoney = function(options, colname, collection) {

        if(colname !== 'seasonwoodmoney')
            throw Error(colname + ': Method not available');

        let query = helper.mongoQueryBuilder(options);

        return collection.aggregate([
            { $match: query },
            {
                $lookup: {
                    from: constants.dbCollections.nhlplayers,
                    localField: "playerkey",
                    foreignField: "_id",
                    as: "playerinfo"
                }
            },
            { $unwind: "$playerinfo" },
            {
                $group: {
                    _id: {
                        pid: '$playerinfo.playerid',
                        pfullname: '$playerinfo.fullName',
                        pfirstname: '$playerinfo.firstName',
                        plastname: '$playerinfo.lastName',
                        ppossible: '$playerinfo.possible',
                        team: '$team',
                        season: '$season',
                        gametype: '$gametype',
                        onoff: '$onoff',
                        wowytype: '$wowytype',
                        woodmoneytier: '$woodmoneytier'
                    },
                    sacf: { $sum: '$sacf' },
                    saca: { $sum: '$saca' },
                    sfpct: { $sum: '$sfpct' },
                    ca: { $sum: '$ca' },
                    cf: { $sum: '$cf' },
                    gf: { $sum: '$gf' },
                    saca60: { $sum: '$saca60' },
                    ga: { $sum: '$ga' },
                    sacfpct: { $sum: '$sacfpct' },
                    gf60: { $sum: '$gf60' },
                    evtoi: { $sum: '$evtoi' },
                    ga60: { $sum: '$ga60' },
                    cfpct: { $sum: '$cfpct' },
                    sa60: { $sum: '$sa60' },
                    nz: { $sum: '$nz' },
                    dff: { $sum: '$dff' },
                    dfa: { $sum: '$dfa' },
                    ca60: { $sum: '$ca60' },
                    fa: { $sum: '$fa' },
                    dz: { $sum: '$dz' },
                    sf60: { $sum: '$sf60' },
                    ff: { $sum: '$ff' },
                    fa60: { $sum: '$fa60' },
                    sacf60: { $sum: '$sacf60' },
                    ffpct: { $sum: '$ffpct' },
                    cf60: { $sum: '$cf60' },
                    ff60: { $sum: '$ff60' },
                    dff60: { $sum: '$dff60' },
                    dffpct: { $sum: '$dffpct' },
                    oz: { $sum: '$oz' },
                    dfa60: { $sum: '$dfa60' },
                    sa: { $sum: '$sa' },
                    sf: { $sum: '$sf' },
                    gfpct: { $sum: '$gfpct' },
                }
            },
            {
                $group: {
                    _id: {
                        pid: '$_id.pid',
                        season: '$_id.season',
                        gametype: '$_id.gametype',
                    },
                    woodmoney: {
                        $push: {
                            pinfo: {
                                pid: '$_id.pid',
                                pfullname: '$_id.pfullname',
                                pfirstname: '$_id.pfirstname',
                                plastname: '$_id.plastname',
                                ppossible: '$_id.ppossible',
                                team: '$_id.team'
                            },
                            onoff: '$_id.onoff',
                            wowytype: '$_id.wowytype',
                            woodmoneytier: '$_id.woodmoneytier',
                            sacf: '$sacf',
                            saca: '$saca',
                            sfpct: '$sfpct',
                            ca: '$ca',
                            cf: '$cf',
                            gf: '$gf',
                            saca60: '$saca60',
                            ga: '$ga',
                            sacfpct: '$sacfpct',
                            gf60: '$gf60',
                            evtoi: '$evtoi',
                            ga60: '$ga60',
                            cfpct: '$cfpct',
                            sa60: '$sa60',
                            nz: '$nz',
                            dff: '$dff',
                            dfa: '$dfa',
                            ca60: '$ca60',
                            fa: '$fa',
                            dz: '$dz',
                            sf60: '$sf60',
                            ff: '$ff',
                            fa60: '$fa60',
                            sacf60: '$sacf60',
                            ffpct: '$ffpct',
                            cf60: '$cf60',
                            ff60: '$ff60',
                            dff60: '$dff60',
                            dffpct: '$dffpct',
                            oz: '$oz',
                            dfa60: '$dfa60',
                            sa: '$sa',
                            sf: '$sf',
                            gfpct: '$gfpct',
                        }
                    }
                }
            }
        ]);
    };

    this.getRangeWoodMoney = function(options, colname, collection) {

        if(colname !== 'schedule')
            throw Error(colname + ': Method not available');

        let queries = helper.mongoRangeQueryBuilder('woodmoney', options);
        let q1 = queries.q1;
        let q2 = queries.q2;
        let dateset = queries.dateset;

        let primequery = (dateset) ?
            {
                $match: {
                    gamedate: {
                        $gte: new Date(q1.datestart.toISOString()),
                        $lte: new Date(q1.dateend.toISOString())
                    }
                }
            } :
            { $match: q1 };

        return collection.aggregate([
            primequery,
            {
                $lookup: {
                    from: constants.dbCollections.gamewoodmoney,
                    localField: '_id',
                    foreignField: 'gamekey',
                    as: 'woodmoney'
                }
            },
            { $unwind: '$woodmoney' },
            { $match: q2 },
            {
                $lookup: {
                    from: constants.dbCollections.nhlplayers,
                    localField: 'woodmoney.playerkey',
                    foreignField: '_id',
                    as: 'woodmoney.playerinfo'
                }
            },
            { $unwind: '$woodmoney.playerinfo' },
            {
                $group: {
                    _id: {
                        pid: '$woodmoney.playerinfo.playerid',
                        pfullname: '$woodmoney.playerinfo.fullName',
                        pfirstname: '$woodmoney.playerinfo.firstName',
                        plastname: '$woodmoney.playerinfo.lastName',
                        ppossible: '$woodmoney.playerinfo.possible',
                        team: '$woodmoney.team',
                        recordtype: '$woodmoney.recordtype',
                        situation: '$woodmoney.situation',
                        gametype: '$woodmoney.gametype',
                        onoff: '$woodmoney.onoff',
                        wowytype: '$woodmoney.wowytype',
                        woodmoneytier: '$woodmoney.woodmoneytier'
                    },
                    sacf: { $sum: '$woodmoney.sacf' },
                    saca: { $sum: '$woodmoney.saca' },
                    ca: { $sum: '$woodmoney.ca' },
                    cf: { $sum: '$woodmoney.cf' },
                    gf: { $sum: '$woodmoney.gf' },
                    ga: { $sum: '$woodmoney.ga' },
                    evtoi: { $sum: '$woodmoney.evtoi' },
                    nz: { $sum: '$woodmoney.nz' },
                    dff: { $sum: '$woodmoney.dff' },
                    dfa: { $sum: '$woodmoney.dfa' },
                    fa: { $sum: '$woodmoney.fa' },
                    dz: { $sum: '$woodmoney.dz' },
                    ff: { $sum: '$woodmoney.ff' },
                    oz: { $sum: '$woodmoney.oz' },
                    sa: { $sum: '$woodmoney.sa' },
                    sf: { $sum: '$woodmoney.sf' },
                }
            },
            {
                $group: {
                    _id: {
                        pid: '$_id.pid',
                        gametype: '$_id.gametype',
                    },
                    woodmoney: {
                        $push: {
                            pinfo: {
                                pid: '$_id.pid',
                                pfullname: '$_id.pfullname',
                                pfirstname: '$_id.pfirstname',
                                plastname: '$_id.plastname',
                                ppossible: '$_id.ppossible',
                                team: '$_id.team'
                            },
                            onoff: '$_id.onoff',
                            wowytype: '$_id.wowytype',
                            woodmoneytier: '$_id.woodmoneytier',
                            cf: '$cf',
                            ca: '$ca',
                            cfpct: {
                                $cond: {
                                    if: { $gt: [{ $add: ['$cf', '$ca'] }, 0] },
                                    then: { $multiply: [{ $divide: ['$cf', { $add: ['$cf', '$ca'] }] }, 100] },
                                    else: 0
                                }
                            },
                            cf60: {
                                $cond: {
                                    if: { $gt: ['$evtoi', 0] },
                                    then: { $divide: [{ $multiply: ['$cf', 3600] }, '$evtoi'] },
                                    else: 0
                                }
                            },
                            ca60: {
                                $cond: {
                                    if: { $gt: ['$evtoi', 0] },
                                    then: { $divide: [{ $multiply: ['$ca', 3600] }, '$evtoi'] },
                                    else: 0
                                }
                            },
                            gf: '$gf',
                            ga: '$ga',
                            gfpct: {
                                $cond: {
                                    if: { $gt: [{ $add: ['$gf', '$ga'] }, 0] },
                                    then: { $multiply: [{ $divide: ['$gf', { $add: ['$gf', '$ga'] }] }, 100] },
                                    else: 0
                                }
                            },
                            gf60: {
                                $cond: {
                                    if: { $gt: ['$evtoi', 0] },
                                    then: { $divide: [{ $multiply: ['$gf', 3600] }, '$evtoi'] },
                                    else: 0
                                }
                            },
                            ga60: {
                                $cond: {
                                    if: { $gt: ['$evtoi', 0] },
                                    then: { $divide: [{ $multiply: ['$ga', 3600] }, '$evtoi'] },
                                    else: 0
                                }
                            },
                            ff: '$ff',
                            fa: '$fa',
                            ffpct: {
                                $cond: {
                                    if: { $gt: [{ $add: ['$ff', '$fa'] }, 0] },
                                    then: { $multiply: [{ $divide: ['$ff', { $add: ['$ff', '$fa'] }] }, 100] },
                                    else: 0
                                }
                            },
                            ff60: {
                                $cond: {
                                    if: { $gt: ['$evtoi', 0] },
                                    then: { $divide: [{ $multiply: ['$ff', 3600] }, '$evtoi'] },
                                    else: 0
                                }
                            },
                            fa60: {
                                $cond: {
                                    if: { $gt: ['$evtoi', 0] },
                                    then: { $divide: [{ $multiply: ['$fa', 3600] }, '$evtoi'] },
                                    else: 0
                                }
                            },
                            sf: '$sf',
                            sa: '$sa',
                            sfpct: {
                                $cond: {
                                    if: { $gt: [{ $add: ['$sf', '$sa'] }, 0] },
                                    then: { $multiply: [{ $divide: ['$sf', { $add: ['$sf', '$sa'] }] }, 100] },
                                    else: 0
                                }
                            },
                            sf60: {
                                $cond: {
                                    if: { $gt: ['$evtoi', 0] },
                                    then: { $divide: [{ $multiply: ['$sf', 3600] }, '$evtoi'] },
                                    else: 0
                                }
                            },
                            sa60: {
                                $cond: {
                                    if: { $gt: ['$evtoi', 0] },
                                    then: { $divide: [{ $multiply: ['$sa', 3600] }, '$evtoi'] },
                                    else: 0
                                }
                            },
                            oz: '$oz',
                            ozpct: {
                                $cond: {
                                    if: { $gt: [{ $add: ['$oz', '$nz', '$dz'] }, 0] },
                                    then: { $multiply: [{ $divide: ['$oz', { $add: ['$oz', '$nz', '$dz'] }] }, 100] },
                                    else: 0
                                }
                            },
                            oz60: {
                                $cond: {
                                    if: { $gt: ['$evtoi', 0] },
                                    then: { $divide: [{ $multiply: ['$oz', 3600] }, '$evtoi'] },
                                    else: 0
                                }
                            },
                            dz: '$dz',
                            dzpct: {
                                $cond: {
                                    if: { $gt: [{ $add: ['$oz', '$nz', '$dz'] }, 0] },
                                    then: { $multiply: [{ $divide: ['$dz', { $add: ['$oz', '$nz', '$dz'] }] }, 100] },
                                    else: 0
                                }
                            },
                            dz60: {
                                $cond: {
                                    if: { $gt: ['$evtoi', 0] },
                                    then: { $divide: [{ $multiply: ['$dz', 3600] }, '$evtoi'] },
                                    else: 0
                                }
                            },
                            nz: '$nz',
                            nzpct: {
                                $cond: {
                                    if: { $gt: [{ $add: ['$oz', '$nz', '$dz'] }, 0] },
                                    then: { $multiply: [{ $divide: ['$nz', { $add: ['$oz', '$nz', '$dz'] }] }, 100] },
                                    else: 0
                                }
                            },
                            nz60: {
                                $cond: {
                                    if: { $gt: ['$evtoi', 0] },
                                    then: { $divide: [{ $multiply: ['$nz', 3600] }, '$evtoi'] },
                                    else: 0
                                }
                            },
                            dff: '$dff',
                            dfa: '$dfa',
                            dffpct: {
                                $cond: {
                                    if: { $gt: [{ $add: ['$dff', '$dfa'] }, 0] },
                                    then: { $multiply: [{ $divide: ['$dff', { $add: ['$dff', '$dfa'] }] }, 100] },
                                    else: 0
                                }
                            },
                            dff60: {
                                $cond: {
                                    if: { $gt: ['$evtoi', 0] },
                                    then: { $divide: [{ $multiply: ['$dff', 3600] }, '$evtoi'] },
                                    else: 0
                                }
                            },
                            dfa60: {
                                $cond: {
                                    if: { $gt: ['$evtoi', 0] },
                                    then: { $divide: [{ $multiply: ['$dfa', 3600] }, '$evtoi'] },
                                    else: 0
                                }
                            },
                            sacf: '$sacf',
                            saca: '$saca',
                            sacfpct: {
                                $cond: {
                                    if: { $gt: [{ $add: ['$sacf', '$saca'] }, 0] },
                                    then: { $multiply: [{ $divide: ['$sacf', { $add: ['$sacf', '$saca'] }] }, 100] },
                                    else: 0
                                }
                            },
                            sacf60: {
                                $cond: {
                                    if: { $gt: ['$evtoi', 0] },
                                    then: { $divide: [{ $multiply: ['$sacf', 3600] }, '$evtoi'] },
                                    else: 0
                                }
                            },
                            saca60: {
                                $cond: {
                                    if: { $gt: ['$evtoi', 0] },
                                    then: { $divide: [{ $multiply: ['$saca', 3600] }, '$evtoi'] },
                                    else: 0
                                }
                            },
                            evtoi: '$evtoi',
                        }
                    }
                }
            }
        ]);
    };

    //#endregion

    //#region Box Car Queries
    this.getSeasonBoxCar = function(options, colname, collection) {

        if(colname !== 'seasonboxcar')
            throw Error(colname + ': Method not available');

        let query = helper.mongoQueryBuilder(options);

        return collection.aggregate([
            { $match: query },
            {
                $lookup: {
                    from: constants.dbCollections.nhlplayers,
                    localField: 'playerkey',
                    foreignField: '_id',
                    as: 'playerinfo'
                }
            },
            { $unwind: '$playerinfo' },
            { $match: { 'recordtype': 'boxcar' } },
            {
                $group: {
                    _id: {
                        pid: '$playerinfo.playerid',
                        pfullname: '$playerinfo.fullName',
                        pfirstname: '$playerinfo.firstName',
                        plastname: '$playerinfo.lastName',
                        ppossible: '$playerinfo.possible',
                        team: '$team',
                        recordtype: '$recordtype',
                        situation: '$situation',
                        season: '$season',
                    },
                    iP: { $sum: '$iP' },
                    iG: { $sum: '$iG' },
                    iA: { $sum: '$iA' },
                    iA1: { $sum: '$iA1' },
                    iA2: { $sum: '$iA2' }
                }
            },
            {
                $group: {
                    _id: {
                        pid: '$_id.pid',
                        season: '$_id.season',
                        recordtype: '$_id.recordtype',
                    },
                    boxcar: {
                        $push: {
                            pinfo: {
                                pid: '$_id.pid',
                                pfullname: '$_id.pfullname',
                                pfirstname: '$_id.pfirstname',
                                plastname: '$_id.plastname',
                                ppossible: '$_id.ppossible',
                                team: '$_id.team'
                            },
                            situation: '$_id.situation',
                            iP: '$iP',
                            iG: '$iG',
                            iA: '$iA',
                            iA1: '$iA1',
                            iA2: '$iA2'
                        }
                    }
                }
            }
        ]);
    };

    this.getSeasonBoxCarWM = function(options, colname, collection) {

        if(colname !== 'seasonboxcar')
            throw Error(colname + ': Method not available');

        let query = helper.mongoQueryBuilder(options);

        return collection.aggregate([
            { $match: query },
            {
                $lookup: {
                    from: constants.dbCollections.nhlplayers,
                    localField: 'playerkey',
                    foreignField: '_id',
                    as: 'playerinfo'
                }
            },
            { $unwind: '$playerinfo' },
            { $match: { 'recordtype': 'woodbox' } },
            {
                $group: {
                    _id: {
                        pid: '$playerinfo.playerid',
                        pfullname: '$playerinfo.fullName',
                        pfirstname: '$playerinfo.firstName',
                        plastname: '$playerinfo.lastName',
                        ppossible: '$playerinfo.possible',
                        team: '$team',
                        recordtype: '$recordtype',
                        woodmoneytier: '$woodmoneytier'
                    },
                    iP: { $sum: '$iP' },
                    iG: { $sum: '$iG' },
                    iA: { $sum: '$iA' },
                    iA1: { $sum: '$iA1' },
                    iA2: { $sum: '$iA2' }
                }
            },
            {
                $group: {
                    _id: {
                        pid: '$_id.pid',
                        recordtype: '$_id.recordtype',
                    },
                    boxcar: {
                        $push: {
                            pinfo: {
                                pid: '$_id.pid',
                                pfullname: '$_id.pfullname',
                                pfirstname: '$_id.pfirstname',
                                plastname: '$_id.plastname',
                                ppossible: '$_id.ppossible',
                                team: '$_id.team'
                            },
                            woodmoneytier: '$_id.woodmoneytier',
                            iP: '$iP',
                            iG: '$iG',
                            iA: '$iA',
                            iA1: '$iA1',
                            iA2: '$iA2'
                        }
                    }
                }
            }
        ]);
    };

    this.getSeasonBoxCarWowy = function(options, colname, collection) {

        if(colname !== 'seasonboxcar')
            throw Error(colname + ': Method not available');

        let query = helper.mongoQueryBuilder(options);

        return collection.aggregate([
            { $match: query },
            {
                $lookup: {
                    from: constants.dbCollections.nhlplayers,
                    localField: 'player1key',
                    foreignField: '_id',
                    as: 'player1info'
                }
            },
            {
                $lookup: {
                    from: constants.dbCollections.nhlplayers,
                    localField: 'player2key',
                    foreignField: '_id',
                    as: 'player2info'
                }
            },
            { $unwind: '$player1info' },
            { $unwind: '$player2info' },
            { $match: { 'recordtype': 'wowybox' } },
            {
                $group: {
                    _id: {
                        p1id: '$player1info.playerid',
                        p1fullname: '$player1info.fullName',
                        p1firstname: '$player1info.firstName',
                        p1lastname: '$player1info.lastName',
                        p1possible: '$player1info.possible',
                        p2id: '$player2info.playerid',
                        p2fullname: '$player2info.fullName',
                        p2firstname: '$player2info.firstName',
                        p2lastname: '$player2info.lastName',
                        p2possible: '$player2info.possible',
                        team: '$team',
                        recordtype: '$recordtype',
                    },
                    iP: { $sum: '$iP' },
                    iG: { $sum: '$iG' },
                    iA: { $sum: '$iA' },
                    iA1: { $sum: '$iA1' },
                    iA2: { $sum: '$iA2' }
                }
            },
            {
                $group: {
                    _id: {
                        p1id: '$_id.p1id',
                        p2id: '$_id.p2id',
                        recordtype: '$_id.recordtype'
                    },
                    boxcar: {
                        $push: {
                            p1info: {
                                p1id: '$_id.p1id',
                                p1fullname: '$_id.p1fullname',
                                p1firstname: '$_id.p1firstname',
                                p1lastname: '$_id.p1lastname',
                                p1possible: '$_id.p1possible',
                                p2id: '$_id.p2id',
                                p2fullname: '$_id.p2fullname',
                                p2firstname: '$_id.p2firstname',
                                p2lastname: '$_id.p2lastname',
                                p2possible: '$_id.p2possible',
                                team: '$_id.team'
                            },
                            iP: '$iP',
                            iG: '$iG',
                            iA: '$iA',
                            iA1: '$iA1',
                            iA2: '$iA2'
                        }
                    }
                }
            }
        ]);
    };

    this.getRangeBoxCar = function(options, colname, collection) {

        if(colname !== 'schedule')
            throw Error(colname + ': Method not available');

        let q1 = new Object();
        let q2 = new Object();
        let dateset = false;

        Object.keys(options).forEach((name) => {
            if(name !== 'qtype' && name !== 'qmethod') {
                if(name.substr(0, 2) === 'q1') {
                    if(name.substr(2, 4) === 'date') {
                        dateset = true;
                        q1[name.substr(2)] = new Date(options[name]);
                    } else if(name.substr(2) === 'team') {
                        q1['$or'] = [{ 'home': options[name] }, { 'away': options[name] }];
                    } else {
                        q1[name.substr(2)] = isNumeric(options[name]) ? parseInt(options[name]) : options[name];
                    }
                } else {
                    q2['boxcar.' + name.substr(2)] = isNumeric(options[name]) ? parseInt(options[name]) : options[name];
                }
            }
        });

        let primequery = (dateset) ?
            {
                $match: {
                    gamedate: {
                        $gte: new Date(q1.datestart.toISOString()),
                        $lte: new Date(q1.dateend.toISOString())
                    }
                }
            } :
            { $match: q1 };

        return collection.aggregate([
            primequery,
            {
                $lookup: {
                    from: constants.dbCollections.gameboxcar,
                    localField: '_id',
                    foreignField: 'gamekey',
                    as: 'boxcar'
                }
            },
            { $unwind: '$boxcar' },
            { $match: q2 },
            {
                $lookup: {
                    from: constants.dbCollections.nhlplayers,
                    localField: 'boxcar.playerkey',
                    foreignField: '_id',
                    as: 'boxcar.playerinfo'
                }
            },
            { $unwind: '$boxcar.playerinfo' },
            { $match: { 'boxcar.recordtype': 'boxcar' } },
            {
                $group: {
                    _id: {
                        pid: '$boxcar.playerinfo.playerid',
                        pfullname: '$boxcar.playerinfo.fullName',
                        pfirstname: '$boxcar.playerinfo.firstName',
                        plastname: '$boxcar.playerinfo.lastName',
                        ppossible: '$boxcar.playerinfo.possible',
                        team: '$boxcar.team',
                        recordtype: '$boxcar.recordtype',
                        situation: '$boxcar.situation',
                    },
                    iP: { $sum: '$boxcar.iP' },
                    iG: { $sum: '$boxcar.iG' },
                    iA: { $sum: '$boxcar.iA' },
                    iA1: { $sum: '$boxcar.iA1' },
                    iA2: { $sum: '$boxcar.iA2' }
                }
            },
            {
                $group: {
                    _id: {
                        pid: '$_id.pid',
                        recordtype: '$_id.recordtype',
                    },
                    boxcar: {
                        $push: {
                            pinfo: {
                                pid: '$_id.pid',
                                pfullname: '$_id.pfullname',
                                pfirstname: '$_id.pfirstname',
                                plastname: '$_id.plastname',
                                ppossible: '$_id.ppossible',
                                team: '$_id.team'
                            },
                            situation: '$_id.situation',
                            iP: '$iP',
                            iG: '$iG',
                            iA: '$iA',
                            iA1: '$iA1',
                            iA2: '$iA2'
                        }
                    }
                }
            }
        ]);
    };

    this.getRangeBoxCarWM = function(options, colname, collection) {

        if(colname !== 'schedule')
            throw Error(colname + ': Method not available');

        let q1 = new Object();
        let q2 = new Object();
        let dateset = false;

        Object.keys(options).forEach((name) => {
            if(name !== 'qtype' && name !== 'qmethod') {
                if(name.substr(0, 2) === 'q1') {
                    if(name.substr(2, 4) === 'date') {
                        dateset = true;
                        q1[name.substr(2)] = new Date(options[name]);
                    } else if(name.substr(2) === 'team') {
                        q1['$or'] = [{ 'home': options[name] }, { 'away': options[name] }];
                    } else {
                        q1[name.substr(2)] = isNumeric(options[name]) ? parseInt(options[name]) : options[name];
                    }
                } else {
                    q2['boxcar.' + name.substr(2)] = isNumeric(options[name]) ? parseInt(options[name]) : options[name];
                }
            }
        });

        let primequery = (dateset) ? {
            $match: {
                gamedate: {
                    $gte: new Date(q1.datestart.toISOString()),
                    $lte: new Date(q1.dateend.toISOString())
                }
            }
        } : { $match: q1 };

        return collection.aggregate([
            primequery,
            {
                $lookup: {
                    from: constants.dbCollections.gameboxcar,
                    localField: '_id',
                    foreignField: 'gamekey',
                    as: 'boxcar'
                }
            },
            { $unwind: '$boxcar' },
            { $match: q2 },
            {
                $lookup: {
                    from: constants.dbCollections.nhlplayers,
                    localField: 'boxcar.playerkey',
                    foreignField: '_id',
                    as: 'boxcar.playerinfo'
                }
            },
            { $unwind: '$boxcar.playerinfo' },
            { $match: { 'boxcar.recordtype': 'woodbox' } },
            {
                $group: {
                    _id: {
                        pid: '$boxcar.playerinfo.playerid',
                        pfullname: '$boxcar.playerinfo.fullName',
                        pfirstname: '$boxcar.playerinfo.firstName',
                        plastname: '$boxcar.playerinfo.lastName',
                        ppossible: '$boxcar.playerinfo.possible',
                        team: '$boxcar.team',
                        recordtype: '$boxcar.recordtype',
                        woodmoneytier: '$boxcar.woodmoneytier'
                    },
                    iP: { $sum: '$boxcar.iP' },
                    iG: { $sum: '$boxcar.iG' },
                    iA: { $sum: '$boxcar.iA' },
                    iA1: { $sum: '$boxcar.iA1' },
                    iA2: { $sum: '$boxcar.iA2' }
                }
            },
            {
                $group: {
                    _id: {
                        pid: '$_id.pid',
                        recordtype: '$_id.recordtype'
                    },
                    boxcar: {
                        $push: {
                            pinfo: {
                                pid: '$_id.pid',
                                pfullname: '$_id.pfullname',
                                pfirstname: '$_id.pfirstname',
                                plastname: '$_id.plastname',
                                ppossible: '$_id.ppossible',
                                team: '$_id.team'
                            },
                            woodmoneytier: '$_id.woodmoneytier',
                            iP: '$iP',
                            iG: '$iG',
                            iA: '$iA',
                            iA1: '$iA1',
                            iA2: '$iA2'
                        }
                    }
                }
            }
        ]);
    };

    this.getRangeBoxCarWowy = function(options, colname, collection) {

        if(colname !== 'schedule')
            throw Error(colname + ': Method not available');

        let q1 = new Object();
        let q2 = new Object();
        let dateset = false;

        Object.keys(options).forEach((name) => {
            if(name !== 'qtype' && name !== 'qmethod') {
                if(name.substr(0, 2) === 'q1') {
                    if(name.substr(2, 4) === 'date') {
                        dateset = true;
                        q1[name.substr(2)] = new Date(options[name]);
                    } else if(name.substr(2) === 'team') {
                        q1['$or'] = [{ 'home': options[name] }, { 'away': options[name] }];
                    } else {
                        q1[name.substr(2)] = isNumeric(options[name]) ? parseInt(options[name]) : options[name];
                    }
                } else {
                    q2['boxcar.' + name.substr(2)] = isNumeric(options[name]) ? parseInt(options[name]) : options[name];
                }
            }
        });

        let primequery = (dateset) ? {
            $match: {
                gamedate: {
                    $gte: new Date(q1.datestart.toISOString()),
                    $lte: new Date(q1.dateend.toISOString())
                }
            }
        } : { $match: q1 };

        return collection.aggregate([
            primequery,
            {
                $lookup: {
                    from: constants.dbCollections.gameboxcar,
                    localField: '_id',
                    foreignField: 'gamekey',
                    as: 'boxcar'
                }
            },
            { $unwind: '$boxcar' },
            { $match: q2 },
            {
                $lookup: {
                    from: constants.dbCollections.nhlplayers,
                    localField: 'boxcar.player1key',
                    foreignField: '_id',
                    as: 'boxcar.player1info'
                }
            },
            {
                $lookup: {
                    from: constants.dbCollections.nhlplayers,
                    localField: 'boxcar.player2key',
                    foreignField: '_id',
                    as: 'boxcar.player2info'
                }
            },
            { $unwind: '$boxcar.player1info' },
            { $unwind: '$boxcar.player2info' },
            { $match: { 'boxcar.recordtype': 'wowybox' } },
            {
                $group: {
                    _id: {
                        p1id: '$boxcar.player1info.playerid',
                        p1fullname: '$boxcar.player1info.fullName',
                        p1firstname: '$boxcar.player1info.firstName',
                        p1lastname: '$boxcar.player1info.lastName',
                        p1possible: '$boxcar.player1info.possible',
                        p2id: '$boxcar.player2info.playerid',
                        p2fullname: '$boxcar.player2info.fullName',
                        p2firstname: '$boxcar.player2info.firstName',
                        p2lastname: '$boxcar.player2info.lastName',
                        p2possible: '$boxcar.player2info.possible',
                        team: '$boxcar.team',
                        recordtype: '$boxcar.recordtype',
                    },
                    iP: { $sum: '$boxcar.iP' },
                    iG: { $sum: '$boxcar.iG' },
                    iA: { $sum: '$boxcar.iA' },
                    iA1: { $sum: '$boxcar.iA1' },
                    iA2: { $sum: '$boxcar.iA2' }
                }
            },
            {
                $group: {
                    _id: {
                        pid: '$_id.p1id',
                        pid: '$_id.p2id',
                        recordtype: '$_id.recordtype'
                    },
                    boxcar: {
                        $push: {
                            p1info: {
                                p1id: '$_id.p1id',
                                p1fullname: '$_id.p1fullname',
                                p1firstname: '$_id.p1firstname',
                                p1lastname: '$_id.p1lastname',
                                p1possible: '$_id.p1possible',
                                p2id: '$_id.p2id',
                                p2fullname: '$_id.p2fullname',
                                p2firstname: '$_id.p2firstname',
                                p2lastname: '$_id.p2lastname',
                                p2possible: '$_id.p2possible',
                                team: '$_id.team'
                            },
                            iP: '$iP',
                            iG: '$iG',
                            iA: '$iA',
                            iA1: '$iA1',
                            iA2: '$iA2'
                        }
                    }
                }
            }
        ]);
    };
    //#endregion

    //#region WOWY Queries
    // Use these methods in conjunction with /w/wowy
    this.getSeasonWowy = function(options, colname, collection) {

        if(colname !== 'seasonwowy')
            throw Error(colname + ': Method not available');

        //let query = helper.mongoQueryBuilder(options);
        let q1 = new Object();
        let s1 = new Array();

        Object.keys(options).forEach((name) => {
            if(name != 'qtype' && name != 'qmethod' && name.substr(0, 2) !== 'q3') {
                if(name.substr(2) === 'season') {
                    for(let i = 0; i < options[name].length; i++) {
                        s1.push(parseInt(options[name][i]));
                    }
                    q1[name.substr(2)] = { '$in': s1 };
                } else {
                    q1[name.substr(2)] = isNumeric(options[name]) ? parseInt(options[name]) : options[name];
                }
            }
        });

        let query = { $match: q1 };

        return collection.aggregate([
                query,
                {
                    $lookup: {
                        from: constants.dbCollections.nhlplayers,
                        localField: "player1key",
                        foreignField: "_id",
                        as: "player1info"
                    }
                },
                {
                    $lookup: {
                        from: constants.dbCollections.nhlplayers,
                        localField: "player2key",
                        foreignField: "_id",
                        as: "player2info"
                    }
                },
                { $unwind: "$player1info" },
                { $unwind: "$player2info" },
                {
                    $group: {
                        _id: {
                            p1id: '$player1info.playerid',
                            p1fullname: '$player1info.fullName',
                            p1firstname: '$player1info.firstName',
                            p1lastname: '$player1info.lastName',
                            p1possible: '$player1info.possible',
                            p2id: '$player2info.playerid',
                            p2fullname: '$player2info.fullName',
                            p2firstname: '$player2info.firstName',
                            p2lastname: '$player2info.lastName',
                            p2possible: '$player2info.possible',
                            wowytype: '$recordtype',
                            team: '$team',
                            season: '$season'
                        },
                        cf: { $sum: '$cf' },
                        ca: { $sum: '$ca' },
                        gf: { $sum: '$gf' },
                        ga: { $sum: '$ga' },
                        ff: { $sum: '$ff' },
                        fa: { $sum: '$fa' },
                        sf: { $sum: '$sf' },
                        sa: { $sum: '$sa' },
                        oz: { $sum: '$oz' },
                        dz: { $sum: '$dz' },
                        nz: { $sum: '$nz' },
                        dff: { $sum: '$dff' },
                        dfa: { $sum: '$dfa' },
                        sacf: { $sum: '$sacf' },
                        saca: { $sum: '$saca' },
                        evtoi: { $sum: '$evtoi' }
                    }
                },
                {
                    $group: {
                        _id: {
                            p1id: '$_id.p1id',
                            p2id: '$_id.p2id',
                            season: '$_id.season',
                        },
                        wowy: {
                            $push: {
                                pinfo: '$_id',
                                cf: '$cf',
                                ca: '$ca',
                                cfpct: {
                                    $cond: {
                                        if: { $gt: [{ $add: ['$cf', '$ca'] }, 0] },
                                        then: { $multiply: [{ $divide: ['$cf', { $add: ['$cf', '$ca'] }] }, 100] },
                                        else: 0
                                    }
                                },
                                cf60: {
                                    $cond: {
                                        if: { $gt: ['$evtoi', 0] },
                                        then: { $divide: [{ $multiply: ['$cf', 3600] }, '$evtoi'] },
                                        else: 0
                                    }
                                },
                                ca60: {
                                    $cond: {
                                        if: { $gt: ['$evtoi', 0] },
                                        then: { $divide: [{ $multiply: ['$ca', 3600] }, '$evtoi'] },
                                        else: 0
                                    }
                                },
                                gf: '$gf',
                                ga: '$ga',
                                gfpct: {
                                    $cond: {
                                        if: { $gt: [{ $add: ['$gf', '$ga'] }, 0] },
                                        then: { $multiply: [{ $divide: ['$gf', { $add: ['$gf', '$ga'] }] }, 100] },
                                        else: 0
                                    }
                                },
                                gf60: {
                                    $cond: {
                                        if: { $gt: ['$evtoi', 0] },
                                        then: { $divide: [{ $multiply: ['$gf', 3600] }, '$evtoi'] },
                                        else: 0
                                    }
                                },
                                ga60: {
                                    $cond: {
                                        if: { $gt: ['$evtoi', 0] },
                                        then: { $divide: [{ $multiply: ['$ga', 3600] }, '$evtoi'] },
                                        else: 0
                                    }
                                },
                                ff: '$ff',
                                fa: '$fa',
                                ffpct: {
                                    $cond: {
                                        if: { $gt: [{ $add: ['$ff', '$fa'] }, 0] },
                                        then: { $multiply: [{ $divide: ['$ff', { $add: ['$ff', '$fa'] }] }, 100] },
                                        else: 0
                                    }
                                },
                                ff60: {
                                    $cond: {
                                        if: { $gt: ['$evtoi', 0] },
                                        then: { $divide: [{ $multiply: ['$ff', 3600] }, '$evtoi'] },
                                        else: 0
                                    }
                                },
                                fa60: {
                                    $cond: {
                                        if: { $gt: ['$evtoi', 0] },
                                        then: { $divide: [{ $multiply: ['$fa', 3600] }, '$evtoi'] },
                                        else: 0
                                    }
                                },
                                sf: '$sf',
                                sa: '$sa',
                                sfpct: {
                                    $cond: {
                                        if: { $gt: [{ $add: ['$sf', '$sa'] }, 0] },
                                        then: { $multiply: [{ $divide: ['$sf', { $add: ['$sf', '$sa'] }] }, 100] },
                                        else: 0
                                    }
                                },
                                sf60: {
                                    $cond: {
                                        if: { $gt: ['$evtoi', 0] },
                                        then: { $divide: [{ $multiply: ['$sf', 3600] }, '$evtoi'] },
                                        else: 0
                                    }
                                },
                                sa60: {
                                    $cond: {
                                        if: { $gt: ['$evtoi', 0] },
                                        then: { $divide: [{ $multiply: ['$sa', 3600] }, '$evtoi'] },
                                        else: 0
                                    }
                                },
                                oz: '$oz',
                                ozpct: {
                                    $cond: {
                                        if: { $gt: [{ $add: ['$oz', '$nz', '$dz'] }, 0] },
                                        then: { $multiply: [{ $divide: ['$oz', { $add: ['$oz', '$nz', '$dz'] }] }, 100] },
                                        else: 0
                                    }
                                },
                                oz60: {
                                    $cond: {
                                        if: { $gt: ['$evtoi', 0] },
                                        then: { $divide: [{ $multiply: ['$oz', 3600] }, '$evtoi'] },
                                        else: 0
                                    }
                                },
                                dz: '$dz',
                                dzpct: {
                                    $cond: {
                                        if: { $gt: [{ $add: ['$oz', '$nz', '$dz'] }, 0] },
                                        then: { $multiply: [{ $divide: ['$dz', { $add: ['$oz', '$nz', '$dz'] }] }, 100] },
                                        else: 0
                                    }
                                },
                                dz60: {
                                    $cond: {
                                        if: { $gt: ['$evtoi', 0] },
                                        then: { $divide: [{ $multiply: ['$dz', 3600] }, '$evtoi'] },
                                        else: 0
                                    }
                                },
                                nz: '$nz',
                                nzpct: {
                                    $cond: {
                                        if: { $gt: [{ $add: ['$oz', '$nz', '$dz'] }, 0] },
                                        then: { $multiply: [{ $divide: ['$nz', { $add: ['$oz', '$nz', '$dz'] }] }, 100] },
                                        else: 0
                                    }
                                },
                                nz60: {
                                    $cond: {
                                        if: { $gt: ['$evtoi', 0] },
                                        then: { $divide: [{ $multiply: ['$nz', 3600] }, '$evtoi'] },
                                        else: 0
                                    }
                                },
                                dff: '$dff',
                                dfa: '$dfa',
                                dffpct: {
                                    $cond: {
                                        if: { $gt: [{ $add: ['$dff', '$dfa'] }, 0] },
                                        then: { $multiply: [{ $divide: ['$dff', { $add: ['$dff', '$dfa'] }] }, 100] },
                                        else: 0
                                    }
                                },
                                dff60: {
                                    $cond: {
                                        if: { $gt: ['$evtoi', 0] },
                                        then: { $divide: [{ $multiply: ['$dff', 3600] }, '$evtoi'] },
                                        else: 0
                                    }
                                },
                                dfa60: {
                                    $cond: {
                                        if: { $gt: ['$evtoi', 0] },
                                        then: { $divide: [{ $multiply: ['$dfa', 3600] }, '$evtoi'] },
                                        else: 0
                                    }
                                },
                                sacf: '$sacf',
                                saca: '$saca',
                                sacfpct: {
                                    $cond: {
                                        if: { $gt: [{ $add: ['$sacf', '$saca'] }, 0] },
                                        then: { $multiply: [{ $divide: ['$sacf', { $add: ['$sacf', '$saca'] }] }, 100] },
                                        else: 0
                                    }
                                },
                                sacf60: {
                                    $cond: {
                                        if: { $gt: ['$evtoi', 0] },
                                        then: { $divide: [{ $multiply: ['$sacf', 3600] }, '$evtoi'] },
                                        else: 0
                                    }
                                },
                                saca60: {
                                    $cond: {
                                        if: { $gt: ['$evtoi', 0] },
                                        then: { $divide: [{ $multiply: ['$saca', 3600] }, '$evtoi'] },
                                        else: 0
                                    }
                                },
                                evtoi: '$evtoi',
                            }
                        }
                    }
                }
            ],
            { allowDiskUse: true })
    };

    // Although this is a WOWY calculation it uses the schedule collection as its base
    this.getRangeWowy = function(options, colname, collection) {

        if(colname !== 'schedule')
            throw Error(colname + ': Method not available');

        let q1 = new Object();
        let q2 = new Object();
        let dateset = false;

        Object.keys(options).forEach((name) => {
            if(name !== 'qtype' && name !== 'qmethod') {
                if(name.substr(0, 2) === 'q1') {
                    if(name.substr(2, 4) === 'date') {
                        dateset = true;
                        q1[name.substr(2)] = new Date(options[name]);
                    } else if(name.substr(2) === 'team') {
                        q1['$or'] = [{ 'home': options[name] }, { 'away': options[name] }];
                    } else {
                        q1[name.substr(2)] = isNumeric(options[name]) ? parseInt(options[name]) : options[name];
                    }
                } else {
                    q2['wowy.' + name.substr(2)] = isNumeric(options[name]) ? parseInt(options[name]) : options[name];
                }
            }
        });

        let primequery = (dateset) ? {
            $match: {
                gamedate: {
                    $gte: new Date(q1.datestart.toISOString()),
                    $lte: new Date(q1.dateend.toISOString())
                }
            }
        } : { $match: q1 };

        return collection.aggregate([
            primequery,
            {
                $lookup: {
                    from: constants.dbCollections.gamewowy,
                    localField: '_id',
                    foreignField: 'gamekey',
                    as: 'wowy'
                }
            },
            { $unwind: '$wowy' },
            { $match: q2 },
            {
                $lookup: {
                    from: constants.dbCollections.nhlplayers,
                    localField: 'wowy.player1key',
                    foreignField: '_id',
                    as: 'wowy.player1info'
                }
            },
            {
                $lookup: {
                    from: constants.dbCollections.nhlplayers,
                    localField: 'wowy.player2key',
                    foreignField: '_id',
                    as: 'wowy.player2info'
                }
            },
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
                            cfpct: {
                                $cond: {
                                    if: { $gt: [{ $add: ['$cf', '$ca'] }, 0] },
                                    then: { $multiply: [{ $divide: ['$cf', { $add: ['$cf', '$ca'] }] }, 100] },
                                    else: 0
                                }
                            },
                            cf60: {
                                $cond: {
                                    if: { $gt: ['$evtoi', 0] },
                                    then: { $divide: [{ $multiply: ['$cf', 3600] }, '$evtoi'] },
                                    else: 0
                                }
                            },
                            ca60: {
                                $cond: {
                                    if: { $gt: ['$evtoi', 0] },
                                    then: { $divide: [{ $multiply: ['$ca', 3600] }, '$evtoi'] },
                                    else: 0
                                }
                            },
                            gf: '$gf',
                            ga: '$ga',
                            gfpct: {
                                $cond: {
                                    if: { $gt: [{ $add: ['$gf', '$ga'] }, 0] },
                                    then: { $multiply: [{ $divide: ['$gf', { $add: ['$gf', '$ga'] }] }, 100] },
                                    else: 0
                                }
                            },
                            gf60: {
                                $cond: {
                                    if: { $gt: ['$evtoi', 0] },
                                    then: { $divide: [{ $multiply: ['$gf', 3600] }, '$evtoi'] },
                                    else: 0
                                }
                            },
                            ga60: {
                                $cond: {
                                    if: { $gt: ['$evtoi', 0] },
                                    then: { $divide: [{ $multiply: ['$ga', 3600] }, '$evtoi'] },
                                    else: 0
                                }
                            },
                            ff: '$ff',
                            fa: '$fa',
                            ffpct: {
                                $cond: {
                                    if: { $gt: [{ $add: ['$ff', '$fa'] }, 0] },
                                    then: { $multiply: [{ $divide: ['$ff', { $add: ['$ff', '$fa'] }] }, 100] },
                                    else: 0
                                }
                            },
                            ff60: {
                                $cond: {
                                    if: { $gt: ['$evtoi', 0] },
                                    then: { $divide: [{ $multiply: ['$ff', 3600] }, '$evtoi'] },
                                    else: 0
                                }
                            },
                            fa60: {
                                $cond: {
                                    if: { $gt: ['$evtoi', 0] },
                                    then: { $divide: [{ $multiply: ['$fa', 3600] }, '$evtoi'] },
                                    else: 0
                                }
                            },
                            sf: '$sf',
                            sa: '$sa',
                            sfpct: {
                                $cond: {
                                    if: { $gt: [{ $add: ['$sf', '$sa'] }, 0] },
                                    then: { $multiply: [{ $divide: ['$sf', { $add: ['$sf', '$sa'] }] }, 100] },
                                    else: 0
                                }
                            },
                            sf60: {
                                $cond: {
                                    if: { $gt: ['$evtoi', 0] },
                                    then: { $divide: [{ $multiply: ['$sf', 3600] }, '$evtoi'] },
                                    else: 0
                                }
                            },
                            sa60: {
                                $cond: {
                                    if: { $gt: ['$evtoi', 0] },
                                    then: { $divide: [{ $multiply: ['$sa', 3600] }, '$evtoi'] },
                                    else: 0
                                }
                            },
                            oz: '$oz',
                            ozpct: {
                                $cond: {
                                    if: { $gt: [{ $add: ['$oz', '$nz', '$dz'] }, 0] },
                                    then: { $multiply: [{ $divide: ['$oz', { $add: ['$oz', '$nz', '$dz'] }] }, 100] },
                                    else: 0
                                }
                            },
                            oz60: {
                                $cond: {
                                    if: { $gt: ['$evtoi', 0] },
                                    then: { $divide: [{ $multiply: ['$oz', 3600] }, '$evtoi'] },
                                    else: 0
                                }
                            },
                            dz: '$dz',
                            dzpct: {
                                $cond: {
                                    if: { $gt: [{ $add: ['$oz', '$nz', '$dz'] }, 0] },
                                    then: { $multiply: [{ $divide: ['$dz', { $add: ['$oz', '$nz', '$dz'] }] }, 100] },
                                    else: 0
                                }
                            },
                            dz60: {
                                $cond: {
                                    if: { $gt: ['$evtoi', 0] },
                                    then: { $divide: [{ $multiply: ['$dz', 3600] }, '$evtoi'] },
                                    else: 0
                                }
                            },
                            nz: '$nz',
                            nzpct: {
                                $cond: {
                                    if: { $gt: [{ $add: ['$oz', '$nz', '$dz'] }, 0] },
                                    then: { $multiply: [{ $divide: ['$nz', { $add: ['$oz', '$nz', '$dz'] }] }, 100] },
                                    else: 0
                                }
                            },
                            nz60: {
                                $cond: {
                                    if: { $gt: ['$evtoi', 0] },
                                    then: { $divide: [{ $multiply: ['$nz', 3600] }, '$evtoi'] },
                                    else: 0
                                }
                            },
                            dff: '$dff',
                            dfa: '$dfa',
                            dffpct: {
                                $cond: {
                                    if: { $gt: [{ $add: ['$dff', '$dfa'] }, 0] },
                                    then: { $multiply: [{ $divide: ['$dff', { $add: ['$dff', '$dfa'] }] }, 100] },
                                    else: 0
                                }
                            },
                            dff60: {
                                $cond: {
                                    if: { $gt: ['$evtoi', 0] },
                                    then: { $divide: [{ $multiply: ['$dff', 3600] }, '$evtoi'] },
                                    else: 0
                                }
                            },
                            dfa60: {
                                $cond: {
                                    if: { $gt: ['$evtoi', 0] },
                                    then: { $divide: [{ $multiply: ['$dfa', 3600] }, '$evtoi'] },
                                    else: 0
                                }
                            },
                            sacf: '$sacf',
                            saca: '$saca',
                            sacfpct: {
                                $cond: {
                                    if: { $gt: [{ $add: ['$sacf', '$saca'] }, 0] },
                                    then: { $multiply: [{ $divide: ['$sacf', { $add: ['$sacf', '$saca'] }] }, 100] },
                                    else: 0
                                }
                            },
                            sacf60: {
                                $cond: {
                                    if: { $gt: ['$evtoi', 0] },
                                    then: { $divide: [{ $multiply: ['$sacf', 3600] }, '$evtoi'] },
                                    else: 0
                                }
                            },
                            saca60: {
                                $cond: {
                                    if: { $gt: ['$evtoi', 0] },
                                    then: { $divide: [{ $multiply: ['$saca', 3600] }, '$evtoi'] },
                                    else: 0
                                }
                            },
                            evtoi: '$evtoi',
                        }
                    }
                }
            }
        ], { allowDiskUse: true });
    };
    //#endregion

    //#region WoodWOWY Queries
    // Use these methods in conjunction with /w/woodmoney
    this.getWoodWowy = function(options, colname, collection) {

        if(colname !== 'woodwowy')
            throw Error(colname + ': Method not available');

        let query = helper.mongoQueryBuilder(options);
        if(Object.keys(options).length > 2) {
            return collection.aggregate([
                { $match: query },
                {
                    $lookup: {
                        from: constants.dbCollections.nhlplayers,
                        localField: "playerkey1",
                        foreignField: "_id",
                        as: "player1info"
                    }
                },
                {
                    $lookup: {
                        from: constants.dbCollections.nhlplayers,
                        localField: "playerkey2",
                        foreignField: "_id",
                        as: "player2info"
                    }
                },
                { $unwind: "$player1info" },
                { $unwind: "$player2info" },
                { $sort: { 'Player1Id': 1, 'Player2Id': 1 } },
            ]);
        } else {
            return collection.aggregate([
                { $match: query },
                {
                    $lookup: {
                        from: constants.dbCollections.nhlplayers,
                        localField: "playerkey1",
                        foreignField: "_id",
                        as: "player1info"
                    }
                },
                {
                    $lookup: {
                        from: constants.dbCollections.nhlplayers,
                        localField: "playerkey2",
                        foreignField: "_id",
                        as: "player2info"
                    }
                },
                { $unwind: "$player1info" },
                { $unwind: "$player2info" },
                { $sort: { 'Player1Id': 1, 'Player2Id': 1 } },
                { $limit: 500 }
            ]);
        }
    }
    //#endregion
}

module.exports = preCannedQueries;

function isNumeric(n) {
  return !isNaN(n) && isFinite(n);
}

function isArray(n) {
  return Array.isArray(n);
}