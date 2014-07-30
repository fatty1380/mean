'use strict';

// The 'run' function to configure the top level articles menu.
function run(Menus) {
	// Set top bar menu items
	Menus.addMenuItem('topbar', 'Jobs', 'articles', 'dropdown', '/articles(/create)?');
	Menus.addSubMenuItem('topbar', 'articles', 'List Articles', 'articles');
	Menus.addSubMenuItem('topbar', 'articles', 'New Article', 'articles/create');
}

// Configuring the Articles module
angular
	.module('articles')
	.run(['Menus', run]);