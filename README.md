# Tommy John Surgery Visualization README

http://emilylawton.github.io/cs171-pr-tommyjohnvis/ 

### Video

-
https://www.youtube.com/watch?v=U1WK4j9xb1E&feature=youtu.be

### Process Book

-
https://docs.google.com/a/college.harvard.edu/document/d/1laUyLCyJN1hDHp0qPEPCX5Q9Z4apPwG25a23SmULjXk/edit?usp=sharing


### Code Structure and Overview of Functionality

-

####index.html

  - contains the html skeleton for the website
  - sets up event handlers and propagates information accordingly
  - loads and formats data

All of the svg visualizations have seperate files in the /js folder:

####countvis.js

  - main visualization
  - a distribution of surgeries across time
  - represents a player's surgery as a node (cirlce)
  - hovering over circles, changes the playervis visualization
  - if circle is clicked, the playervis locks on that specific player
  - area is zoomable and brushable, but not simultaneously

####playervis.js
  - the specific information pertaining to a single player
  - players are searchable
  - player is highlighted in red in the main visualization
  - shows performance metrics over career overlayed with surgery time
  - shows number of post TJS MLB IP as compared with average across all other players that underwent TJS
  - shows recovery time of selected player as compared with average recovery time across all other players that underwent TJS
  - pictures (if available) courtesy of http://mlb.mlb.com/images/players, look at getPictures.py for more details
  - performance metrics (ERA and SO/IP) courtesy of http://www.seanlahman.com/baseball-archive/statistics/, look at getPitchingData.py for details

####recoveryvis.js
  - a distribution of the recovery time of players based on brush and filtering options

####agevis.js
  - a distribution of the ages based on brush and filtering options

#### /img/
- contains player photos appearing in playervis

#### /data/
- contains json representations of TJS and performance data

 
