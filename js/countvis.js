// constructor
CountVis = function(_parentElement, _data, _eventHandler) {
  this.parentElement = _parentElement;
  this.data = this.copyData(_data, false);
  this.eventHandler = _eventHandler;
  this.graph = {nodes: [], links: []};
  this.hoverable = true;
  this.clickedId = 0;
  this.playerCount;
  this.clickedElement;
  this.hoverPlayerName;
  this.bz = "brushing";
  this.zoomer;

  // finding occurences
  this.occurences = {};
  this.maxDate;
  this.maxOccurence = 0;

  // define svg constants
  this.margin = {top: 20, right: 20, bottom: 30, left: 25};
  this.width = 700 - this.margin.left - this.margin.right;
  this.height = 400 - this.margin.top - this.margin.bottom;

  this.force = d3.layout.force()
    .charge(-100)
    .size([this.width, this.height]);

  this.initVis();
}

CountVis.prototype.initVis = function() {
  this.graph.nodes = this.copyData(this.data);
  this.changeGrouping("year");

  var that = this;

  this.zoomer = d3.behavior.zoom().scaleExtent([1, 8]).on("zoom", this.zoom);

  // constructs SVG layout
  var svg = this.parentElement.append("svg")
      .attr("width", this.width + this.margin.left + this.margin.right)
      .attr("height", this.height + this.margin.top + this.margin.bottom)
    .append("g")
      .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")")
      .call(this.zoomer);
  
  this.zoom = function() {
    svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
  } 

  this.svg = svg;

  this.playerCount = this.svg
    .append("svg:text")
      .attr("dx", 4)
      .attr("dy", 10)
      .attr("font-size", 10)
      .attr("fill", "gray")
      .text("");

  this.hoverPlayerName = this.svg
    .append("svg:text")
      .attr("dx", 4)
      .attr("dy", 38)
      .attr("font-size", 35)
      .attr("fill", "gray")
      .text("");

  // create axis and scales
  this.x = d3.time.scale()
    .range([0, this.width]);

  this.y = d3.scale.linear()
    .range([this.height, 0]);

  this.xAxis = d3.svg.axis()
    .scale(this.x)
    .orient("bottom");

  this.yAxis = d3.svg.axis()
    .scale(this.y)
    .orient("left");

  // add axes visual elemnents
  this.svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + this.height + ")");

  this.svg.append("g")
      .attr("class", "y axis")
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")

  // create brush 
  this.brush = d3.svg.brush()
    .on("brush", function() {
        console.log("brusheddd");
        $(that.eventHandler).trigger("brushChanged", {"start": that.brush.extent()[0], "end": that.brush.extent()[1]});
    });

  this.updateVis();

}

CountVis.prototype.updateVis = function() {
  that = this;

  // set global occurence variables
  this.setOccurences(this.graph.nodes);

  // update scales
  this.x.domain(d3.extent(this.graph.nodes, function(d) { return d.surg_date; }));

  if (this.maxOccurence < 43) {
    // this elimates whitespace between the circles
    this.y.domain([.75, 43]);
  }
  else {
    this.y.domain([.75,this.maxOccurence]);
  }

  // update axis
  this.svg.select(".x.axis")
    .call(this.xAxis);

  this.svg.select(".y.axis")
    .call(this.yAxis);

  // update player count
  this.playerCount.text("Total Players: " + this.graph.nodes.length);

  // join
  this.node = this.svg.selectAll(".node")
    .data(this.graph.nodes)

  enter_nodes = this.node
    .enter()
    .append("g")
    .attr("class", "node");

  this.node
    .append("circle")
    .on("mouseover", function(d) {
      if (that.hoverable) {
        $(that.eventHandler).trigger("selectionChanged", {"id": d.mlbamid});
      } 
      that.hoverPlayerName.text(d.player);
    })
    .on("mouseout", function(d) {
      that.hoverPlayerName.text("");
    })
    .on("click", function(d) {
      $(that.eventHandler).trigger("selectionChanged", {"id": d.mlbamid});
      
      // if hoverable, make not hoverable and fill cirlce red
      if (that.hoverable) {
        that.clickedId = d.mlbamid;
        that.hoverable = false;
        that.clickedElement = d3.select(this);
        that.clickedElement.style("fill", "red");
      }
      
      // if already selected, deselect it
      else if (that.clickedId == d.mlbamid) {
        that.clickedId = d.mlbamid;
        that.hoverable = true;
        that.clickedElement = d3.select(this);
        that.clickedElement.style("fill", "steelblue");
      }
      
      // make previously clicked circle blue, and new one red
      else {
        that.clickedId = d.mlbamid;
        that.hoverable = false;
        that.clickedElement.style("fill", "steelblue");
        that.clickedElement = d3.select(this);
        that.clickedElement.style("fill", "red");
      }

    })
    .attr("r", 4);

  this.node.exit().remove();

  this.force
    .nodes(this.graph.nodes)
    .start();

  this.graph.nodes.forEach(function(d, i) {
      d.x = that.x(d.surg_date);   
      d.y = that.y(that.occurences[d.surg_date]);
      that.occurences[d.surg_date]--;
    });

  if (this.bz == "brushing") {
    // deactivate zoomer
    this.zoomer.on('zoom', null);

    // create brush 
    this.brush = d3.svg.brush()
      .on("brush", function() {
          console.log("brusheddd");
          $(that.eventHandler).trigger("brushChanged", {"start": that.brush.extent()[0], "end": that.brush.extent()[1]});
      });

    // add brush
    this.svg.append("g")
      .attr("class", "brush");

    this.brush.x(this.x);
    this.svg.select(".brush")
      .call(this.brush)
      .selectAll("rect")
      .attr("height", this.height);
  }
  else {
    // activate zoomer
    this.zoomer.on('zoom', this.zoom);

    // deactivate brush
    this.brush
      .on('brush', null)
      .on('brushstart', null)
      .on('brushend', null);

    // remove brush element
    d3.select('.brush').remove();
  }

  this.graphUpdate(200);

}

CountVis.prototype.graphUpdate = function(duration) {
  this.node.transition().duration(duration)
    .attr("transform", function(d) { 
      return "translate("+d.x+","+d.y+")"; 
    });
}

// when the user changes one of the display options,
// this function is called with the appopriate new settings
CountVis.prototype.userChange = function(settings) {
  this.graph.nodes = this.copyData(this.data);
 
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

  // update display
  this.updateVis();
}

// find the min and max of data
CountVis.prototype.findMinMax = function() {
  if (this.data.length == 0)
    return [0,0];
  
  var min = 100;
  var max = 0;

  this.data.forEach(function(d) {
    if (d.age > max)
      max = d.age;
    if (d.age < min)
      min = d.age;
  });

  return [min,max];
}


/*****************************************************
 Helper Functions
*****************************************************/

// copys the array of objects, by creating new objects
// this is necessary so that the original data object does not get changed
CountVis.prototype.copyData = function(data) {
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

// this function creates a map of Date Object -> # of occurences
CountVis.prototype.setOccurences = function(data) {
  this.maxDate = null;
  this.maxOccurence = 0;
  this.occurences = {};
  
  if (data.length != 0) {
    // go through all surgery dates
    for (var i = 0; i < data.length; i++) {
      var date = data[i].surg_date;
      // add to map or increase count by 1
      if (this.occurences[date] == null)
       this.occurences[date] = 1;
      else
        this.occurences[date]++;
      
      // if new max and modify accordingly
      if (this.occurences[date] > this.maxOccurence) {
        this.maxDate = date;
        this.maxOccurence = this.occurences[date];
      }
    }
  }
}

// filter this.graph.nodes by given age range
CountVis.prototype.filterAge = function(min, max) {
  this.graph.nodes = this.graph.nodes.filter(function(d) {
    return d.age >= min && d.age <= max;
  }); 
}

// filter this.graph.nodes by given team
CountVis.prototype.filterTeam = function(team) {
  if (team != "ALL") {
    this.graph.nodes = this.graph.nodes.filter(function(d) {
      return team == d.team;
    });
  }
}

// filter this.graph.nodes by given position
CountVis.prototype.filterPosition = function(position) {
  if (position == "PITCHERS") {
    this.graph.nodes = this.graph.nodes.filter(function(d) {
      return d.position == "P";
    });
  }
  else if (position == "POSITION") {
    this.graph.nodes = this.graph.nodes.filter(function(d) {
      return d.position != "P";
    });
  }
}
// data is already grouped by year, only change if year
CountVis.prototype.changeGrouping = function(grouping) {
  if (grouping == "year") {
    var dateFormatter2 = d3.time.format("%Y");
    this.graph.nodes.map(function (d) {
      d.surg_date = dateFormatter2.parse(dateFormatter2(d.surg_date));
      return d;
    });
  }
}
