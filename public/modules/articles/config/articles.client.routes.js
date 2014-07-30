'use strict';

// Configure the different client routes
function config($stateProvider) {
	// Articles state routing
	$stateProvider.
	state('listArticles', {
		url: '/articles',
		templateUrl: 'modules/articles/views/list-articles.client.view.html'
	}).
	state('createArticle', {
		url: '/articles/create',
		templateUrl: 'modules/articles/views/create-article.client.view.html'
	}).
	state('viewArticle', {
		url: '/articles/:articleId',
		templateUrl: 'modules/articles/views/view-article.client.view.html'
	}).
	state('editArticle', {
		url: '/articles/:articleId/edit',
		templateUrl: 'modules/articles/views/edit-article.client.view.html'
	});
}

// Setting up route
angular
	.module('articles')
	.config(config);