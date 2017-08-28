# PuckIQ API

## Generic Queries
### Methods
qSeasonList, qSeasonCount

### URI Queries
- /puckiq/woodmoney-gen/[method]
- /puckiq/wowy-gen/[method]
- /puckiq/woodwowy-gen/[method]
- /puckiq/players-gen/[method]

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
- /puckiq/players/:qmethod
- /puckiq/players/:qmethod/season/:season
- /puckiq/players/:qmethod/team/:Team
- /puckiq/players/:qmethod/team/:Team/season/:season
- /puckiq/players/:qmethod/player/:PlayerId
- /puckiq/players/:qmethod/player/:PlayerId/season/:season