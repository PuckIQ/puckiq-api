const PuckIQHandler = require('./puckiq');

module.exports = exports = function (app, locator) {

    let config = locator.get('config');
    let error_handler = locator.get('error_handler');

    app.use(function(req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    });

    let cache = {
        withTtl : (x) => {
            return (req, res, next) => {
                console.log('deprecated');
                next();
            };
        }
    };

    let puckIQHandler = new PuckIQHandler(config, error_handler);

    //0/players/getPlayerSearch?_=1539037936003 -- get teamates of connor mcdavid
    app.get('/puckiq/0/:qtype/:qmethod', puckIQHandler.getPuckIQData);
    //m2/schedule/getRangeWoodMoney{"q2playerid":["8478402"]}
    //m2/schedule/getRangeWoodMoney{"q2playerid":["8478402","8477934"]}
    //m2/schedule/getRangeWowy{"q2player1id":"8478402"}
    app.get('/puckiq/m2/:qtype/:qmethod', cache.withTtl('2 minutes'), puckIQHandler.getPuckIQData);
    app.get('/puckiq/m5/:qtype/:qmethod', cache.withTtl('5 minutes'), puckIQHandler.getPuckIQData);
    app.get('/puckiq/m10/:qtype/:qmethod', cache.withTtl('10 minutes'), puckIQHandler.getPuckIQData);
    app.get('/puckiq/m30/:qtype/:qmethod', cache.withTtl('30 minutes'), puckIQHandler.getPuckIQData);
    //h1/seasonwoodmoney/getSeasonList -- get seasons
    app.get('/puckiq/h1/:qtype/:qmethod', cache.withTtl('1 hour'), puckIQHandler.getPuckIQData);
    app.get('/puckiq/h2/:qtype/:qmethod', cache.withTtl('2 hours'), puckIQHandler.getPuckIQData);
    app.get('/puckiq/h6/:qtype/:qmethod', cache.withTtl('6 hours'), puckIQHandler.getPuckIQData);
    app.get('/puckiq/h12/:qtype/:qmethod', cache.withTtl('12 hours'), puckIQHandler.getPuckIQData);
    app.get('/puckiq/d1/:qtype/:qmethod', cache.withTtl('1 day'), puckIQHandler.getPuckIQData);
    app.get('/puckiq/d2/:qtype/:qmethod', cache.withTtl('2 days'), puckIQHandler.getPuckIQData);
    app.get('/puckiq/d7/:qtype/:qmethod', cache.withTtl('7 days'), puckIQHandler.getPuckIQData);
    app.get('/puckiq/d15/:qtype/:qmethod', cache.withTtl('15 days'), puckIQHandler.getPuckIQData);
    app.get('/puckiq/d30/:qtype/:qmethod', cache.withTtl('30 days'), puckIQHandler.getPuckIQData);


    app.get('/', (req, res) => {
        res.render('index', { message: 'Welcome to PuckIQ!' })
    });

    let PlayerController = require('../../modules/players/controller');
    let players = new PlayerController(locator);
    app.get('/player/search', players.search);

    let StatsController = require('../../modules/stats/controller');
    let stats = new StatsController(locator);
    app.get('/wowy/player/:player_id', stats.getWowyForPlayer);
    // app.get('/wowy/team/:team', stats.getWowyForTeam);
    app.get('/woodmoney/player/:player_id', stats.getWoodmoneyForPlayer);
    app.get('/woodmoney/team/:team', stats.getWoodmoneyForTeam);

    //TODO sean
    //app.get('/nhl/m5/todaygames', cache.withTtl('5 minutes'), nhlHandler.getTodaysGames);
};