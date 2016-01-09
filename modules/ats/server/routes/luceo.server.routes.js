'use strict';

module.exports = function (app) {
    var path = require('path'),
        Luceo = require(path.resolve('./modules/ats/server/services/luceo.server.service'));
        
   /**
    * @desc Working with Luceo (Core-Mark) Candidates will require each of the following actions:
    *       * Searching for existing candidates (search by user's email)
    *       * Creating a new candidate for the logged in user
    *       * Updating an existing candidate for the logged in user.
    *
    * Additionally, because candidates require a specific set of information, we will need to
    * access the populated properties, as well as the missing ones. This will be handled by
    * returning a set of "question" answers which will be similar in structure to the fields
    * used by the @see /modules/core/server/services/everifile.server.service.js|eVerifile service.
    */
        
    app.route('/api/luceo/candidate');
};
