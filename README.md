PROJECT WEBSITE URL: TODO
video url:
process book url:

Code Structure and Overview of Functionality

index.html
  - contains the html skeleton for the website
  - sets up event handlers and propagates information accordingly
  - loads and formats data

All of the svg visualizations have seperate files in the /js folder.

countvis.js
  - main visualization
  - represents a player's surgery as a node (cirlce)
  - creates a distribution across time
  - players are clickable
  - area is zoomable and brushable, but not simultaneously

playervis.js
  - the specific information pertaining to a single player
  - players are searchable
  - player is highlighted in red in the main visualization
  - shows performance metrics over career overlayed with surgery time
  - pictures (if available) courtesy of http://mlb.mlb.com/images/players, look at getPictures.py for more details

recoveryvis.js
  - a distribution of the recovery time of players based on brush and filtering options

agevis.js
  - a distribution of the ages based on brush and filtering options
