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

**<u>getSeasonList</u>**
Returns a list of all of the seasons available within each collection

**HTTP GET Queries**
- /puckiq/g/schedule/getSeasonList
- /puckiq/g/teams/getSeasonList
- /puckiq/g/players/getSeasonList
- /puckiq/g/roster/getSeasonList
- /puckiq/g/woodmoney/getSeasonList
- /puckiq/g/gamewowy/getSeasonList
- /puckiq/g/seasonwowy/getSeasonList
- /puckiq/g/woodwowy/getSeasonList

**<u>getSeasonCount</u>**
Returns a list of all of the seasons available within each collection along with the count of each document

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

**<u>getSchedule</u>**
Returns the full season schedule for all teams

**HTTP GET Queries**
- /puckiq/s/schedule/getSchedule/season/[season]
- /puckiq/s/schedule/getSchedule/gamedate/[gamedate]

**<u>getTeamSchedule</u>**
Returns the full season schedule for a single teams

**HTTP GET Queries**
- /puckiq/s/schedule/getTeamSchedule/team/[team]/season/[season]