// For functions directly calling NHL game data
const timezone = require('moment-timezone');
const moment = require('moment');
const PuckIQHandler = require('./puckiq');

const today = moment.tz('America/New_York').subtract(4, 'hours');
const adjToday = today.format('YYYY-MM-DD');
const season = parseInt(today.format('M')) >= 10 ? today.format('YYYY') + today.add(1, 'year').format('YYYY') : today.subtract(1, 'year').format('YYYY') + today.format('YYYY');

class StatsController {

    constructor(config, error_handler) {
        this.puckIQHandler = new PuckIQHandler(config);
        this.error_handler = error_handler;
    }

    /**
     * query
     *  player_id* : string,
     *  season_id : string,
     *  range : {from, to }
     *  position : string,
     *  teammate : [palyer_ids]
     */
    getWowyStats(req, res) {

        let options = req.query;

        this.puckIQHandler._getPuckIQData('schedule', 'getRangeWowy', options, (err, results) => {
            if(err) return this.error_handler.handle(err);
            res.jsonp(results);
        });
    }

    /**
     * query
     *  team : string,
     *  player_id : [],
     *  player_id : [],
     *  season_id : string,
     *  range : {from, to }
     *  position : string,
     *
     *  team or player_ids is required
     */
    getWoodmoneyStats(req, res) {

        let options = req.query;

        this.puckIQHandler._getPuckIQData('schedule', 'getRangeWoodMoney', options, (err, results) => {
            if(err) return this.error_handler.handle(err);
            res.jsonp(results);
        });
    }

}

module.exports = StatsController;