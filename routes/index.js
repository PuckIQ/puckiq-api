const PuckIQHandler = require('./puckiq');
const NHLHandler = require('./nhl');
const StatsController = require('./stats');

module.exports = exports = function (app, cache, request, config) {

    let error_handler = {
        handle: (err) => {
            console.log(`ERROR: ${err}`);
        }
    };

    let puckIQHandler = new PuckIQHandler(config, error_handler);
    let nhlHandler = new NHLHandler(config, error_handler);
    app.use(function(req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    });

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

    let statsController = new StatsController(config, error_handler);
    app.get('/wowy/player', statsController.getWowyForPlayer);
    app.get('/wowy/team', statsController.getWowyForTeam);
    app.get('/woodmoney/player/:player_id', statsController.getWoodmoneyForPlayer);
    app.get('/woodmoney/team/:team', statsController.getWoodmoneyForTeam);

    app.get('/nhl/m5/todaygames', cache.withTtl('5 minutes'), nhlHandler.getTodaysGames);
};