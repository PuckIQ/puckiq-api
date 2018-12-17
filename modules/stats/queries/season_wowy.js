"use strict";

const _ = require("lodash");

module.exports = (mongoose, config) => {

    return (options) => {

        let SeasonWowy = mongoose.model('SeasonWowy');

        //let query = helper.mongoQueryBuilder(options);
        let q1 = new Object();
        let s1 = new Array();

        console.log("TODO implement me...");
        Object.keys(options).forEach((name) => {
            if(name != 'qtype' && name != 'qmethod' && name.substr(0, 2) !== 'q3') {
                if(name.substr(2) === 'season') {
                    for(let i = 0; i < options[name].length; i++) {
                        s1.push(parseInt(options[name][i]));
                    }
                    q1[name.substr(2)] = { '$in': s1 };
                } else {
                    q1[name.substr(2)] = _.isNumber(options[name]) ? parseInt(options[name]) : options[name];
                }
            }
        });

        let query = { $match: q1 };

        return SeasonWowy.aggregate([
                query,
                {
                    $lookup: {
                        from: config.dbCollections.players,
                        localField: "player1key",
                        foreignField: "_id",
                        as: "player1info"
                    }
                },
                {
                    $lookup: {
                        from: config.dbCollections.players,
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
            { allowDiskUse: true });
    };
};