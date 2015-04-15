
// constructor
CountVis = function(_parentElement, _data, _eventHandler) {
  this.parentElement = _parentElement;
  this.data = _data;
  this.eventHandler = _eventHandler;
  this.displayData = [];
  this.displayData = this.data;
  
  // define svg constants
  this.margin = {top: 20, right: 0, bottom: 30};
  this.width = getInnerWidth(this.parentElement) - this.margin.left - this.margin.right;
  this.height = 400 - this.margin.top - this.margin.bottom;

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

  this.area = d3.svg.area()
    .interpolate("monotone")
    .x(function(d) {return that.x(d.time); })
    .y0(this.height)
    .y1(function(d) { return that.y(d.count); });

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

  this.UpdateVis();

}

CountVis.prototype.updateVis = function() {
  // update scales
  this.x.domain(d3.extent(this.displayData, function(d) { return d.time; }));
  this.y.domain(d3.extent(this.displayData, function(d) { return d.count; }));

  // update axis
  this.svg.select(".x.axis")
    .call(this.xAxis);

  this.svg.select(".y.axis")
    .call(this.yAxis);

  // updates graph
  var path = this.svg.selectAll("area")
    .data([this.displayData]);

  path.enter()
    .append("path")
    .attr("class", "area");

  path
    .transition()
    .attr("d", this.area);

  path.exit()
    .remove();

}


















