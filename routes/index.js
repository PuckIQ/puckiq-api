var GamesHandler = require('./games');
var TeamsHandler = require('./games');
var PlayersHandler = require('./games');

module.exports = exports = function(app, request) {
  var gamesHandler = new GamesHandler(request);
  var teamsHandler = new TeamsHandler(request);
  var playersHandler = new PlayersHandler(request);

}