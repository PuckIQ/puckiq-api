module.exports = exports = function (app, locator) {

    app.use(function(req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    });

    // test for shawn...
    app.get('/', (req, res) => {
        res.render('index', { message: 'Welcome to PuckIQ!' })
    });

    let PlayerController = require('../../modules/players/controller');
    let players = new PlayerController(locator);
    app.get('/players/search', (req, res) => players.search(req, res));
    app.get('/players/:player_id', (req, res) => players.get(req, res));

    const format_get_for_testing = (req, res, next) => {
        req.body = req.query;
        next();
    };

    let StatsController = require('../../modules/stats/controller');
    let stats = new StatsController(locator);
    app.get('/about', (req, res) => res.render("about"));
    app.get('/contact', (req, res) => res.render("contact"));
    app.get('/terms_of_service', (req, res) => res.render("tos"));

    app.get('/woodwowy', format_get_for_testing, (req, res) => stats.getWowy(req, res));
    app.post('/woodwowy', (req, res) => stats.getWowy(req, res));
    app.get('/woodwowy/seasons', (req, res) => stats.wowySeasons(req, res));

    app.get('/woodmoney', format_get_for_testing,(req, res) => stats.getWoodmoney(req, res));
    app.post('/woodmoney', (req, res) => stats.getWoodmoney(req, res));
    app.get('/woodmoney/seasons', (req, res) => stats.woodMoneySeasons(req, res));

    app.get('/shifts', format_get_for_testing,(req, res) => stats.getShifts(req, res));
    app.post('/shifts', (req, res) => stats.getShifts(req, res));

    let PuckpediaController = require('../../modules/puckpedia/controller');
    let puckpedia = new PuckpediaController(locator);
    app.get('/puckpedia', (req, res) => puckpedia.getNightlyStats(req, res));
    app.post('/puckpedia', (req, res) => puckpedia.getNightlyStats(req, res));

    app.get('/refresh', (req, res) => {
        let player_cache = locator.get('player_cache');
        player_cache.refresh();
        res.send("cache refreshed");
    });

    app.get('/version', (req, res) => res.send("1.0.2"));

    app.get('/alive', (req, res) => {
        res.send("alive");
    });

};
