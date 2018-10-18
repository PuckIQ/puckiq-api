const PuckIQHandler = require('./puckiq');

class StatsController {

    constructor(config, error_handler) {
        this.puckIQHandler = new PuckIQHandler(config);
        this.error_handler = error_handler;
    }

    /**
     */
    search(req, res) {

        let options = req.query;

        this.puckIQHandler._getPuckIQData('players', 'getPlayerSearch', options, (err, results) => {
            if(err) return this.error_handler.handle(err);
            res.jsonp(results);
        });
    }

}

module.exports = StatsController;