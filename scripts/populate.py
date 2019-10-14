#!/usr/bin/env python3

import os
import pymongo
import sys

from pymongo import MongoClient
from bson.objectid import ObjectId

import config
_config = config.getFor(os.getenv('PY_ENV') or 'production')

wm_client = MongoClient(_config['dbs']['wm'][0])
pq_client = MongoClient(_config['dbs']['puckiq'][0])

CURRENT_SEASON= 20192020
collections_to_sync = ['playerhistory','gameboxcars','gamewoodmoney','gamewoodwowy','gamewowy','seasonboxcars','seasonwoodmoney','seasonwoodwowy','seasonwowy','seasonroster']
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
  if collection_name == 'nhlroster':
    pqcollection = pqdb.get_collection('seasonroster')
  elif collection_name == 'roster':
    pqcollection = pqdb.get_collection('gameroster')
  else:
    pqcollection = pqdb.get_collection(collection_name)
    
  if collection_name.find('season') != -1:
    pqcollection.remove({season: CURRENT_SEASON})

  if colName == 'playerhistory':
    pqcollection.remove({"season": CURRENT_SEASON})
    
  for row in wm_collection.find({"season": CURRENT_SEASON}):
    if collection_name.startsWith("season"):
      season_player_key = str(row["playerid"]) + "-" + row["team"]
      if row[season_player_key] in player_dict:
        row["gamesplayed"] = player_dict[season_player_key]
      else
        row["gamesplayed"] = 0

    if pqcollection.count(row) < 1:
      pqpostid = pqcollection.insert_one(row).inserted_id
      print("+", end='', flush=True)
    else
      pqcollection.update_one({_id : row["_id"]}, {"gamesplayed" : row["gamesplayed"]})
      print(".", end='', flush=True)

#refresh caches (rather than wait 15 min for new players to show up
import requests
requests.get("http://api.puckiq.com/refresh")
requests.get("http://api.puckiq.org/refresh")