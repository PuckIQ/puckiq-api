const _ = require('lodash');
const AppException = require('../../common/app_exception');
const constants = require('../../common/constants');

class StatsController {

    constructor(locator) {
        this.locator = locator;
    }

    /**
     */
    get(req, res) {

        if(!req.params.player_id){
            let ex = new AppException(constants.exceptions.missing_argument, "Missing argument: playerid");
            return this.error_handler.handle(req, res, ex);
        }

        let player_id = parseInt(req.params.player_id);
        if(!player_id){
            let ex = new AppException(constants.exceptions.invalid_argument, "Invalid argument: playerid", {player_id});
            return this.error_handler.handle(req, res, ex);
        }

        let Player = this.locator.get('mongoose').model('Player');

        Player.find({playerid : player_id}).sort({ conference: 1, division: 1 })
            .then((results) => {
                return res.jsonp(results);
        }, (err) => {
            let ex = new AppException(constants.exceptions.database_error, "Error retrieving player", { err: err });
            return this.error_handler.handle(req, res, ex);
        });

    }

    /**
     */
    search(req, res) {

        if(!req.query.q){
            let ex = new AppException(constants.exceptions.missing_argument, "Missing argument: q");
            return this.error_handler.handle(req, res, ex);
        }

        const regex = new RegExp('.*' + req.query.q + '.*', 'i');

        this.locator.get('player_cache').all().then((player_dict) => {

            let matches = [];
            _.each(_.values(player_dict), (p) => {

                if(regex.test(p.name)){
                    matches.push({
                        player_id : p.playerid,
                        name : p.name,
                        positions : p.positions
                    });
                }

                if(matches.length > 10) return false;

            });

            res.jsonp(matches);

        }, (e) => {
            let ex = new AppException(constants.exceptions.database_error, "Error searching player Woodmoney", { err: e });
            return this.error_handler.handle(req, res, ex);
        });

    }

}

module.exports = StatsController;