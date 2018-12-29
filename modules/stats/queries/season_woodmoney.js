"use strict";

const _ = require("lodash");
const constants = require('../../../common/constants');
const MongoHelpers = require('../../../common/mongo_helpers');

module.exports = (mongoose, config) => {

    return (options) => {

        let SeasonWoodmoney = mongoose.model('SeasonWoodmoney');
        let helper = new MongoHelpers();

        console.log("options", JSON.stringify(options, null, 2));
        let query = helper.mongoQueryBuilder(options);
        // console.log("query", JSON.stringify(query, null, 2));

        return SeasonWoodmoney.aggregate([
            { $match: query },
            {
                $lookup: {
                    from: constants.dbCollections.players,
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
                            // pinfo: {
                            //     pid: '$_id.pid',
                            //     pfullname: '$_id.pfullname',
                            //     pfirstname: '$_id.pfirstname',
                            //     plastname: '$_id.plastname',
                            //     ppossible: '$_id.ppossible',
                            //     team: '$_id.team'
                            // },
                            pid: '$_id.pid',
                            pfullname: '$_id.pfullname',
                            pfirstname: '$_id.pfirstname',
                            plastname: '$_id.plastname',
                            ppossible: '$_id.ppossible',
                            team: '$_id.team',
                            //end player info
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
        ]).then((data) => {

            console.log((data || []).length, "results");
            let results = _.chain(data).map(x => {
                return _.map(x.woodmoney, (y) => {

                    // till we get a real nhlplayers collection
                    y.ppossible = y.ppossible || ['C'];

                    let rel_comp_stats = {
                        'cf60rc': y.cf/(y.evtoi * 60),
                        'ca60rc': y.ca/(y.evtoi * 60),
                        'cfpctrc': y.cfpct/(y.evtoi * 60),
                        'cfpctra': 0, //TODO
                        'dff60rc': y.dff60/(y.evtoi * 60),
                        'dfa60rc': y.dfa60/(y.evtoi * 60),
                        'dffpctrc': y.dffpct/(y.evtoi * 60),
                        'dffpctra': 0 //TODO
                    };

                    return _.extend(rel_comp_stats, x._id, y);
                });
            }).flatten().value();

            return Promise.resolve(results);

        }, (err) => {
            return Promise.reject(err);
        });
    };
};