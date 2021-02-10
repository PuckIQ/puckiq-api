#!/usr/bin/env python3

import os
import pymongo
import sys
import argparse
from datetime import date

'''
Usage:
python3 populate.py -s 20192020 -c teamshifts
python3 populate.py -s 20192020
'''

# get args from command line
parser = argparse.ArgumentParser()
parser.add_argument('--season', '-s', dest='season', action='store', type=int, default=20212021,
                    help='The season to populate from G\'s db', required=False)
parser.add_argument('-season_only', '-so', dest='season_only', action='store_true',
                    help='If you want to sync just the season collections', default=False)
parser.add_argument('-verbose', '-v', dest='verbose', action='store_true', help='Verbose mode', default=False)
parser.add_argument('-wipe', '-w', dest='wipe', action='store_true',
                    help='Use this to clear existing data for a season and rebuild from G\'s db', default=False)
parser.add_argument('-collection', '-c', dest='collection', action='store', help='Collection to sync')
args = parser.parse_args()

from pymongo import MongoClient
from bson.objectid import ObjectId

import config
_config = config.getFor(os.getenv('PY_ENV') or 'production')

wm_client = MongoClient(_config['dbs']['wm'][0])
pq_client = MongoClient(_config['dbs']['puckiq'][0])

#constants and client config
last_run_date=date.today()
CURRENT_SEASON=args.season

collection_mapper = {}
collection_mapper["nhlroster"] = "seasonroster"
collection_mapper["roster"] = "gameroster"
#collection_mapper["teamshifts"] = "seasonteamshifts"
collection_mapper["shifts"] = "seasonshifts"

if 'collection' in args and args.collection is not None:
  collections_to_sync = [args.collection]
elif args.season_only:
  collections_to_sync = ['seasonboxcars','seasonwoodmoney','seasonwoodwowy','seasonwowy','shifts']
else:
  collections_to_sync = ['playerhistory','gameboxcars','gamewoodmoney','gamewoodwowy','gamewowy','seasonboxcars','seasonwoodmoney','seasonwoodwowy','seasonwowy','nhlroster','roster','shifts']


print("collections_to_sync: " + ', '.join(collections_to_sync))
print("season: " + str(CURRENT_SEASON))
print("verbose: " + str(args.verbose))


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

#wipe existing data if necessary
if args.wipe:
  for collection_name in collections_to_sync:
    if collection_name in collection_mapper:
      if args.verbose: print('deleting records from collection ' + collection_mapper[collection_name])
      pqcollection = pqdb.get_collection(collection_mapper[collection_name])
      pqcollection.remove({'season': CURRENT_SEASON})
    elif collection_name.find('season') >= 0:
      if args.verbose: print('deleting records from collection ' + collection_name)
      pqcollection = pqdb.get_collection(collection_name)
      pqcollection.remove({'season': CURRENT_SEASON})


for collection_name in collections_to_sync:

  print("\n--------------------------" + collection_name + "--------------------------")
  wm_collection = wmdb.get_collection(collection_name)

  if collection_name in collection_mapper:
    pqcollection = pqdb.get_collection(collection_mapper[collection_name])
  else:
    pqcollection = pqdb.get_collection(collection_name)

  #only get the data that has been updated since last_run_timestamp
  #(unless wiping or shifts collection which is small)
  wm_query = {"season": CURRENT_SEASON }
  if not args.wipe and collection_name.find("shifts") < 0: wm_query["last_run_timestamp"] = { "$gt" : last_run_date }

  collection_count=0
  for row in wm_collection.find({"season": CURRENT_SEASON}):

    if args.verbose and collection_count > 0 and collection_count % 1000 == 0:
      print('processing row ' + str(collection_count))
    collection_count=collection_count+1

    #basically seasonboxcars doesnt have these fields but check for all just in case
    if (collection_name.startswith("season") or collection_name.find("shifts") >= 0) and "playerid" in row and "team" in row:
      season_player_key = str(row["playerid"]) + "-" + row["team"]
      if season_player_key in player_dict:
        row["gamesplayed"] = player_dict[season_player_key]
      else:
        row["gamesplayed"] = 0

    if pqcollection.count(row) < 1:
      pqpostid = pqcollection.insert_one(row).inserted_id
      if args.verbose: print("+", end='', flush=True)
    else:

      #not entirely sure this is needed
      pq_update = {}
      for key in row:
        pq_update[key] = row[key]

      if args.verbose: print("updating _id " + row["_id"])
      pqcollection.update_one({"_id" : row["_id"]}, {"$set" : pq_update})

      if args.verbose: print(".", end='', flush=True)

#refresh caches (rather than wait 15 min for new players to show up
import requests
requests.get("http://api.puckiq.com/refresh")
requests.get("http://api.puckiq.org/refresh")
