'use strict';

module.exports = function(app) {
    var braintree = require('../controllers/braintree.server.controller');

    app.route('/api/payments/token').get(braintree.getToken);

};
