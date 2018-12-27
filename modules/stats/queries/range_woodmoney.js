"use strict";

const _ = require("lodash");
const MongoHelpers = require('../../../common/mongo_helpers');

module.exports = (mongoose, config) => {

    return (options) => {

        let GameWoodmoney = mongoose.model('GameWoodmoney');
        let helper = new MongoHelpers();

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

        return GameWoodmoney.aggregate([
            primequery,
            {
                $lookup: {
                    from: config.dbCollections.gamewoodmoney,
                    localField: '_id',
                    foreignField: 'gamekey',
                    as: 'woodmoney'
                }
            },
            { $unwind: '$woodmoney' },
            { $match: q2 },
            {
                $lookup: {
                    from: config.dbCollections.players,
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
};