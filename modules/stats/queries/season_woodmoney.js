"use strict";

const _ = require("lodash");
const constants = require('../../../common/constants');
const MongoHelpers = require('../../../common/mongo_helpers');
const AppException = require('../../../common/app_exception');

module.exports = (mongoose, config) => {

    return (options, player_dict) => {

        let SeasonWoodmoney = mongoose.model('SeasonWoodmoney');
        let helper = new MongoHelpers();

        //NOTE: we need both and calculate the rels
        if (options.onoff) delete options.onoff;

        // if (options.woodmoneytier) {
        //     if (_.has(constants.woodmoney_tier, options.woodmoneytier)) {
        //         options.woodmoneytier = constants.woodmoney_tier[options.woodmoneytier];
        //     }
        //     if (!!~_.values(constants.woodmoney_tier).indexOf(options.woodmoneytier)) {
        //         return Promise.reject(new AppException(constants.exceptions.invalid_argument,
        //             "Invalid woodmoneytier",
        //             {woodmoneytier: options.woodmoneytier})
        //         );
        //     }
        // }

        let query = helper.mongoQueryBuilder(options);

        return SeasonWoodmoney.aggregate([
            { $match: query },
            {
                $group: {
                    _id: {
                        player_id: '$playerid',
                        season: '$season',
                        //gametype: '$gametype',
                    },
                    woodmoney: {
                        $push: {
                            player_id: '$_id.player_id',
                            team: '$team',
                            onoff: '$onoff',
                            wowytype : '$wowytype',
                            woodmoneytier : '$woodmoneytier',
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

                let player_info = {
                    name : 'unknown',
                    positions : ['?']
                };

                // y.evtoi = y.evtoi/60;// convert to minutes
                // till we get a real nhlplayers collection
                if(_.has(player_dict, x._id.player_id)) {
                    player_info.name = player_dict[x._id.player_id].name;
                    player_info.positions = player_dict[x._id.player_id].positions;
                } else {
                    console.log("cannot find player", x._id.player_id);
                }

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
                        'ozspct': (y.oz / ((y.oz + y.dz) || 1))*100,
                        'fo60' : (y.oz+y.nz+y.dz)/(y.evtoi||1)*3600,
                        'ctoipct': (y.evtoi / (all_toi||1)) * 100,
                        'cf60rc': y.cf60 - off.cf60,
                        'ca60rc': y.ca60 - off.ca60,
                        'cfpctrc': y.cfpct - off.cfpct,
                        'cfpctra': 0, //TODO
                        'dff60rc': y.dff60 - off.dff60,
                        'dfa60rc': y.dfa60 - off.dfa60,
                        'dffpctrc': y.dffpct - off.dffpct,
                        'dffpctra': 0 //TODO
                    };

                    let formatted_data = {
                        evtoi: y.evtoi / 60
                    };

                    return _.extend({}, x._id, player_info, rel_comp_stats, y, formatted_data);

                }).compact().value();

            }).flatten().value();

            // console.log("summary");
            // _.each(results, x => {
            //     //if(x.season === 20182019){
            //         console.log(x.season, x.woodmoneytier, x.evtoi, x.ctoipct);
            //     //}
            // });
            // console.log("summary2");

            return Promise.resolve(results);

        }, (err) => {
            return Promise.reject(err);
        });
    };
};