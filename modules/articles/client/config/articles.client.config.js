'use strict';

// Configuring the Articles module

function menus(Menus) {
    // Add the articles dropdown item
    Menus.addMenuItem('topbar', {
        title: 'Articles',
        state: 'articles',
        type: 'dropdown',
        position: 1
    });

    // Add the dropdown list item
    Menus.addSubMenuItem('topbar', 'articles', {
        title: 'List Articles',
        state: 'articles.list'
    });

    // Add the dropdown create item
    Menus.addSubMenuItem('topbar', 'articles', {
        title: 'Create Articles',
        state: 'articles.create'
    });
}

menus.$inject = ['Menus'];

angular.module('articles').run(menus);
