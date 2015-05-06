'use strict';

module.exports = {
	tests: {
		client: ['config/lib/karma-init.js', 'modules/*/tests/client/**/*.js'],
		server: ['config/lib/mocha-init.js', 'modules/*/tests/server/**/*.js'],
		routes: ['config/lib/mocha-init.js', 'modules/*/tests/server/**/*.routes.*js'],
		model: ['config/lib/mocha-init.js', 'modules/*/tests/server/**/*.model.*js'],
		e2e: ['modules/*/tests/e2e/**/*.js']
	}
};
