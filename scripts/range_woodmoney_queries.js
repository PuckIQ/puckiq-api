db.schedule.find({"data.date": {$gte: "2018-02-01"}}).limit(1).sort({"data.gamekey": 1}).pretty()
db.schedule.find({"data.date": {$lte: "2018-04-01"}}).limit(1).sort({"data.gamekey": -1}).pretty()


db.gamewoodmoney.aggregate([
    {$match: {playerid: 8478402, $and: [{gamekey: {$gte: 2017020776}}, {gamekey: {$lte: 2017021222}}]}},
    {$group: {"_id": "$woodmoneytier", "count": {$sum: 1}}}
])


db.gamewoodmoney.aggregate([
    {
        $match: {
            playerid: 8478402,
            gamekey: {$gte: 2017020776, $lte: 2017021222}
        }
    },
    {
        $group: {
            _id: {
                player_id: '$playerid',
                season: '$season',
                team: '$team',
                gametype: '$gametype',
                onoff: '$onoff',
                wowytype: '$wowytype',
                woodmoneytier: '$woodmoneytier'
            },

            sacf: {$sum: '$sacf'},
            saca: {$sum: '$saca'},
            ca: {$sum: '$ca'},
            cf: {$sum: '$cf'},
            gf: {$sum: '$gf'},
            ga: {$sum: '$ga'},
            evtoi: {$sum: '$evtoi'},
            nz: {$sum: '$nz'},
            dff: {$sum: '$dff'},
            dfa: {$sum: '$dfa'},
            fa: {$sum: '$fa'},
            dz: {$sum: '$dz'},
            ff: {$sum: '$ff'},
            oz: {$sum: '$oz'},
            sa: {$sum: '$sa'},
            sf: {$sum: '$sf'}

        }
    },
    {
        $group: {
            _id: {
                player_id: '$_id.player_id',
                season: '$_id.season',
                team: '$_id.team'
            },
            woodmoney: {
                $push: {

                    gametype: '$_id.gametype',
                    onoff: '$_id.onoff',
                    wowytype: '$_id.wowytype',
                    woodmoneytier: '$_id.woodmoneytier',

                    sacf: '$sacf',
                    saca: '$saca',
                    ca: '$ca',
                    cf: '$cf',
                    gf: '$gf',
                    ga: '$ga',
                    evtoi: '$evtoi',
                    nz: '$nz',
                    dff: '$dff',
                    dfa: '$dfa',
                    fa: '$fa',
                    dz: '$dz',
                    ff: '$ff',
                    oz: '$oz',
                    sa: '$sa',
                    sf: '$sf'
                }
            }
        }
    }

]).pretty()


db.gamewoodmoney.aggregate([{
    '$match': {
        gametype: 2,
        wowytype: 'WoodMoney',
        team: 'DET',
        gamekey: {'$gte': 2017020181, '$lte': 2018020406}
    }
}, {
    '$group': {
        _id: {
            player_id: '$playerid',
            team: '$team',
            gametype: '$gametype',
            onoff: '$onoff',
            wowytype: '$wowytype',
            woodmoneytier: '$woodmoneytier'
        },
        games_played: {'$sum': 1},
        sacf: {'$sum': '$sacf'},
        saca: {'$sum': '$saca'},
        ca: {'$sum': '$ca'},
        cf: {'$sum': '$cf'},
        gf: {'$sum': '$gf'},
        ga: {'$sum': '$ga'},
        evtoi: {'$sum': '$evtoi'},
        nz: {'$sum': '$nz'},
        dff: {'$sum': '$dff'},
        dfa: {'$sum': '$dfa'},
        fa: {'$sum': '$fa'},
        dz: {'$sum': '$dz'},
        ff: {'$sum': '$ff'},
        oz: {'$sum': '$oz'},
        sa: {'$sum': '$sa'},
        sf: {'$sum': '$sf'}
    }
}, {
    '$group': {
        _id: {player_id: '$_id.player_id', team: '$_id.team'},
        woodmoney: {
            '$push': {
                gametype: '$_id.gametype',
                onoff: '$_id.onoff',
                wowytype: '$_id.wowytype',
                woodmoneytier: '$_id.woodmoneytier',
                games_played: '$games_played',
                sacf: '$sacf',
                saca: '$saca',
                ca: '$ca',
                cf: '$cf',
                gf: '$gf',
                ga: '$ga',
                evtoi: '$evtoi',
                nz: '$nz',
                dff: '$dff',
                dfa: '$dfa',
                fa: '$fa',
                dz: '$dz',
                ff: '$ff',
                oz: '$oz',
                sa: '$sa',
                sf: '$sf'
            }
        }
    }
}], {})