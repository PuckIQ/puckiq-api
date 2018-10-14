// For functions directly calling NHL game data
const nhlAPI = 'https://statsapi.web.nhl.com/api/v1/';

const timezone = require('moment-timezone');
const moment = require('moment');
const rq = require('request');

const today = moment.tz('America/New_York').subtract(4, 'hours');
const adjToday = today.format('YYYY-MM-DD');
const season = parseInt(today.format('M')) >= 10 ? today.format('YYYY') + today.add(1, 'year').format('YYYY') : today.subtract(1, 'year').format('YYYY') + today.format('YYYY');

function NHLHandler(config) {

  this.getTodaysGames = function (req, res) {
    let schedOptions = 'schedule?startDate=' + adjToday + '&endDate=' + adjToday + '&expand=schedule.linescore,schedule.teams';
    rq.get({ url: nhlAPI + schedOptions, json: true }, (err, response, data) => {
      let games = data.dates[0].games;
      let gms = [];
      for(let x = 0; x < games.length; x++) {
        let gm = {};
        gm['_id'] = games[x].gamePk;
        gm['season'] = parseInt(games[x].season);
        gm['status'] = parseInt(games[x].status.statusCode);
        gm['away'] = games[x].teams.away.team.abbreviation;
        gm['away_score'] = games[x].teams.away.score;
        gm['home'] = games[x].teams.home.team.abbreviation;
        gm['home_score'] = games[x].teams.home.score;
        gm['period'] = games[x].linescore.currentPeriod;
        gms.push(gm);
      }
      res.send(gms);
    });
  }

}

module.exports = NHLHandler;