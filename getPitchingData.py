import csv, sys, json
from pprint import pprint

csvfile = 'BaseballData/Pitching.csv'
jsonfile = 'pitching.json'

def convert(): 
	csv_filename = csvfile
	print "Opening CSV file: ", csv_filename
	f = open(csv_filename, 'r')
	reader = csv.DictReader(f)
	json_filename = jsonfile
	print "Saving JSON to file: ", json_filename
	jsonf = open(json_filename, 'w')
	data = json.dumps([row for row in reader])
	jsonf.write(data)
	f.close()
	jsonf.close()

def main():
	convert()

	# load master data file 
	with open('master.json') as data_file:
		master_data = json.load(data_file)

	# collect all player names
	players = []
	for d in master_data:
		players.append({"playerID": d["playerID"], 
			"player": d["nameFirst"] + " " + d["nameLast"]})

	# load pitching data file
	with open('pitching.json') as data_file:
		pitching_data = json.load(data_file)

	# collect all relevant pitching information
	pitching = []
	for d in pitching_data: 
		pitching.append({"playerID": d["playerID"], 
			"yearID": d["yearID"],
			"ERA": d["ERA"],
			"SO": d["SO"],
			"IPouts": d["IPouts"]})

	# match player names with pitching statss
	pitching_stats = []
	for p in players:
		for s in pitching:
			if (p["playerID"] == s["playerID"]):
				pitching_stats.append({"player": p["player"],
					"yearID": s["yearID"],
					"ERA": s["ERA"],
					"SO": s["SO"],
					"IPouts": s["IPouts"]})


	final_pitching_stats = {}

	# clean up pitching data
	for stat in pitching_stats:
		if stat["player"] in final_pitching_stats: 
			final_pitching_stats[stat["player"]].append({"yearID": stat["yearID"], 
			"ERA": stat["ERA"],
			"SO": stat["SO"],
			"IPouts": stat["IPouts"]})
		else:
			final_pitching_stats[stat["player"]] = [{"yearID": stat["yearID"], 
			"ERA": stat["ERA"],
			"SO": stat["SO"],
			"IPouts": stat["IPouts"]}]

	json_filename = 'pitchingData.json'
	print "Saving JSON to file: ", json_filename
	jsonf = open(json_filename, 'w')
	data = json.dumps(final_pitching_stats)
	jsonf.write(data)
	jsonf.close()

	with open('pitchingData.json') as data_file:
		data = json.load(data_file)

	# continue cleaning up pitching data 
	# generate a list of player/pitching stat objects
	new_data = []
	for key in data:
		new_data.append({"player": key, "stats": []})
	for d in new_data:
		for year in data[d["player"]]:
			if (year["IPouts"]):
				ip = round(int(year["IPouts"])/3)
			else:
				ip = 0
			d["stats"].append({"year": year["yearID"], "data": {"ERA": year["ERA"], "SO": int(year["SO"]), "IP": ip}})

	# dump JSON to file
	json_filename = 'pitchingData2.json'
	print "Saving JSON to file: ", json_filename
	jsonf = open(json_filename, 'w')
	data = json.dumps(new_data)
	jsonf.write(data)
	jsonf.close()

if __name__ == "__main__":
	main()






