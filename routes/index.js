var PuckIQHandler = require('./puckiq');

module.exports = exports = function (app, cache, request) {
  var puckIQHandler = new PuckIQHandler(request);

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

  // Teams
  /*app.get('/puckiq/t/:qtype/:qmethod', puckIQHandler.getStaticPuckIQ);
  app.get('/puckiq/t/:qtype/:qmethod/team/:abbr', puckIQHandler.getOptionPuckIQ);
  app.get('/puckiq/t/:qtype/:qmethod/team/:abbr/season/:season', puckIQHandler.getOptionPuckIQ);
  app.get('/puckiq/t/:qtype/:qmethod/teamseasonid/:_id', puckIQHandler.getOptionPuckIQ);
  app.get('/puckiq/t/:qtype/:qmethod/conference/:conference', puckIQHandler.getOptionPuckIQ);
  app.get('/puckiq/t/:qtype/:qmethod/conference/:conference/season/:season', puckIQHandler.getOptionPuckIQ);
  app.get('/puckiq/t/:qtype/:qmethod/division/:division', puckIQHandler.getOptionPuckIQ);
  app.get('/puckiq/t/:qtype/:qmethod/division/:division/season/:season', puckIQHandler.getOptionPuckIQ);

  // Game Roster
  app.get('/puckiq/r/:qtype/:qmethod/game/:_id', puckIQHandler.getOptionPuckIQ);
  app.get('/puckiq/r/:qtype/:qmethod/gamedate/:gamedate', puckIQHandler.getOptionPuckIQ);
  app.get('/puckiq/r/:qtype/:qmethod/team/:team', cache.withTtl('1 hour'), puckIQHandler.getOptionPuckIQ);
  app.get('/puckiq/r/:qtype/:qmethod/team/:team/season/:season', cache.withTtl('1 hour'), puckIQHandler.getOptionPuckIQ);
  app.get('/puckiq/r/:qtype/:qmethod/player/:playerid', cache.withTtl('1 hour'), puckIQHandler.getOptionPuckIQ);
  app.get('/puckiq/r/:qtype/:qmethod/player/:playerid/season/:season', cache.withTtl('1 hour'), puckIQHandler.getOptionPuckIQ);
  app.get('/puckiq/r/:qtype/:qmethod/playerseasonid/:playerseasonid', cache.withTtl('1 hour'), puckIQHandler.getOptionPuckIQ);

  // Game Schedules
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
  app.get('/puckiq/p/:qtype/:qmethod/playername/:fullName', puckIQHandler.getOptionPuckIQ);

  // WoodMoney
  app.get('/puckiq/wm/:qtype/:qmethod/season/:season', cache.withTtl('1 hour'), puckIQHandler.getOptionPuckIQ);
  app.get('/puckiq/wm/:qtype/:qmethod/team/:Team', cache.withTtl('1 hour'), puckIQHandler.getOptionPuckIQ);
  app.get('/puckiq/wm/:qtype/:qmethod/team/:Team/season/:season', cache.withTtl('1 hour'), puckIQHandler.getOptionPuckIQ);
  app.get('/puckiq/wm/:qtype/:qmethod/player/:PlayerId', puckIQHandler.getOptionPuckIQ);
  app.get('/puckiq/wm/:qtype/:qmethod/player/:PlayerId/team/:Team', puckIQHandler.getOptionPuckIQ);
  app.get('/puckiq/wm/:qtype/:qmethod/player/:PlayerId/team/:Team/season/:season', puckIQHandler.getOptionPuckIQ);
  app.get('/puckiq/wm/:qtype/:qmethod/player/:PlayerId/season/:season', puckIQHandler.getOptionPuckIQ);

  // WOWY By Game
  app.get('/puckiq/wg/:qtype/:qmethod/game/:q1gameid', puckIQHandler.getOptionPuckIQ);
  app.get('/puckiq/wg/:qtype/:qmethod/datestart/:q1datestart/dateend/:q1dateend', cache.withTtl('1 hour'), puckIQHandler.getOptionPuckIQ);
  app.get('/puckiq/wg/:qtype/:qmethod/datestart/:q1datestart/dateend/:q1dateend/player/:q2player1id', cache.withTtl('1 hour'), puckIQHandler.getOptionPuckIQ);
  app.get('/puckiq/wg/:qtype/:qmethod/datestart/:q1datestart/dateend/:q1dateend/player1/:q2player1id/player2/:q2player2id', cache.withTtl('1 hour'), puckIQHandler.getOptionPuckIQ);
  app.get('/puckiq/wg/:qtype/:qmethod/team/:q1team/player/:q2player1id', cache.withTtl('1 hour'), puckIQHandler.getOptionPuckIQ);
  app.get('/puckiq/wg/:qtype/:qmethod/team/:q1team/player1/:q2player1id/player2/:q2player2id', cache.withTtl('1 hour'), puckIQHandler.getOptionPuckIQ);
  app.get('/puckiq/wg/:qtype/:qmethod/player/:q2player1id', cache.withTtl('1 hour'), puckIQHandler.getOptionPuckIQ);
  app.get('/puckiq/wg/:qtype/:qmethod/player1/:q2player1id/player2/:q2player2id', cache.withTtl('1 hour'), puckIQHandler.getOptionPuckIQ);

  // WOWY By Season
  app.get('/puckiq/ws/:qtype/:qmethod/season/:season', cache.withTtl('1 hour'), puckIQHandler.getOptionPuckIQ);
  app.get('/puckiq/ws/:qtype/:qmethod/team/:team', cache.withTtl('1 hour'), puckIQHandler.getOptionPuckIQ);
  app.get('/puckiq/ws/:qtype/:qmethod/team/:team/season/:season', cache.withTtl('1 hour'), puckIQHandler.getOptionPuckIQ);
  app.get('/puckiq/ws/:qtype/:qmethod/player/:player1id', puckIQHandler.getOptionPuckIQ);
  app.get('/puckiq/ws/:qtype/:qmethod/player/:player1id/season/:season', puckIQHandler.getOptionPuckIQ);
  app.get('/puckiq/ws/:qtype/:qmethod/player1/:player1id/player2/:player2id', puckIQHandler.getOptionPuckIQ);
  app.get('/puckiq/ws/:qtype/:qmethod/player1/:player1id/player2/:player2id/season/:season', puckIQHandler.getOptionPuckIQ);

  // WoodWOWY
  app.get('/puckiq/ww/:qtype/:qmethod/season/:season', puckIQHandler.getOptionPuckIQ);
  app.get('/puckiq/ww/:qtype/:qmethod/team/:Team', puckIQHandler.getOptionPuckIQ);
  app.get('/puckiq/ww/:qtype/:qmethod/team/:Team/season/:season', puckIQHandler.getOptionPuckIQ);
  app.get('/puckiq/ww/:qtype/:qmethod/player/:Player1Id', puckIQHandler.getOptionPuckIQ);
  app.get('/puckiq/ww/:qtype/:qmethod/player/:Player1Id/season/:season', puckIQHandler.getOptionPuckIQ);
  app.get('/puckiq/ww/:qtype/:qmethod/player1/:Player1Id/player2/:Player2Id', puckIQHandler.getOptionPuckIQ);
  app.get('/puckiq/ww/:qtype/:qmethod/player1/:Player1Id/player2/:Player2Id/season/:season', puckIQHandler.getOptionPuckIQ);

  // Reserved for lists (seasons & counts)
  app.get('/puckiq/g/:qtype/:qmethod', puckIQHandler.getStaticPuckIQ);*/
}