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

    // add player image 
    // this.svg.append("image")
    //   .attr("xlink:href", "img/players/" + this.data[5].mlbamid + ".jpg")
    // 	.attr("width", this.width)
    // 	.attr("height", this.height);

  this.updateVis();
}

PlayerVis.prototype.updateVis = function() {

  that = this; 

  console.log(this.displayData[0].mlbamid);

  this.svg.select("image")
    .remove()

  // add player image 
  this.svg.append("image")
    .attr("xlink:href", "img/players/" + this.displayData[0].mlbamid + ".jpg")
    .attr("width", this.width)
    .attr("height", this.height);

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









