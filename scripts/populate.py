#!/usr/bin/env python3
import pymongo
from pymongo import MongoClient
from bson.objectid import ObjectId

#setup dbs
wm_client = MongoClient('localhost',
  username='xxxxxxx',
  password='xxxxxxx',
  authSource='nhl'
)
pq_client = MongoClient('localhost',
  29852,
  username='xxxxxx',
  password='xxxxxx',
  authSource='puckiq'
)

CURRENT_SEASON= 20192020
availcol = ['playerhistory','gameboxcars','gamewoodmoney','gamewoodwowy','gamewowy','seasonboxcars','seasonwoodmoney','seasonwoodwowy','seasonwowy','seasonroster']
wmdb = wm_client.nhl
pqdb = pq_client.puckiq
itcount = 0

#build up a dictionary of player/team to games played from the history table
#todo we may need to do an aggregate here to count the games per player
playerhistory = wmdb.get_collection('playerhistory')
player_dict = dict()
for player in playerhistory.find({"season": CURRENT_SEASON}):
  season_player_key = str(player["playerid"]) + "-" + player["team"]
  player_dict[season_player_key] = player["GP"]

for collection_name in availcol:
  
  print("\n--------------------------" + collection_name + "--------------------------")
  rowlection = wmdb.get_collection(collection_name)
  if collection_name == 'nhlroster':
    pqcollection = pqdb.get_collection('seasonroster')
  elif collection_name == 'roster':
    pqcollection = pqdb.get_collection('gameroster')
  else:
    pqcollection = pqdb.get_collection(collection_name)
    
  if collection_name.find('season') != -1:
    pqcollection.remove({season: CURRENT_SEASON})
    
  for row in rowlection.find({"season": CURRENT_SEASON}):
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