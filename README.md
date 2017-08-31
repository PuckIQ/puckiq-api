# PuckIQ API

## Available Query Types

The following query types are exposed for use with the PuckIQ API and are used /puckiq/[x]/[qtype]. *x* is reserverd for particular query types to avoid conflicts due to collection field names.

- schedule
- teams
- players
- roster
- woodmoney
- wowy
- woodwowy

## Generic Queries
### Methods
qSeasonList, qSeasonCount

### URI Queries
- /puckiq/g/schedule/[method]
- /puckiq/g/teams/[method]
- /puckiq/g/schedule/[method]
- /puckiq/g/schedule/[method]
- /puckiq/g/schedule/[method]
- /puckiq/g/schedule/[method]
- 
- /puckiq/g/wowy-gen/[method]
- /puckiq/g/woodwowy-gen/[method]
- /puckiq/g/players-gen/[method]

## WOWY Queries
### Methods
qWowy *options (object)*

### URI Queries
- /puckiq/wowy/[method]/team/[team]/season/[season]
- /puckiq/wowy/[method]/player/[playerid]
- /puckiq/wowy/[method]/player/[playerid]/season/[season]
- /puckiq/wowy/[method]/player1/[playerid]/player2/[playerid]
- /puckiq/wowy/[method]/player1/[playerid]/player2/[playerid]/season/[season]

## WoodWOWY Queries
### Methods
qWoodWowy *options (object)*

### URI Queries
- /puckiq/woodwowy/[method]/team/[team]/season/[season]
- /puckiq/woodwowy/[method]/player/[playerid]
- /puckiq/woodwowy/[method]/player/[playerid]/season/[season]
- /puckiq/woodwowy/[method]/player1/[playerid]/player2/[playerid]
- /puckiq/woodwowy/[method]/player1/[playerid]/player2/[playerid]/season/[season]

## WoodMoney Queries
### Methods
qWoodMoney *options (object)*

### URI Queries
- /puckiq/woodmoney/[method]/season/[season]
- /puckiq/woodmoney/[method]/team/[team]/season/[season]
- /puckiq/woodmoney/[method]/player/[playerid]
- /puckiq/woodmoney/[method]/player/[playerid]/team/[team]
- /puckiq/woodmoney/[method]/player/[playerid]/team/[team]/season/[season]
- /puckiq/woodmoney/[method]/player/[playerid]/season/[season]

## Players Queries
### Methods
getPlayerList *options (object)*

### URI Queries
- /puckiq/players/[method]
- /puckiq/players/[method]/season/[season]
- /puckiq/players/[method]/team/[team]
- /puckiq/players/[method]/team/[team]/season/[season]
- /puckiq/players/[method]/player/[playerid]
- /puckiq/players/[method]/player/[playerid]/season/[season]