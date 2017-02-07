'use strict';

var reflexContext = function() {
};

reflexContext.log = function(msg) {

  try {
    ReflexContext.log(msg);
  }catch(e) {
    console.log(this.URL+msg);
  }
}

module.exports = reflexContext; 
