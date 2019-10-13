#!/usr/bin/env python3

import os
import pymongo
import sys

from pymongo import MongoClient
from bson.objectid import ObjectId

import config
_config = config.getFor(os.getenv('PY_ENV') or 'production')

from_client = MongoClient(_config['dbs']['puckiq'][0])
#from_client = MongoClient('localhost',
#  username='xxxxxxx',
#  password='xxxxxxx',
#  authSource='nhl'
#)

CURRENT_SEASON= 20192020
collections_to_sync = ['seasonboxcars','seasonwoodmoney','seasonwoodwowy','seasonwowy','seasonroster']

from_db = from_client.puckiq
itcount = 0

playerhistory = from_db.get_collection('playerhistory')
player_dict = dict()
for player in playerhistory.find({"season": CURRENT_SEASON}):
    season_player_key = str(player['playerid']) + "-" + player["team"]
    player_dict[season_player_key] = player["GP"]

for key in player_dict:
    print(key + "    " + str(player_dict[key]))

sys.exit(0)



