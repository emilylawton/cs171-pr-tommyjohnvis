
// constructor
CountVis = function(_parentElement, _data, _eventHandler) {
  this.parentElement = _parentElement;
  this.data = this.copyData(_data, false);
  this.eventHandler = _eventHandler;
  this.graph = {nodes: [], links: []};

  // finding occurences
  this.occurences = {};
  this.maxDate;
  this.maxOccurence = 0;

  // define svg constants
  this.margin = {top: 20, right: 20, bottom: 30, left: 80};
  this.width = 700 - this.margin.left - this.margin.right;
  this.height = 400 - this.margin.top - this.margin.bottom;

  this.force = d3.layout.force()
    .charge(-100)
    .size([this.width, this.height]);

  this.initVis();
}

CountVis.prototype.initVis = function() {
  this.graph.nodes = this.copyData(this.data, true);

  var that = this;

  // constructs SVG layout
  this.svg = this.parentElement.append("svg")
      .attr("width", this.width + this.margin.left + this.margin.right)
      .attr("height", this.height + this.margin.top + this.margin.bottom)
    .append("g")
      .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

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

  // join
  this.node = this.svg.selectAll(".node")
    .data(this.graph.nodes)

  enter_nodes = this.node
    .enter()
    .append("g")
    .attr("class", "node");

  enter_nodes
    .append("circle")
    .on("mouseover", function(d) {
      $(that.eventHandler).trigger("selectionChanged", {"id": d.mlbamid}); 
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

  this.graphUpdate(200);

}

CountVis.prototype.graphUpdate = function(duration) {
  this.node.transition().duration(duration)
    .attr("transform", function(d) { 
      return "translate("+d.x+","+d.y+")"; 
    });
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

// this changes how the data is grouped, by month or year
CountVis.prototype.changeGrouping = function(setting) {
  if (setting == "month") {
    this.graph.nodes = this.copyData(this.data, false);
  }
  else {
    this.graph.nodes = this.copyData(this.data, true);
  }
  this.updateVis();
}

// copys the array of objects, by creating new objects
// this is necessary so that the original data object does not get modified
CountVis.prototype.copyData = function(data, modify) {
  var dateFormatter2 = d3.time.format("%Y");
  var newData = data.map(function(d) { 
    var surgeDate;
    surgeDate = modify ? dateFormatter2.parse(dateFormatter2(d.surg_date)) : d.surg_date; 
    
    var newObject = {
      majors: d.majors,
      post_games: d.post_games,
      surg_date: surgeDate,
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

  return newData;
}

CountVis.prototype.filterAge = function(min, max) {
  this.graph.nodes = this.copyData(this.data, false);
  this.graph.nodes = this.graph.nodes.filter(function(d) {
    return d.age >= min && d.age <= max;
  }); 

  this.updateVis();
}

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
