var PuckIQHelper = require('../helpers');

function preCannedQueries() {
  "use strict";
  var helper = new PuckIQHelper();

  this.getPlayerList = function(options, collection) {
    var query = helper.mongoQueryBuilder(options);
    return collection.find(query).sort({ conference: 1, division: 1 });
  }
}

module.exports = preCannedQueries;