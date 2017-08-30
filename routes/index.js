var PuckIQHandler = require('./puckiq');

module.exports = exports = function(app, cache, request) {
  var puckIQHandler = new PuckIQHandler(request);

  // Teams
  app.get('/puckiq/:qtype/:qmethod/abbr/:abbr', puckIQHandler.getOptionPuckIQ);
  app.get('/puckiq/:qtype/:qmethod/abbr/:abbr/season/:season', puckIQHandler.getOptionPuckIQ);
  app.get('/puckiq/:qtype/:qmethod/teamseasonid/:_id', puckIQHandler.getOptionPuckIQ);
  app.get('/puckiq/:qtype/:qmethod/conference/:conference', puckIQHandler.getOptionPuckIQ);
  app.get('/puckiq/:qtype/:qmethod/division/:division', puckIQHandler.getOptionPuckIQ);

  // Game Roster
  app.get('/puckiq/:qtype/:qmethod/game/:_id', puckIQHandler.getOptionPuckIQ);
  app.get('/puckiq/:qtype/:qmethod/gamedate/:gamedate', puckIQHandler.getOptionPuckIQ);

  // Game Schedule
  app.get('/puckiq/:qtype/:qmethod/date/:simplegamedate', puckIQHandler.getOptionPuckIQ);

  // Players
  app.get('/puckiq/:qtype/:qmethod/team/:teamabbr', puckIQHandler.getOptionPuckIQ);
  app.get('/puckiq/:qtype/:qmethod/team/:teamabbr/season/:season', puckIQHandler.getOptionPuckIQ);
  app.get('/puckiq/:qtype/:qmethod/player/:playerid', puckIQHandler.getOptionPuckIQ);
  app.get('/puckiq/:qtype/:qmethod/player/:playerid/team/:teamabbr', puckIQHandler.getOptionPuckIQ);
  app.get('/puckiq/:qtype/:qmethod/player/:playerid/season/:season', puckIQHandler.getOptionPuckIQ);
  app.get('/puckiq/:qtype/:qmethod/player/:playerid/team/:teamabbr/season/:season', puckIQHandler.getOptionPuckIQ);

  // WoodMoney
  app.get('/puckiq/:qtype/:qmethod/season/:season', puckIQHandler.getOptionPuckIQ);
  app.get('/puckiq/:qtype/:qmethod/team/:Team', puckIQHandler.getOptionPuckIQ);
  app.get('/puckiq/:qtype/:qmethod/team/:Team/season/:season', puckIQHandler.getOptionPuckIQ);
  app.get('/puckiq/:qtype/:qmethod/player/:PlayerId', puckIQHandler.getOptionPuckIQ);
  app.get('/puckiq/:qtype/:qmethod/player/:PlayerId/team/:Team', puckIQHandler.getOptionPuckIQ);
  app.get('/puckiq/:qtype/:qmethod/player/:PlayerId/team/:Team/season/:season', puckIQHandler.getOptionPuckIQ);
  app.get('/puckiq/:qtype/:qmethod/player/:PlayerId/season/:season', puckIQHandler.getOptionPuckIQ);

  // WOWY & WoodWOWY
  app.get('/puckiq/:qtype/:qmethod/player/:Player1Id', puckIQHandler.getOptionPuckIQ);
  app.get('/puckiq/:qtype/:qmethod/player/:Player1Id/season/:season', puckIQHandler.getOptionPuckIQ);
  app.get('/puckiq/:qtype/:qmethod/player1/:Player1Id/player2/:Player2Id', puckIQHandler.getOptionPuckIQ);
  app.get('/puckiq/:qtype/:qmethod/player1/:Player1Id/player2/:Player2Id/season/:season', puckIQHandler.getOptionPuckIQ);

  // Reserved for lists (seasons & counts)
  app.get('/puckiq/:qtype/:qmethod', cache.withTtl('2 minutes'), puckIQHandler.getOptionPuckIQ);
  app.get('/puckiq/s/:qtype/:qmethod', cache.withTtl('1 day'), puckIQHandler.getStaticPuckIQ);
}