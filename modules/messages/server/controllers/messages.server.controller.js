'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
	path = require('path'),
	errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

var mongoose = require('mongoose'),
	Message = mongoose.model('Message'),
	Chat = mongoose.model('Chat');
	
exports.create = create; 
exports.read = read; 
exports.update = update; 
exports.delete = deleteMsg; 
exports.list = list; 
exports.messageList = messageList; 
exports.chatList = chatList; 
exports.chatRead = chatRead; 
exports.chatListMessages = chatListMessages; 
exports.createByChat = createByChat; 
exports.messageByID = messageByID; 

/***********************************************************************************************
 * Message Method Implementation
 */
/**
 * Create a Message
 */
function create(req, res) {
	var message = new Message(req.body);
	message.sender = req.user;
	
	if (_.isString(message.recipient) && mongoose.Types.ObjectId.isValid(message.recipient)) {
		req.log.debug({ func: 'create', recipient: message.recipient }, 'Converting recipient ID String to ObjectID');
		message.recipient = new mongoose.Types.ObjectId(message.recipient);
	}
	
	req.log.debug({ func: 'create', message: message }, 'Writing new Message to DB');

	saveMessage(req, res, message);
}

/**
 * Show the current Message
 */
function read(req, res) {
	res.json(req.message);
}

/**
 * Update a Message
 */
function update(req, res) {
	var message = req.message ;

	message = _.extend(message , req.body);

	// message.save(function(err) {
	// 	if (err) {
	// 		return res.status(400).send({
	// 			message: errorHandler.getErrorMessage(err)
	// 		});
	// 	} else {
	// 		res.json(message);
	// 	}
	// });
	
	saveMessage(req, res, message);
}

/**
 * Delete an Message
 */
function deleteMsg(req, res) {
	var message = req.message ;

	message.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(message);
		}
	});
}

/**
 * List of Messages
 * @deprecated - possibly to be used by admin, but not currently needed.
 */
function list (req, res) {
	Message.find().sort('-created').populate('user', 'displayName').exec(function (err, messages) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(messages);
		}
	});
}

/**
 * Message List
 * Returns a list of messages to or from the logged in user, ordered newest first
 * 
 * @query grouped (Boolean) If true, will group the messages by the other user. Same as chatList function
 */
function messageList (req, res) {
	
	findAndProcessMessages(req, res).then(function(messages) {
			req.messages = messages;
				
			var grouped = req.query['grouped'];
			req.log.debug({ module:'messages', func: 'messageList', params: req.query, grouped: grouped });
			
			if (!!grouped) {
				groupChatsBySender(req, res);
				
				return res.json(req.chats);
			}
			
			res.json(req.messages);
		},
		function (err) {
			req.log.error({ func: 'messages.list', error: err }, 'Failed to load messages');
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});

		});
}

function findAndProcessMessages(req, res) {
	var id = req.user._id;
	
	req.log.debug({ module:'messages', func: 'findAndProcessMessages', id: id, user: req.user }, 'Start');
	
	//var id = !!req.profile && req.profile._id || req.user._id;
	
	var partyQuery = req.partyQuery || [{ 'sender': id }, { 'recipient': id }];
	
	return Message.find()
		.or(partyQuery)
		.and([{ 'recipient': { $ne: null }, 'sender': { $ne: null }}])
		.sort('-created')
		.populate('sender', 'displayName id')
		.populate('recipient', 'displayName id')
		.exec()
		.then(function (messages) {
			if (!messages || !messages.length) {
				req.log.warn({ func: 'messages.list' }, 'No messages loaded');
			}

			req.log.info({ func: 'messages.list' }, 'Loaded %d Messages for %s', messages.length, req.user.id);

			messages = _.map(messages, function (ogMessage) {
				var message = ogMessage.toObject();
				message.direction = id.equals(message.sender._id) ? 'outbound' : 'inbound';
				message.party = id.equals(message.sender._id) ? message.recipient : message.sender;

				return message;
			});

			req.log.debug({ messages: messages }, 'Request party?');

			return messages;
		});
}

function chatList (req, res) {
	req.log.trace({ func: 'chatList' }, 'Start');
	
	findAndProcessMessages(req, res).then(
		function (messages) {
			req.log.debug({ func: 'chatList', messageCt: messages.length }, 'Messages have been processed');
			req.messages = messages;
			
			
			req.log.debug({ func: 'chatList' }, 'gruping by sender');
			groupChatsBySender(req, res);
			
			req.log.debug({ func: 'chatList', chats: req.chats }, 'Got grouped chats');
			return res.json(req.chats);
		},
		function (err) {
			req.log.error({ func: 'messages.chatList', error: err }, 'Failed to load messages');
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});

		});
}

function chatRead (req, res) {
	req.log.debug({ func: 'chatRead', body: req.body }, 'Start');
	
	findAndProcessMessages(req, res).then(
		function (messages) {
			req.messages = messages;
			
			groupChatsBySender(req, res);
			
			req.log.info({ func: 'messages.chatRead', chats: req.chats }, 'Looking at grouped chats');
			
			if (!!req.chats && !!req.chats.length) {
				return res.json(req.chats[0]);
			}
			
			req.log.info({ func: 'messages.chatRead' }, 'No Existing chat for user, returning stub');
			var chat = new Chat({
				user: req.user,
				recipient: req.profile,
				profileImageURL: !!req.profile && req.profile.profileImageURL || null,
				recipientName: req.profile.displayName
			});
			
			return res.json(chat);
			
		},
		function (err) {
			req.log.error({ func: 'messages.chatRead', error: err }, 'Failed to load messages');
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});

		});
}

/**
 * Chat : List Messages
 * 
 */
function chatListMessages (req, res, next) {
	req.log.debug({ func: 'chatListMessages' }, 'Start');
	
	var id = req.user.id,
		partyId = req.profile.id;
		
	req.partyQuery = [{ 'sender': id, 'recipient': partyId }, { 'sender': partyId, 'recipient': id }];
	
	next();
}

function createByChat (req, res, next) {
	
	var text = _.isString(req.body) ? req.body : req.body.text;
	
	var chatMessage = new Message({
		sender: req.user,
		recipient: req.profile,
		text: text
	});
	
	saveMessage(req, res, chatMessage);
}

function groupChatsBySender(req, res) {
	req.log.debug({ messages: req.messages }, 'grouping messages into chats');
	var chats = _.groupBy(req.messages, function (message) {
		return message.party.displayName;
	});
	
	req.log.debug({ chatGroup: chats }, 'Got Chat Groups');
	
	req.chats = _.map(_.keys(chats), function (c) {
		req.log.debug({ chatGroup: c, group: c.displayName, chats: chats[c] }, 'Examining Chat Group');
		
		var newest = _.first(chats[c]);
		
		return new Chat({
			id: newest.party.id,
			user: req.profile || req.user,
			recipientName: c,
			recipient: newest.party, 
			profileImageURL: !!newest.party && newest.party.profileImageURL || null,
			messages: chats[c], 
			lastMessage: newest});
	});
	
	req.log.debug({ func: 'messages.list', chats: req.chats },
		'Loaded %d Distinct Chats for %s', _.keys(req.chats).length, req.user.id);
	
	return req.chats;
}

/***********************************************************************************************
 * Message middleware
 */
function messageByID (req, res, next, id) {
	Message.findById(id)
		.populate('sender', 'displayName')
		.populate('recipient', 'displayName')
		.exec(function (err, message) {
		if (err) {return next(err);}
		if (! message) {return next(new Error('Failed to load Message ' + id));}
		req.message = message ;
		next();
	});
}

/***********************************************************************************************
 * Message Instance Methods
 */

function saveMessage(req, res, message) {
	
	message.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else if(_.isString(message.recipient)) {
			return message.execPopulate('recipient')
				.then(function (success) {
					res.json(success);
				}, function reject(error) {
					res.json(message);
				});
		} else {
			return res.json(message);
		}
	});
}
