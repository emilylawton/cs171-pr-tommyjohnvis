/**
	constructor

	@param _parentElement -- the HTML or SVG element to which to attach the vis
	@param _data -- the data array
*/
PlayerVis = function(_parentElement, _data) {
	this.parentElement = _parentElement;
	this.data = _data; 
	// TODO - change to show default stats upon loading
	this.displayData = [this.data[5]];

	// define svg constants  
	this.margin = {top: 20, right: 0, bottom: 30, left: 0};
  	this.width = 300 - this.margin.left - this.margin.right;
  	this.height = 400 - this.margin.top - this.margin.bottom;

  this.initVis();
}

/**
	Method that sets up the SVG and the variables 
*/
PlayerVis.prototype.initVis = function(){
	var that = this; 

  // constructs svg layout 
	this.svg = this.parentElement.append("svg")
        .attr("width", this.width + this.margin.left + this.margin.right)
        .attr("height", this.height + this.margin.top + this.margin.bottom)
      .append("g")
        .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

  this.updateVis();
}

PlayerVis.prototype.updateVis = function() {

  var that = this; 

  this.svg.select("image")
    .remove()

  this.svg.selectAll("text")
    .remove()

  // add player image 
  this.svg.append("image")
    .attr("xlink:href", "img/players/" + this.displayData[0].mlbamid + ".jpg")
    .attr("width", this.width)
    .attr("height", this.height)
    .attr("id", "playerImage");

  // hide image not found icon
  var img = document.getElementById("playerImage"); 
  img.onerror = function () {
    this.style.display = "none"; 
  }

  // player name 
  this.svg.append("text")
      .attr("y", 50)
      .attr("font-size", "30px")
      .text(function() {
        return that.displayData[0].player;
      });

  var y = 300 

  // TODO: ABSTRACT

  // surgery date 
  this.svg.append("text")
    .attr("y", y)
    .attr("font-size", "10px")
    .text(function() {
      y += 15; 
      var date = that.displayData[0].surg_date; 
      return "Surgery Date: " + (date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getFullYear();
    });

  // surgeon(s) 
  if (that.displayData[0].surgeons) {
    this.svg.append("text")
      .attr("y", y) 
      .attr("font-size", "10px")
      .text(function() {
        y += 15; 
        return "Surgeon(s): " + that.displayData[0].surgeons; 
      });
  }

  // recovery time 
  if (that.displayData[0].recovery) {
    this.svg.append("text")
      .attr("y", y)
      .attr("font-size", "10px")
      .text(function() {
        y += 15; 
        return "Recovery Time: " + that.displayData[0].recovery + " months";
      });
  }

  // team 
  if (that.displayData[0].team) {
    this.svg.append("text")
      .attr("y", y) 
      .attr("font-size", "10px")
      .text(function() {
        y += 15; 
        return "Team: " + that.displayData[0].team;
      });
  }

  // position 
  if (that.displayData[0].position) {
    this.svg.append("text")
      .attr("y", y) 
      .attr("font-size", "10px")
      .text(function() {
        y += 15; 
        return "Position: " + that.displayData[0].position;
      });
  }

  // active status 
  this.svg.append("text")
    .attr("y", y)
    .attr("font-size", "10px")
    .text(function() {
      y += 15;
      return (that.displayData[0].active) ? "Active" : "Not Active";
    });

}

PlayerVis.prototype.wrangleData = function(_filterFunction) {
  this.displayData = this.filterAndAggregate(_filterFunction); 
}

/**
  Gets called by event handler
*/
PlayerVis.prototype.onSelectionChange = function(id) {

  // TODO: issue - could find mlbamid more than once 
  this.wrangleData(function(d) { return d.mlbamid == id}); 

	this.updateVis();
}

/*
*
* ==================================
* From here on only HELPER functions
* ==================================
*
* */

PlayerVis.prototype.filterAndAggregate = function(_filter) {
  // Set filter to a function that accepts all items
  // ONLY if the parameter _filter is NOT null use this parameter
  var filter = function(){return true;}
  if (_filter != null){
      filter = _filter;
  }

  var that = this; 

  var filtered_data = that.data.filter(filter); 

  return filtered_data; 
}









