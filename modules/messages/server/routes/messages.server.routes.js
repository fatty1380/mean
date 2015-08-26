'use strict';

module.exports = function(app) {
	var messages = require('../controllers/messages.server.controller');
	var messagesPolicy = require('../policies/messages.server.policy');

	// Messages Routes
	app.route('/api/messages')
		.all(messagesPolicy.isAllowed)
		//.get(messages.chatList)
		.get(messages.messageList)
		.post(messages.create);
		
	app.route('/api/chats')
		.all(messagesPolicy.isAllowed)
		.get(messages.chatList);
		
	app.route('/api/chats/:userId')
		.all(messagesPolicy.isAllowed)
		.get(messages.chatListMessages, messages.chatList)
		.put(messages.createByChat);

	app.route('/api/messages/:messageId')
		.all(messagesPolicy.isAllowed)
		.get(messages.read)
		.put(messages.update)
		.delete(messages.delete);
	
	// TODO: Properly Secure this route
	app.route('/api/users/:userId/messages')
		.all(messagesPolicy.isAllowed)
		.get(messages.messageList);

	// Finish by binding the Message middleware
	app.param('messageId', messages.messageByID);
};