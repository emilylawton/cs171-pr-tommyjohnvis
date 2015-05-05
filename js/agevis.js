AgeVis = function(_parentElement, _data) {
  this.parentElement = _parentElement; 
  this.originalData = _data;
  this.data = _data; 
  this.displayData = []

  // compute max and min age
  this.maxAge = d3.max(this.data, function(d) { return d.age; });
  this.minAge = d3.min(this.data, function(d) { return d.age; });

  // number bins
  this.numberBins = this.maxAge - this.minAge + 1; 

  // define svg constants 
  this.margin = {top: 20, right: 0, bottom: 30, left: 30};
  this.width = 300 - this.margin.left - this.margin.right; 
  this.height = 300 - this.margin.top - this.margin.bottom; 

  this.initVis(); 
}

AgeVis.prototype.initVis = function() {
  var that = this; 

  // constructs svg layout 
  this.svg = this.parentElement
    .append("svg")
      .attr("width", this.width + this.margin.left + this.margin.right)
      .attr("height", this.height + this.margin.top + this.margin.bottom)
    .append("g")
      .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

  this.svg.append("text")
    .attr("x", this.width / 2)
    .attr("y", -5)
    .attr("class", "title")
    .style("text-anchor", "middle")
    .text("Age at Surgery");

  // create axis and scales 
  this.x = d3.scale.linear()
    .range([0, this.width]);

  this.y = d3.scale.linear()
    .range([this.height, 0]);

  this.xAxis = d3.svg.axis()
    .scale(this.x)
    .orient("bottom");

  this.yAxis = d3.svg.axis()
    .scale(this.y)
    .orient("left");

  // add axes visual elements
  this.svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0" + this.height + ")")
    .append("text")
      .attr("x", this.width / 2 )
      .attr("y", 27)
      .style("text-anchor", "middle")
      .text("Years");

  this.svg.append("g")
    .attr("class", "y axis")

  // filter, aggregate, modify data 
  this.wrangleData(null);

  this.updateVis();
}

AgeVis.prototype.updateVis = function() {

  var that = this; 
  var max = d3.max(this.displayData);
  this.x.domain([0,this.maxAge]);
  this.y.domain([0, max]); 

  console.log(this.displayData);
  // update axis
  this.svg.select(".x.axis")
    .call(this.xAxis)
    .attr("transform", "translate(0," + this.height + ")")

  this.svg.select(".y.axis")
    .call(this.yAxis)

  // join
  var bars = this.svg.selectAll("g.bar")
    .data(this.displayData);

  // update 
  bars.select("rect")
    .transition()
    .duration(500)
    .attr("width", that.width/that.displayData.length - 3)
    .attr("height", function(d) { return that.height - that.y(d); })
    .attr("x", function(d, i) { return (i * (that.width / that.displayData.length)); })
    .attr("y", function(d) { return that.y(d); })

  // enter
  var enter_rects = bars.enter()
    .append("g")
    .attr("class", "bar")
    .append("rect")
    .attr("width", that.width/that.displayData.length - 3) 
    .attr("height", function(d) { return that.height - that.y(d); })
    .attr("x", function(d, i) { return (i * (that.width / that.displayData.length)); })
    .attr("y", function(d) { return that.y(d); })

  // exit
  bars
    .exit()
    .remove()

}

AgeVis.prototype.wrangleData = function(_filterFunction) {
  this.displayData = this.filterAndAggregate(_filterFunction);
}

/**
  Gets called by event handler
*/
AgeVis.prototype.onBrushChange = function(selectionStart, selectionEnd) {
  this.wrangleData(function(d) { return d.surg_date >= selectionStart && d.surg_date <= selectionEnd; });
  this.updateVis(); 
}

// when the user changes one of the display options,
// this function is called with the appopriate new settings
AgeVis.prototype.userChange = function(settings) {
  this.data = this.copyData(this.originalData);
 
  // change grouping if necessary
  this.changeGrouping(settings["grouping"]);

  // filter by the selected ages
  this.filterAge(settings["ages"][0], settings["ages"][1]);

  // filter by team
  this.filterTeam(settings["team"]);

  //filter by position
  this.filterPosition(settings["position"]);

  // set brushing or zooming
  this.bz = settings["bz"];

  this.displayData = this.filterAndAggregate(null);

  console.log("here");
  // update display
  this.updateVis();
}

/*
*
* ==================================
* From here on only HELPER functions
* ==================================
*
* */
AgeVis.prototype.filterAndAggregate = function(_filter) {
  // Set filter to a function that accepts all items
  // ONLY if the parameter _filter is NOT null use this parameter
  var filter = function(){return true;}
  if (_filter != null){
    filter = _filter;
  }

  var that = this; 

  // accumulate all values that fulfill the filter ceriterion 
  var filtered_data = that.data.filter(filter); 

  // create an array of values for age
  var res = d3.range(this.maxAge).map(function () {
    return 0;
  });

  for (surgery of filtered_data) {
    res[surgery.age]+=1; 
  }

  return res; 
}

// copys the array of objects, by creating new objects
// this is necessary so that the original data object does not get changed
AgeVis.prototype.copyData = function(data) {
  var copiedData = data.map(function(d) { 
    var newObject = {
      majors: d.majors,
      post_games: d.post_games,
      surg_date: d.surg_date,
      post_ippa: d.post_ippa,
      mlbamid: d.mlbamid,
      country: d.country,
      age: d.age,
      surgeons: d.surgeons,
      player: d.player,
      high_school: d.high_school,
      college: d.college,
      team: d.team,
      active: d.active,
      position: d.position,
      recovery: d.recovery,
      return_date: d.return_date
    }
    return newObject;
  });

  return copiedData;
}

// filter this.data by given age range
AgeVis.prototype.filterAge = function(min, max) {
  this.data = this.data.filter(function(d) {
    return d.age >= min && d.age <= max;
  }); 
}

// filter this.data by given team
AgeVis.prototype.filterTeam = function(team) {
  if (team != "ALL") {
    this.data = this.data.filter(function(d) {
      return team == d.team;
    });
  }
}

// filter this.data by given position
AgeVis.prototype.filterPosition = function(position) {
  if (position == "PITCHERS") {
    this.data = this.data.filter(function(d) {
      return d.position == "P";
    });
  }
  else if (position == "POSITION") {
    this.data = this.data.filter(function(d) {
      return d.position != "P";
    });
  }
}

// data is already grouped by year, only change if year
AgeVis.prototype.changeGrouping = function(grouping) {
  if (grouping == "year") {
    var dateFormatter2 = d3.time.format("%Y");
    this.data.map(function (d) {
      d.surg_date = dateFormatter2.parse(dateFormatter2(d.surg_date));
      return d;
    });
  }
}
