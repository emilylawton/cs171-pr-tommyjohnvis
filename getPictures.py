import urllib
import json
from pprint import pprint

with open("data/tjs.json") as data_file:
  data = json.load(data_file)


for x in data:
  # make sure player has valid mlbamid
  if (x["mlbamid"] != ""):
    url = "http://mlb.mlb.com/images/players/525x330/" + x["mlbamid"] + ".jpg"
    f = "images/players/" + x["mlbamid"] + ".jpg"
    a = urllib.urlopen(url)
    # make sure url exists
    if a.getcode() != 404:
      # save image to file
      urllib.urlretrieve(url, f)