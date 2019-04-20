# PuckIQ API

## Available Query Types

The following query types are exposed for use with the PuckIQ API and are used /puckiq/[x]/[qtype]. **x** is reserverd for particular query types to avoid conflicts due to collection field names.

- schedule
- teams
- players
- roster
- woodmoney
- gamewowy
- seasonwowy
- woodwowy

## Generic Queries

### Methods

**getSeasonList:** Returns a list of all of the seasons available within each collection

**HTTP GET Queries**

- /puckiq/g/schedule/getSeasonList
- /puckiq/g/teams/getSeasonList
- /puckiq/g/players/getSeasonList
- /puckiq/g/roster/getSeasonList
- /puckiq/g/woodmoney/getSeasonList
- /puckiq/g/gamewowy/getSeasonList
- /puckiq/g/seasonwowy/getSeasonList
- /puckiq/g/woodwowy/getSeasonList

**getSeasonCount:** Returns a list of all of the seasons available within each collection along with the count of each document

**HTTP GET Queries**

- /puckiq/g/schedule/getSeasonCount
- /puckiq/g/teams/getSeasonCount
- /puckiq/g/players/getSeasonCount
- /puckiq/g/roster/getSeasonCount
- /puckiq/g/woodmoney/getSeasonCount
- /puckiq/g/gamewowy/getSeasonCount
- /puckiq/g/seasonwowy/getSeasonCount
- /puckiq/g/woodwowy/getSeasonCount

## Schedule Queries

### Methods

**getSchedule:** Returns the full season schedule for all teams

**HTTP GET Queries**

- /puckiq/s/schedule/getSchedule/season/[season]
- /puckiq/s/schedule/getSchedule/gamedate/[gamedate]

**getTeamSchedule:** Returns the full season schedule for a single teams

**HTTP GET Queries**

- /puckiq/s/schedule/getTeamSchedule/team/[team]/season/[season]

## Team Queries

### Methods

**getTeam:** Returns a single team's info

**HTTP GET Queries**

- /puckiq/t/teams/getTeam/team/[team]
- /puckiq/t/teams/getTeam/team/[team]/season/[season]
- /puckiq/t/teams/getTeam/teamseasonid/[teamseasonid]
- /puckiq/t/teams/getTeam/conference/[conference]
- /puckiq/t/teams/getTeam/conference/[conference]/season/[season]
- /puckiq/t/teams/getTeam/division/[division]
- /puckiq/t/teams/getTeam/division/[division]/season/[season]

**getTeamList:** Returns all teams' info

**HTTP GET Queries**

- /puckiq/t/teams/getTeamList

## Player Queries

### Methods

**getPlayer:** Returns player info

**HTTP GET Queries**

- /puckiq/p/players/getPlayer/season/[season]
- /puckiq/p/players/getPlayer/team/[team]
- /puckiq/p/players/getPlayer/team/[team]/season/[season]
- /puckiq/p/players/getPlayer/player/[playerid]
- /puckiq/p/players/getPlayer/player/[playerid]/team/[team]
- /puckiq/p/players/getPlayer/player/[playerid]/team/[team]/season/[season]
- /puckiq/p/players/getPlayer/player/[playerid]/season/[season]

## Roster Queries

### Methods

**getGameRoster:** Returns roster info for games

**HTTP GET Queries**

- /puckiq/r/roster/getGameRoster/game/[gameid]
- /puckiq/r/roster/getGameRoster/gamedate/[gamedate]

**getRosters:** Returns roster info by game, player or team

**HTTP GET Queries**

- /puckiq/r/roster/getRosters/game/[gameid]
- /puckiq/r/roster/getRosters/gamedate/[gamedate]
- /puckiq/r/roster/getRosters/team/[team]
- /puckiq/r/roster/getRosters/team/[team]/season/[season]
- /puckiq/r/roster/getRosters/player/[playerid]
- /puckiq/r/roster/getRosters/player/[playerid]/season/[season]
- /puckiq/r/roster/getRosters/playerseasonid/[playerseasonid]

## WoodMoney Queries

### Methods

**getWoodMoney:** Returns WoodMoney info by season

**HTTP GET Queries**

- /puckiq/wm/woodmoney/getWoodMoney/season/[season]
- /puckiq/wm/woodmoney/getWoodMoney/team/[team]
- /puckiq/wm/woodmoney/getWoodMoney/team/[team]/season/[season]
- /puckiq/wm/woodmoney/getWoodMoney/player/[playerid]
- /puckiq/wm/woodmoney/getWoodMoney/player/[playerid]/team/[team]
- /puckiq/wm/woodmoney/getWoodMoney/player/[playerid]/team/[team]/season/[season]
- /puckiq/wm/woodmoney/getWoodMoney/player/[playerid]/season/[season]

## WOWY Range Queries

### Methods

**getRangeWowy:** Returns WOWY info by game, date range, player and player comp

**HTTP GET Queries**

- /puckiq/wg/schedule/getRangeWowy/game/[gameid]
- /puckiq/wg/schedule/getRangeWowy/datestart/[date]/dateend/[date]
- /puckiq/wg/schedule/getRangeWowy/datestart/[date]/dateend/[date]/player/[playerid]
- /puckiq/wg/schedule/getRangeWowy/datestart/[date]/dateend/[date]/player1/[playerid]/player2/[playerid]
- /puckiq/wg/schedule/getRangeWowy/team/[team]/player/[playerid]
- /puckiq/wg/schedule/getRangeWowy/team/[team]/player1/[playerid]/player2/[playerid]
- /puckiq/wg/schedule/getRangeWowy/player/[playerid]
- /puckiq/wg/schedule/getRangeWowy/player1/[playerid]/player2/[playerid]

## WOWY Season Queries

### Methods

**getSeasonWowy:** Returns WOWY info by season

**HTTP GET Queries**

- /puckiq/ws/wowy/getSeasonWowy/season/[season]
- /puckiq/ws/wowy/getSeasonWowy/team/[team]
- /puckiq/ws/wowy/getSeasonWowy/team/[team]/season/[season]
- /puckiq/ws/wowy/getSeasonWowy/player/[playerid]
- /puckiq/ws/wowy/getSeasonWowy/player/[playerid]/season/[season]
- /puckiq/ws/wowy/getSeasonWowy/player1/[playerid]/player2/[playerid]
- /puckiq/ws/wowy/getSeasonWowy/player1/[playerid]/player2/[playerid]/season/[season]

## WoodWOWY Season Queries

### Methods

**getSeasonWoodWowy:** Returns WoodWOWY info by season

**HTTP GET Queries**

- /puckiq/ww/woodwowy/getSeasonWoodWowy/season/[season]
- /puckiq/ww/woodwowy/getSeasonWoodWowy/team/[team]
- /puckiq/ww/woodwowy/getSeasonWoodWowy/team/[team]/season/[season]
- /puckiq/ww/woodwowy/getSeasonWoodWowy/player/[playerid]
- /puckiq/ww/woodwowy/getSeasonWoodWowy/player/[playerid]/season/[season]
- /puckiq/ww/woodwowy/getSeasonWoodWowy/player1/[playerid]/player2/[playerid]
- /puckiq/ww/woodwowy/getSeasonWoodWowy/player1/[playerid]/player2/[playerid]/season/[season]

Testing Below This Line Only
