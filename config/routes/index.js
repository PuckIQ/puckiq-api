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
    app.get('/wowy', format_get_for_testing, (req, res) => stats.getWowy(req, res));
    app.post('/wowy', (req, res) => stats.getWowy(req, res));
    app.get('/wowy/seasons', (req, res) => stats.wowySeasons(req, res));

    app.get('/woodmoney', format_get_for_testing,(req, res) => stats.getWoodmoney(req, res));
    app.post('/woodmoney', (req, res) => stats.getWoodmoney(req, res));
    app.get('/woodmoney/seasons', (req, res) => stats.woodMoneySeasons(req, res));

    //TODO sean
    //app.get('/nhl/m5/todaygames', cache.withTtl('5 minutes'), nhlHandler.getTodaysGames);
};