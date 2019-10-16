#!/usr/bin/env python3

import os
import pymongo
import sys

from pymongo import MongoClient
from bson.objectid import ObjectId

import config
_config = config.getFor(os.getenv('PY_ENV') or 'production')

CURRENT_SEASON= 20182019

wm_client = MongoClient(_config['dbs']['wm'][0])
pq_client = MongoClient(_config['dbs']['puckiq'][0])

#TODO wowy collections dont have playerid and team
collections_to_sync = ['seasonboxcars','seasonwoodmoney']
wmdb = wm_client.nhl
pqdb = pq_client.puckiq
itcount = 0

#build up a dictionary of player/team to games played from the playerhistory
#use the wm collection since the puckiq one hasnt been synced yet
playerhistory = wmdb.get_collection('playerhistory')
player_dict = dict()
for player in playerhistory.find({"season": CURRENT_SEASON, "gametype":2 }):
  season_player_key = str(player["playerid"]) + "-" + player["team"]
  player_dict[season_player_key] = player["GP"]

for collection_name in collections_to_sync:
  
  print("\n--------------------------" + collection_name + "--------------------------")
  wm_collection = wmdb.get_collection(collection_name)
  pqcollection = pqdb.get_collection(collection_name)
    
  for row in wm_collection.find({"season": CURRENT_SEASON}):

    if collection_name.startswith("season") and "playerid" in row and "team" in row:
      season_player_key = str(row["playerid"]) + "-" + row["team"]
      if season_player_key in player_dict:
        row["gamesplayed"] = player_dict[season_player_key]
      else:
        row["gamesplayed"] = 0
    else:
        print(collection_name + " doesnt have playerid and team\n")

    if "gamesplayed" in row:
      print("_id " + str(row["_id"]) + " gamesplayed " + str(row["gamesplayed"]) + "\n")
      pqcollection.update_one({"_id" : row["_id"]}, {"$set": {"gamesplayed" : row["gamesplayed"]}})
      print(".", end='', flush=True)

#refresh caches (rather than wait 15 min for new players to show up
import requests
requests.get("http://api.puckiq.com/refresh")
requests.get("http://api.puckiq.org/refresh")