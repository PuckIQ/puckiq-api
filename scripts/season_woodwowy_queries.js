//mcdavid and drai 2017-2018
db.seasonwoodwowy.aggregate([
    { $match: {player1id : 8478402, player2id: 8477934, season: 20172018} },
    {
        $group: {
            _id: {
                player_1_id: '$player1id',
                player_2_id: '$player2id',
                season: '$season',
                team: '$team'
            },
            woodwowy: {
                $push: {
                    player_1_id: '$_id.player_1_id',
                    player_2_id: '$_id.player_2_id',
                    team: '$_id.team',
                    games_played: '$games_played',
                    onoff: '$onoff',
                    wowytype : '$wowytype',
                    woodmoneytier : '$woodmoneytier',
                    recordtype : '$recordtype',
                    sacf: '$sacf',
                    saca: '$saca',
                    sfpct: '$sfpct',
                    ca: '$ca',
                    cf: '$cf',
                    gf: '$gf',
                    saca60: '$saca60',
                    ga: '$ga',
                    sacfpct: '$sacfpct',
                    gf60: '$gf60',
                    evtoi: '$evtoi',
                    ga60: '$ga60',
                    cfpct: '$cfpct',
                    sa60: '$sa60',
                    nz: '$nz',
                    dff: '$dff',
                    dfa: '$dfa',
                    ca60: '$ca60',
                    fa: '$fa',
                    dz: '$dz',
                    sf60: '$sf60',
                    ff: '$ff',
                    fa60: '$fa60',
                    sacf60: '$sacf60',
                    ffpct: '$ffpct',
                    cf60: '$cf60',
                    ff60: '$ff60',
                    dff60: '$dff60',
                    dffpct: '$dffpct',
                    oz: '$oz',
                    dfa60: '$dfa60',
                    sa: '$sa',
                    sf: '$sf',
                    gfpct: '$gfpct',
                }
            }
        }
    }
]).pretty()