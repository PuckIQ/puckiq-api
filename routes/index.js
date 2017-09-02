var PuckIQHandler = require('./puckiq');

module.exports = exports = function(app, cache, request) {
  var puckIQHandler = new PuckIQHandler(request);

  // Teams
  app.get('/puckiq/t/:qtype/:qmethod', puckIQHandler.getStaticPuckIQ);
  app.get('/puckiq/t/:qtype/:qmethod/abbr/:abbr', puckIQHandler.getOptionPuckIQ);
  app.get('/puckiq/t/:qtype/:qmethod/abbr/:abbr/season/:season', puckIQHandler.getOptionPuckIQ);
  app.get('/puckiq/t/:qtype/:qmethod/teamseasonid/:_id', puckIQHandler.getOptionPuckIQ);
  app.get('/puckiq/t/:qtype/:qmethod/conference/:conference', puckIQHandler.getOptionPuckIQ);
  app.get('/puckiq/t/:qtype/:qmethod/division/:division', puckIQHandler.getOptionPuckIQ);

  // Game Roster
  app.get('/puckiq/r/:qtype/:qmethod/game/:_id', puckIQHandler.getOptionPuckIQ);
  app.get('/puckiq/r/:qtype/:qmethod/gamedate/:gamedate', puckIQHandler.getOptionPuckIQ);

  // Game Schedule
  app.get('/puckiq/s/:qtype/:qmethod/season/:season', puckIQHandler.getOptionPuckIQ);
  app.get('/puckiq/s/:qtype/:qmethod/team/:tm/season/:season', puckIQHandler.getOptionPuckIQ);
  app.get('/puckiq/s/:qtype/:qmethod/gamedate/:simplegamedate', puckIQHandler.getOptionPuckIQ);

  // Players
  app.get('/puckiq/p/:qtype/:qmethod/season/:season', puckIQHandler.getOptionPuckIQ);
  app.get('/puckiq/p/:qtype/:qmethod/team/:teamabbr', puckIQHandler.getOptionPuckIQ);
  app.get('/puckiq/p/:qtype/:qmethod/team/:teamabbr/season/:season', puckIQHandler.getOptionPuckIQ);
  app.get('/puckiq/p/:qtype/:qmethod/player/:playerid', puckIQHandler.getOptionPuckIQ);
  app.get('/puckiq/p/:qtype/:qmethod/player/:playerid/team/:teamabbr', puckIQHandler.getOptionPuckIQ);
  app.get('/puckiq/p/:qtype/:qmethod/player/:playerid/team/:teamabbr/season/:season', puckIQHandler.getOptionPuckIQ);
  app.get('/puckiq/p/:qtype/:qmethod/player/:playerid/season/:season', puckIQHandler.getOptionPuckIQ);

  // WoodMoney
  app.get('/puckiq/wm/:qtype/:qmethod/season/:season', puckIQHandler.getOptionPuckIQ);
  app.get('/puckiq/wm/:qtype/:qmethod/team/:Team', puckIQHandler.getOptionPuckIQ);
  app.get('/puckiq/wm/:qtype/:qmethod/team/:Team/season/:season', puckIQHandler.getOptionPuckIQ);
  app.get('/puckiq/wm/:qtype/:qmethod/player/:PlayerId', puckIQHandler.getOptionPuckIQ);
  app.get('/puckiq/wm/:qtype/:qmethod/player/:PlayerId/team/:Team', puckIQHandler.getOptionPuckIQ);
  app.get('/puckiq/wm/:qtype/:qmethod/player/:PlayerId/team/:Team/season/:season', puckIQHandler.getOptionPuckIQ);
  app.get('/puckiq/wm/:qtype/:qmethod/player/:PlayerId/season/:season', puckIQHandler.getOptionPuckIQ);

  // WOWY
  app.get('/puckiq/wy/:qtype/:qmethod/game/:gameid', puckIQHandler.getOptionPuckIQ);
  app.get('/puckiq/wy/:qtype/:qmethod/season/:season', puckIQHandler.getOptionPuckIQ);
  app.get('/puckiq/wy/:qtype/:qmethod/team/:team', puckIQHandler.getOptionPuckIQ);
  app.get('/puckiq/wy/:qtype/:qmethod/team/:team/season/:season', puckIQHandler.getOptionPuckIQ);
  app.get('/puckiq/wy/:qtype/:qmethod/player/:player1id', puckIQHandler.getOptionPuckIQ);
  app.get('/puckiq/wy/:qtype/:qmethod/player/:player1id/season/:season', puckIQHandler.getOptionPuckIQ);
  app.get('/puckiq/wy/:qtype/:qmethod/player1/:player1id/player2/:player2id', puckIQHandler.getOptionPuckIQ);
  app.get('/puckiq/wy/:qtype/:qmethod/player1/:player1id/player2/:player2id/season/:season', puckIQHandler.getOptionPuckIQ);

  // WoodWOWY
  app.get('/puckiq/w/:qtype/:qmethod/season/:season', puckIQHandler.getOptionPuckIQ);
  app.get('/puckiq/w/:qtype/:qmethod/team/:Team', puckIQHandler.getOptionPuckIQ);
  app.get('/puckiq/w/:qtype/:qmethod/team/:Team/season/:season', puckIQHandler.getOptionPuckIQ);
  app.get('/puckiq/w/:qtype/:qmethod/player/:Player1Id', puckIQHandler.getOptionPuckIQ);
  app.get('/puckiq/w/:qtype/:qmethod/player/:Player1Id/season/:season', puckIQHandler.getOptionPuckIQ);
  app.get('/puckiq/w/:qtype/:qmethod/player1/:Player1Id/player2/:Player2Id', puckIQHandler.getOptionPuckIQ);
  app.get('/puckiq/w/:qtype/:qmethod/player1/:Player1Id/player2/:Player2Id/season/:season', puckIQHandler.getOptionPuckIQ);

  // Reserved for lists (seasons & counts)
  app.get('/puckiq/g/:qtype/:qmethod', puckIQHandler.getStaticPuckIQ);
}