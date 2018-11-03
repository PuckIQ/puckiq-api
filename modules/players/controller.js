const AppException = require('../../common/app_exception');
const constants = require('../../common/constants');

class StatsController {

    constructor(locator) {
        this.locator = locator;
    }

    /**
     */
    search(req, res) {

        let Player = locator.get('mongoose').model('Player');

        let regex = new RegExp('.*' + req.query.fullName + '.*', 'i');

        return Player.aggregate([
            { $match: { fullName: regex } },
            { $group: { _id: { fullName: '$fullName', playerid: '$playerid' } } },
            { $limit: 10 },
            { $project: { fullName: '$_id.fullName', playerid: '$_id.playerid', _id: 0 } }
        ]).then((results) => {
            res.jsonp(results);
        }, (err) => {
            let ex = new AppException(constants.exceptions.database_error, "Error searching players", { err: err });
            return this.error_handler.handle(ex);
        });
    }

}

module.exports = StatsController;