/**
	constructor

	@param _parentElement -- the HTML or SVG element to which to attach the vis
	@param _data -- the data array 
*/
RecoveryVis = function(_parentElement, _data) {
	this.parentElement = _parentElement; 
	this.data = _data; 
	this.displayData = []

	// compute max and min number of months to recover
	this.maxRecovery = d3.max(this.data, function(d) { if (d.recovery) { return d.recovery; }});
	this.minRecovery = d3.min(this.data, function(d) { if (d.recovery) { return d.recovery; }});

	// number bins
	this.numberBins = this.maxRecovery - this.minRecovery + 1; 

	// define svg constants 
	this.margin = {top: 20, right: 0, bottom: 30, left: 30};
	this.width = 300 - this.margin.left - this.margin.right; 
	this.height = 300 - this.margin.top - this.margin.bottom; 

	this.initVis(); 
}

RecoveryVis.prototype.initVis = function() {
	var that = this; 

	// constructs svg layout 
	this.svg = this.parentElement.append("svg")
        .attr("width", this.width + this.margin.left + this.margin.right)
        .attr("height", this.height + this.margin.top + this.margin.bottom)
      .append("g")
        .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

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
    	.selectAll("text")
    		.style("text-anchor", "end")
    		.attr("dy", "1em")
    		.attr("transform", function(d) {
    			return "rotate(-65)"
    		});

    this.svg.append("g")
    	.attr("class", "y axis")
    	.append("text")
	    	.attr("transform", "rotate(-90)")
	    	.attr("y", 6)
	    	.attr("dy", ".71em")
	    	.style("text-anchor", "end")
	    	.text("Distribution of Recovery Times (months)");

	// filter, aggregate, modify data 
	this.wrangleData(null);

    this.updateVis();
}

RecoveryVis.prototype.updateVis = function() {

	var that = this; 
	var max = d3.max(this.displayData);
	this.x.domain([0,this.numberBins]);
	this.y.domain([0, max]); 


	// update axis
	 this.svg.select(".x.axis")
 		.call(this.xAxis)
 		.attr("transform", "translate(0," + this.height + ")")
 		.selectAll("text")
 			.style("text-anchor", "end")
 			.attr("dx", "-.8em")
 			.attr("dy", ".15em")
    		.attr("transform", function(d) {
    			return "rotate(-65)"
    		});

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


RecoveryVis.prototype.wrangleData = function(_filterFunction) {

	this.displayData = this.filterAndAggregate(_filterFunction);
}

/**
	Gets called by event handler
*/
RecoveryVis.prototype.onSelectionChange = function(selectionStart, selectionEnd) {
	// TODO - what function to pass in 

	this.updateVis(); 
}

/*
*
* ==================================
* From here on only HELPER functions
* ==================================
*
* */
RecoveryVis.prototype.filterAndAggregate = function(_filter) {
	// Set filter to a function that accepts all items
	// ONLY if the parameter _filter is NOT null use this parameter
	var filter = function(){return true;}
	if (_filter != null){
		filter = _filter;
	}

    var that = this; 

    // accumulate all values that fulfill the filter ceriterion 
    var filtered_data = that.data.filter(filter); 

	// create an array of values for recovery times with domain [minRecovery, maxRecovery]
	var res = d3.range(this.numberBins).map(function () {
		return 0;
	});

	for (surgery of filtered_data) {
		res[surgery.recovery - this.minRecovery]+=1; 
	}

  	return res; 
}














