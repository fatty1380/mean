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

/**
 * Create a Message
 */
exports.create = function(req, res) {
	var message = new Message(req.body);
	message.sender = req.user;
	
	req.log.debug({ func: 'create', message: message }, 'Writing new Message to DB');

	message.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(message);
		}
	});
};

/**
 * Show the current Message
 */
exports.read = function(req, res) {
	res.json(req.message);
};

/**
 * Update a Message
 */
exports.update = function(req, res) {
	var message = req.message ;

	message = _.extend(message , req.body);

	message.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(message);
		}
	});
};

/**
 * Delete an Message
 */
exports.delete = function(req, res) {
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
};

/**
 * List of Messages
 * @deprecated - possibly to be used by admin, but not currently needed.
 */
exports.list = function(req, res) { Message.find().sort('-created').populate('user', 'displayName').exec(function(err, messages) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(messages);
		}
	});
};

exports.messageList = function (req, res) {
	var id = !!req.profile && req.profile._id || req.user._id;
	
	Message.find()
		.or([{ sender: id }, { recipient: id }])
		.sort('-created')
		.populate('sender', 'displayName')
		.populate('recipient', 'displayName')
		.exec()
		.then(function (messages) {
			req.log.debug({ func: 'messages.list', msgCt: messages.length },
				'Loaded %d Messages for %s', messages.length, req.user.id);
				
			var grouped = req.query['grouped'];
			req.log.debug({ func: 'messageList', params: req.query, grouped: grouped });
			
			req.messages = _.map(messages, function (ogMessage) {
				var message = ogMessage.toObject();
				req.log.debug({ user: req.user.id, sender: message.sender, recipient: message.recipient }, 'Sender Recipient Comparison');
				message.direction = id.equals(message.sender._id) ? 'outbound' : 'inbound';
				req.log.debug({ direction: message.direction }, 'Message Direction');
				message.party = id.equals(message.sender._id) ? message.recipient : message.sender;
				req.log.debug({ party: message.party }, 'Message Party');
				
				return message;
			});
			
			req.log.debug({ messages: req.messages }, 'Request party?');
				
			if (!!grouped) {
				return exports.listChats(req, res);
			}
			
			res.json(req.messages);
		},
		function (err) {
			req.log.error({ func: 'messages.list', error: err }, 'Failed to load messages');
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});

		});
};

exports.listChats = function (req, res) {
	var chats = _.groupBy(req.messages, function (message) {
		return message.party.displayName;
	});
	
	req.log.debug({ chatGroup: chats }, 'Got Chat Groups');
	
	req.chats = _.map(_.keys(chats), function (c) {
		req.log.debug({ chatGroup: c, group: c.displayName, chats: chats[c] }, 'Examining Chat Group');
		
		var newest = chats[c][0];
		
		return new Chat({
			user: req.profile || req.user,
			recipientName: c,
			recipient: newest.party, 
			messages: chats[c], 
			lastMessage: newest})
	})
	
	req.log.debug({ func: 'messages.list', chats: req.chats },
		'Loaded %d Distinct Chats for %s', _.keys(req.chats).length, req.user.id);
	
	return res.json(req.chats);
}

/**
 * Message middleware
 */
exports.messageByID = function (req, res, next, id) {
	Message.findById(id)
		.populate('sender', 'displayName')
		.populate('recipient', 'displayName')
		.exec(function (err, message) {
		if (err) return next(err);
		if (! message) return next(new Error('Failed to load Message ' + id));
		req.message = message ;
		next();
	});
};