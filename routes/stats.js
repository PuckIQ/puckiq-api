// For functions directly calling NHL game data
const moment = require('moment');
const timezone = require('moment-timezone');
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
     *  teammate_id : [player_id],
     *  season_id : [int],
     *
     *  Not supported: range
     *
     *  Client side: position
     */
    getWowyForPlayer(req, res) {

        let options = req.query;

        if(!(req.query.teammate_id && req.query.teammate_id.length)) {
            return res.send(400).jsonp({ message: 'invalid request' });
        }

        if(!req.query.season) {
            //todo default season
        }

        this.puckIQHandler._getPuckIQData('schedule', 'getRangeWowy', options, (err, results) => {
            if(err) return this.error_handler.handle(err);
            res.jsonp(results);
        });
    }

    /**
     * query
     *  team : string,
     *  player_id : [],
     *  season_id : [int],
     *  range : {from, to }
     *  position : string,
     *
     *  team or player_ids is required
     */
    getWoodmoneyForPlayer(req, res) {

        let options = req.query;

        this.puckIQHandler._getPuckIQData('schedule', 'getRangeWoodMoney', options, (err, results) => {
            if(err) return this.error_handler.handle(err);
            res.jsonp(results);
        });
    }

    /**
     * team: ie 3 digit code
     * season: if not set, current
     * competition (woodmoneytier)
     *  - possible values Middle/Elite/Gritensity
     * game type (gametype)
     *  - possible values Home, Away, vs East, vs West
     * (position is client side)
     * @param req
     * @param res
     */
    getWoodmoneyForTeam(req, res) {

        //TODO validate...

        let options = { team: req.params.team };

        if(req.query.season) {
            if(_.isArray(req.query.season) && req.query.season.length > 1) {
                options.season = { $in: req.query.season };
            } else {
                options.season = _.isArray(req.query.season) ? req.query.season[0] : req.query.season;
            }
        }

        this.puckIQHandler._getPuckIQData('schedule', 'getSeasonWoodMoney', options, (err, results) => {
            if(err) return this.error_handler.handle(err);
            res.jsonp(results);
        });
    }
}

module.exports = StatsController;