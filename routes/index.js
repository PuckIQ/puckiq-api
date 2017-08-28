var GamesHandler = require('./games');
var TeamsHandler = require('./teams');
var PlayersHandler = require('./players');
var WowyHandler = require('./wowy');
var WoodWowyHandler = require('./woodwowy');
var WoodMoneyHandler = require('./woodmoney');

module.exports = exports = function(app, cache, request) {
  var gamesHandler = new GamesHandler(request);
  var teamsHandler = new TeamsHandler(request);
  var playersHandler = new PlayersHandler(request);
  var wowyHandler = new WowyHandler(request);
  var woodWowyHandler = new WoodWowyHandler(request);
  var woodMoneyHandler = new WoodMoneyHandler(request);

  // Team Queries
  app.get('/puckiq/teams/season/:season', teamsHandler.getAllTeams);
  app.get('/puckiq/teams/season/:season/team/:abbr', teamsHandler.getAllTeams);

  // Game Schedule
  app.get('/puckiq/schedule/:simplegamedate', gamesHandler.getGameDate);

  // Roster Queries
  //app.get('/puckiq/roster/season/:season', playersHandler.getAllPlayers);
  //app.get('/puckiq/roster/season/:season/team/:teamabbr', playersHandler.getAllPlayers);
  // Future Use
  //app.get('/puckiq/roster/game/:_id', teamsHandler.getAllTeams);
  //app.get('/puckiq/roster/game/:_id/team/:teamabbr', teamsHandler.getAllTeams);

  // WoodMoney Specific Queries using qwoodmoney.js
  app.get('/puckiq/woodmoney/:qmethod/season/:season', woodMoneyHandler.getWoodMoney);
  app.get('/puckiq/woodmoney/:qmethod/team/:Team/season/:season', woodMoneyHandler.getWoodMoney);
  app.get('/puckiq/woodmoney/:qmethod/player/:PlayerId', woodMoneyHandler.getWoodMoney);
  app.get('/puckiq/woodmoney/:qmethod/player/:PlayerId/team/:Team', woodMoneyHandler.getWoodMoney);
  app.get('/puckiq/woodmoney/:qmethod/player/:PlayerId/team/:Team/season/:season', woodMoneyHandler.getWoodMoney);
  app.get('/puckiq/woodmoney/:qmethod/player/:PlayerId/season/:season', woodMoneyHandler.getWoodMoney);

  // WOWY Generic Queries using qgeneric.js
  app.get('/puckiq/woodmoney-gen/:qmethod', cache.withTtl('1 day'), woodMoneyHandler.getSeasons);

  // WOWY Specific Queries using qwowy.js
  app.get('/puckiq/wowy/:qmethod/team/:Team/season/:season', wowyHandler.getWowy);
  app.get('/puckiq/wowy/:qmethod/player/:Player1Id', wowyHandler.getWowy);
  app.get('/puckiq/wowy/:qmethod/player/:Player1Id/season/:season', wowyHandler.getWowy);
  app.get('/puckiq/wowy/:qmethod/player1/:Player1Id/player2/:Player2Id', wowyHandler.getWowy);
  app.get('/puckiq/wowy/:qmethod/player1/:Player1Id/player2/:Player2Id/season/:season', wowyHandler.getWowy);

  // WOWY Generic Queries using qgeneric.js
  app.get('/puckiq/wowy-gen/:qmethod', cache.withTtl('1 day'), wowyHandler.getSeasons);

  // WoodWOWY Specific Queries using qwoodwowy.js
  app.get('/puckiq/woodwowy/:qmethod/team/:Team/season/:season', woodWowyHandler.getWoodWowy);
  app.get('/puckiq/woodwowy/:qmethod/player/:Player1Id', woodWowyHandler.getWoodWowy);
  app.get('/puckiq/woodwowy/:qmethod/player/:Player1Id/season/:season', woodWowyHandler.getWoodWowy);
  app.get('/puckiq/woodwowy/:qmethod/player1/:Player1Id/player2/:Player2Id', woodWowyHandler.getWoodWowy);
  app.get('/puckiq/woodwowy/:qmethod/player1/:Player1Id/player2/:Player2Id/season/:season', woodWowyHandler.getWoodWowy);

  // WoodWOWY Generic Queries using qgeneric.js
  app.get('/puckiq/woodwowy-gen/:qmethod', cache.withTtl('1 day'), woodWowyHandler.getSeasons);
}