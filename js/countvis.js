
// constructor
CountVis = function(_parentElement, _data, _eventHandler) {
  this.parentElement = _parentElement;
  this.data = _data;
  this.eventHandler = _eventHandler;
  this.displayData = [];
  this.graph = {nodes: [], links: []};
  this.inventory = [];

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

  this.wrangleData();
  this.initVis();
}

CountVis.prototype.initVis = function() {
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
  this.y.domain([1,this.maxOccurence]);

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
    .attr("class", "row");

  enter_nodes
    .append("circle")
    .on("click", function(d) {
      console.log(d.mlbamid);
      $(that.eventHandler).trigger("selectionChanged", {"id": d.mlbamid}); 
    })
    .attr("r", 4);
    

  this.force
    .nodes(this.graph.nodes)
    .start();

var dateFormatter = d3.time.format("%m/%Y");

this.graph.nodes.forEach(function(d, i) {
    d.x = that.x(d.surg_date);   
    d.y = that.y(that.occurences[d.surg_date]);
    that.occurences[d.surg_date]--;
  });

  this.graphUpdate(0);

}

CountVis.prototype.graphUpdate = function(duration) {
  this.node.transition().duration(duration)
    .attr("transform", function(d) { 
      return "translate("+d.x+","+d.y+")"; 
    });
}
CountVis.prototype.wrangleData = function() {
  var new_data = this.data;
  // filter if necessary

  this.graph.nodes = new_data;
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










