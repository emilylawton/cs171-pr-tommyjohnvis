/**
	constructor

	@param _parentElement -- the HTML or SVG element to which to attach the vis
	@param _data -- the data array
*/
PlayerVis = function(_parentElement, _data) {
	this.parentElement = _parentElement;
	this.data = _data; 

  // compute average recovery time & average post TJ IP
  totalMonths = 0; 
  recoveryCount = 0;
  totalIP = 0; 
  ipCount = 0; 
  for (surgery of this.data) {
    if (surgery.recovery) {
      recoveryCount+=1;
      totalMonths += surgery.recovery;
    }
    if (surgery.post_ippa) {
      ipCount+=1; 
      totalIP += surgery.post_ippa; 
    }
  }
  this.averageRecovery = totalMonths / recoveryCount; 
  this.averageIP = totalIP / ipCount;

	// TODO - change to show default stats upon loading
	this.displayData = [this.data[5]];

	// define svg constants  
	this.margin = {top: 20, right: 0, bottom: 30, left: 0};
  	this.width = 300 - this.margin.left - this.margin.right;
  	this.height = 500 - this.margin.top - this.margin.bottom;

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

  // create axis and scales
  this.x = d3.scale.linear()
    .range([0, this.width*.5]); 

  this.updateVis();
}

PlayerVis.prototype.updateVis = function() {

  var that = this; 
  error = false; 
  var y = 215; 

  this.svg.select("image")
    .remove();

  this.svg.selectAll("text")
    .remove();

  this.svg.selectAll("g")
    .remove();

  // add player image 
  this.svg.append("image")
    .attr("xlink:href", "img/players2/" + this.displayData[0].mlbamid + ".jpg")
    .attr("width", 200)
    .attr("height", 150)
    .attr("y", 35)
    .attr("id", "playerImage");

  // hide image not found icon
  var img = document.getElementById("playerImage"); 
  img.onerror = function () {
    this.style.display = "none"; 
    this.error = true; 
    y = 100;
  }

  if (error) {
    this.svg.select("image").remove();
    this.svg.append("image")
      .attr("xlink:href", "img/baseball.jpg")
      .attr("width", this.width)
      .attr("height", this.height)
      .attr("id", "playerImage");
  }

  // player name 
  this.svg.append("text")
      .attr("y", 25)
      .attr("font-size", "30px")
      .text(function() {
        return that.displayData[0].player;
      });

  // surgery date 
  this.svg.append("text")
    .attr("y", y)
    .attr("font-size", "10px")
    .attr("font-weight", "bold")
    .text(function() {
      var date = that.displayData[0].surg_date; 
      return "Surgery Date: ";
    });

  var stats_x = 100; 

  this.svg.append("text")
    .attr("y", y)
    .attr("x", stats_x)
    .attr("font-size", "10px")
    .text(function() {
      y += 15; 
      var date = that.displayData[0].surg_date; 
      return (date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getFullYear();
    });

  // surgeon(s) 
  if (that.displayData[0].surgeons) {
    this.svg.append("text")
      .attr("y", y) 
      .attr("font-size", "10px")
      .attr("font-weight", "bold")
      .text(function() {
        return "Surgeon(s): "; 
      });

    this.svg.append("text")
      .attr("y", y) 
      .attr("x", stats_x)
      .attr("font-size", "10px")
      .text(function() {
        y += 15; 
        return that.displayData[0].surgeons; 
      });
  }

  // age at time of surgery
  if (that.displayData[0].age) {
    this.svg.append("text")
      .attr("y", y) 
      .attr("font-size", "10px")
      .attr("font-weight", "bold")
      .text(function() {
        return "Age at surgery time: "; 
      });

    this.svg.append("text")
      .attr("y", y) 
      .attr("x", stats_x)
      .attr("font-size", "10px")
      .text(function() {
        y += 15; 
        return that.displayData[0].age; 
      });
  }

  // team 
  if (that.displayData[0].team) {
    this.svg.append("text")
      .attr("y", y) 
      .attr("font-size", "10px")
      .attr("font-weight", "bold")
      .text(function() {
        return "Team: ";
      });

    this.svg.append("text")
      .attr("y", y) 
      .attr("x", stats_x)
      .attr("font-size", "10px")
      .text(function() {
        y += 15; 
        return that.displayData[0].team;
      });

  }

  // position 
  if (that.displayData[0].position) {
    this.svg.append("text")
      .attr("y", y) 
      .attr("font-size", "10px")
      .attr("font-weight", "bold")
      .text(function() {
        return "Position: ";
      });

    this.svg.append("text")
      .attr("y", y) 
      .attr("x", stats_x)
      .attr("font-size", "10px")
      .text(function() {
        y += 15
        return that.displayData[0].position;
      });
  }

  // throws
  if (that.displayData[0].throwing_arm) {
    this.svg.append("text")
      .attr("y", y)
      .attr("font-weight", "bold")
      .attr("font-size", "10px")
      .text(function() {
        return "Throws: "; 
      });
    
    this.svg.append("text")
      .attr("y", y)
      .attr("x", stats_x)
      .attr("font-size", "10px")
      .text(function() {
        y += 15; 
        return that.displayData[0].throwing_arm; 
      });
  }

  // active status 
  this.svg.append("text")
    .attr("y", y)
    .attr("font-size", "10px")
    .attr("font-weight", "bold")
    .text(function() {
      return "Status:";
    });

  this.svg.append("text")
    .attr("y", y)
      .attr("x", stats_x)
      .attr("font-size", "10px")
      .text(function() {
        return (that.displayData[0].active) ? "Active" : "Not Active"; 
      })

  // compare post IP to average 
  var IPcats = ["Average Post TJS MLB IP", that.displayData[0].player];
  var IPData = [this.averageIP, that.displayData[0].post_ippa];
  console.log(that.displayData[0].post_ippa);
  var max = d3.max(IPData);
  this.x.domain([0, max*1.5]); 
 
  var ip_g = this.svg.append("g")
    .attr("transform", "translate("+that.margin.left+","+that.margin.top+")");

  var rows = ip_g
    .selectAll("g.row")
    .data(IPData)
    .enter()
      .append("g")
      .attr("class", "row")

  var names = rows
    .append("text")
    .attr("font-famiy", "sans-serif")
    .attr("font-weight", "bold")
    .attr("font-size", "10px")
    .attr("x", function(d) { return that.x(d) + 5; })
    .attr("y", function(d, i) {
      return y + i*15; 
    })
    .text(function(d, i) {
      return IPcats[i];
    }); 

  var ip = rows
    .append("text")
    .attr("font-famiy", "sans-serif")
    .attr("font-size", "10px")
    .attr("x", function(d) { return that.x(d) - 20; })
    .attr("y", function(d, i) {
      return y + i*15; 
    })
    .text(function(d) {
      return Math.round(d);
    }); 

  var bars = rows
    .append("rect")
    .attr("width", function(d) { return that.x(d); })
    .attr("height", 12)
    .attr("x", 0)
    .attr("y", function(d, i) { 
      return y + i * 15 - 10; 
    })
    .attr("opacity", function(d, i) {
      return (i == 0) ? .2 : .4;
    });

  // recovery time 
  if (that.displayData[0].recovery) {
    y += 50
  
    // compare recovery time to average 
    var recoveryCats = ["Average Recovery Time (months)", that.displayData[0].player];
    var recoveryData = [this.averageRecovery, that.displayData[0].recovery];
    var max = d3.max(recoveryData);
    this.x.domain([0, max*1.5]); 
   
    var recovery_g = this.svg.append("g")
      .attr("transform", "translate("+that.margin.left+","+that.margin.top+")");

    var rows = recovery_g
      .selectAll("g.row")
      .data(recoveryData)
      .enter()
        .append("g")
        .attr("class", "row")

    var months = rows
      .append("text")
      .attr("font-famiy", "sans-serif")
      .attr("font-size", "10px")
      .attr("x", function(d) { return that.x(d) - 15; })
      .attr("y", function(d, i) {
        return y + i*15; 
      })
      .text(function(d, i) {
        return Math.round(d);
      })

    var names = rows
      .append("text")
      .attr("font-famiy", "sans-serif")
      .attr("font-weight", "bold")
      .attr("font-size", "10px")
      .attr("x", function(d) { return that.x(d) + 5; })
      .attr("y", function(d, i) {
        return y + i*15; 
      })
      .text(function(d, i) {
        return recoveryCats[i];
      }); 

    var bars = rows
      .append("rect")
      .attr("width", function(d) { return that.x(d); })
      .attr("height", 12)
      .attr("x", 0)
      .attr("y", function(d, i) { 
        return y + i * 15 - 10; 
      })
      .attr("opacity", function(d, i) {
        return (i == 0) ? .2 : .4;
      });
  }
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









