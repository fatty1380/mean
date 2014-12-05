'use strict';

// Configuring the Articles module

function menus(Menus) {
    // Add the articles dropdown item
    Menus.addMenuItem('adminbar', {
        title: 'Articles',
        state: 'articles',
        type: 'dropdown',
        position: 1,
        roles: ['admin']
    });

    // Add the dropdown list item
    Menus.addSubMenuItem('adminbar', 'articles', {
        title: 'List Articles',
        state: 'articles.list'
    });

    // Add the dropdown create item
    Menus.addSubMenuItem('adminbar', 'articles', {
        title: 'Create Articles',
        state: 'articles.create'
    });
}

menus.$inject = ['Menus'];

angular.module('articles').run(menus);
