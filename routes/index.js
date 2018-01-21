var PuckIQHandler = require('./puckiq');
var NHLHandler = require('./nhl');

module.exports = exports = function (app, cache, request) {
  var puckIQHandler = new PuckIQHandler(request);
  var nhlHandler = new NHLHandler(request);

  app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

  app.get('/puckiq/0/:qtype/:qmethod', puckIQHandler.getPuckIQData);
  app.get('/puckiq/m2/:qtype/:qmethod', cache.withTtl('2 minutes'), puckIQHandler.getPuckIQData);
  app.get('/puckiq/m5/:qtype/:qmethod', cache.withTtl('5 minutes'), puckIQHandler.getPuckIQData);
  app.get('/puckiq/m10/:qtype/:qmethod', cache.withTtl('10 minutes'), puckIQHandler.getPuckIQData);
  app.get('/puckiq/m30/:qtype/:qmethod', cache.withTtl('30 minutes'), puckIQHandler.getPuckIQData);
  app.get('/puckiq/h1/:qtype/:qmethod', cache.withTtl('1 hour'), puckIQHandler.getPuckIQData);
  app.get('/puckiq/h2/:qtype/:qmethod', cache.withTtl('2 hours'), puckIQHandler.getPuckIQData);
  app.get('/puckiq/h6/:qtype/:qmethod', cache.withTtl('6 hours'), puckIQHandler.getPuckIQData);
  app.get('/puckiq/h12/:qtype/:qmethod', cache.withTtl('12 hours'), puckIQHandler.getPuckIQData);
  app.get('/puckiq/d1/:qtype/:qmethod', cache.withTtl('1 day'), puckIQHandler.getPuckIQData);
  app.get('/puckiq/d2/:qtype/:qmethod', cache.withTtl('2 days'), puckIQHandler.getPuckIQData);
  app.get('/puckiq/d7/:qtype/:qmethod', cache.withTtl('7 days'), puckIQHandler.getPuckIQData);
  app.get('/puckiq/d15/:qtype/:qmethod', cache.withTtl('15 days'), puckIQHandler.getPuckIQData);
  app.get('/puckiq/d30/:qtype/:qmethod', cache.withTtl('30 days'), puckIQHandler.getPuckIQData);

  app.get('/nhl/m5/todaygames', cache.withTtl('5 minutes'), nhlHandler.getTodaysGames);
}