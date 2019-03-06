
db.seasonroster.aggregate([
    //{$match : { "playerid": {$in : [8477934, 8478402]}}},
    {$sort : {season: 1}},
    {$group : {
            _id:{"playerid": "$playerid", "season" : "$season", "team" : "$team" },
            names: {$addToSet:"$name"},
            positions : {$addToSet : "$pos"}
        }},
    {$project:{
            "_id": {$concat : [{$toString : "$_id.playerid"}, "$_id.team", {$toString : "$_id.season"}]},
            "teamseasonid": {$concat : ["$_id.team", {$toString : "$_id.season"}]},
            "season": "$_id.season",
            "teamabr":"$_id.team",
            "teampxp":"$_id.team",
            "positions":"$positions",
            "playerid":"$_id.playerid",
            "fullName": {$arrayElemAt : ["$names", 0]} }},
    {$out : 'playerseasons'}
],    { allowDiskUse: true });

db.seasonroster.aggregate([
    //{$match : { "playerid": {$in : [8477934, 8478402]}}},
    {$sort : {season: 1}},
    {$group : {
            _id:{
                "playerid": "$playerid"
            },
            birthcountries: {$addToSet:"$birthcountry"},
            teams: {$push:"$teams"}, //push maintains order
            hands: {$addToSet:"$hand"},
            weights: {$addToSet:"$weight"},
            heights: {$addToSet:"$height"},
            seasons: {$addToSet:"$season"},
            names: {$addToSet:"$name"},
            positions : {$addToSet : "$pos"}
        }},
    {$project:{
            "_id": {$concat : [{$toString : "$_id.playerid"}]},
            "playerid":"$_id.playerid",
            "seasons": "$seasons",
            "positions": "$positions",
            "birthcountry": {$arrayElemAt : ["$_id.birthcountry", -1]},
            "hand": {$arrayElemAt : ["$hands", -1]},
            "team": {$arrayElemAt : ["$teams", -1]},
            "weight": {$arrayElemAt : ["$weights", -1]},
            "height": {$arrayElemAt : ["$heights", -1]},
            "fullName": {$arrayElemAt : ["$names", -1]}
    }},
    {$out : 'players'}
],    { allowDiskUse: true });