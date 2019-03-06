"use strict";

const _ = require("lodash");
const constants = require('../../../common/constants');
const MongoHelpers = require('../../../common/mongo_helpers');

module.exports = (mongoose, config) => {

    return (options) => {

        let SeasonWoodmoney = mongoose.model('SeasonWoodmoney');
        let helper = new MongoHelpers();

        //NOTE: we need both and calculate the rels
        if(options.onoff) delete options.onoff;

        // console.log("options", JSON.stringify(options, null, 2));
        let query = helper.mongoQueryBuilder(options);
        // console.log("query", JSON.stringify(query, null, 2));

        return SeasonWoodmoney.aggregate([
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

            let results = _.chain(data).map(x => {

                //NOTE: wowytype is always Woodmoney in this query

                let all = _.find(x.woodmoney, z => {
                    return z.onoff === constants.on_off.on_ice &&
                        z.wowytype === constants.wowy_type.woodmoney &&
                        z.woodmoneytier === constants.woodmoney_tier.all;
                });

                if (!all) {
                    console.log("data issue.... (missing all)");
                    return null;
                }

                let all_toi = all.evtoi;

                return _.chain(x.woodmoney).map((y) => {

                    if (y.onoff === constants.on_off.off_ice) return null;

                    let off = _.find(x.woodmoney, z => {
                        return z.onoff === constants.on_off.off_ice && y.wowytype === z.wowytype && y.woodmoneytier === z.woodmoneytier;
                    });

                    if (!off) {
                        console.log("data issue.... (missing off)");
                        return null;
                    }

                    let rel_comp_stats = {
                        'ctoipct': (y.evtoi / all_toi) * 100,
                        'cf60rc': y.cf60 - off.cf60,
                        'ca60rc': y.ca60 - off.ca60,
                        'cfpctrc': y.cfpct - off.cfpct,
                        'cfpctra': 0, //TODO
                        'dff60rc': y.dff60 - off.dff60,
                        'dfa60rc': y.dfa60 - off.dfa60,
                        'dffpctrc': y.dffpct - off.dffpct,
                        'dffpctra': 0 //TODO
                    };

                    // y.evtoi = y.evtoi/60;// convert to minutes
                    // till we get a real nhlplayers collection
                    y.ppossible = y.ppossible || ['C'];

                    let formatted_data = {
                        evtoi: y.evtoi/60
                    };

                    return _.extend(rel_comp_stats, x._id, y, formatted_data);

                }).compact().value();

            }).flatten().value();

            // console.log("summary");
            // _.each(results, x => {
            //     if(x.season === 20182019){
            //         console.log(x.season, x.woodmoneytier, x.evtoi, x.ctoipct);
            //     }
            // });
            // console.log("summary2");

            return Promise.resolve(results);

        }, (err) => {
            return Promise.reject(err);
        });
    };
};