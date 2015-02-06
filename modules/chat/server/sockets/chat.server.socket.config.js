'use strict';

var path            = require('path'),
    ApplicationCtrl = require(path.resolve('./modules/applications/server/controllers/applications.server.controller')),
    mongoose        = require('mongoose'),
    Application     = mongoose.model('Application'),
    Message         = mongoose.model('Message');

// Create the chat configuration
module.exports = function (io, socket) {
    console.log('[SOCKET] Initializing Connection for `%s`', socket.request.user.displayName);

    // Emit the status event when a new socket client is connected
    io.sockets.in('lobby').emit('chatMessage', {
        type: 'status',
        text: 'Is now connected',
        created: Date.now(),
        profileImageURL: socket.request.user.profileImageURL,
        username: socket.request.user.username,
        sender: socket.request.user
    });

    // Send a chat messages to all connected sockets when a message is received 
    socket.on('chatMessage', function (message) {

        console.log('[SOCKET] Got raw message: %j', message);

        console.log('[SOCKET.%s] socket room? %s', message.type, message.room);

        if(!message.room) {
            console.error('No room specified in message');
            return false;
        }

        message.type = 'message';
        message.created = Date.now();
        message.profileImageURL = socket.request.user.profileImageURL;
        message.sender = socket.request.user;
        message.username = socket.request.user.username;


        switch (message.scope) {
            case 'applications':
                console.log('Saving message to applications');
                var result = ApplicationCtrl.persistMessage(message.room, message);
                break;
            default:
                console.log('[SOCKET.%s] Unknown persistance for message scope `%s`', message.scope);
        }

        // Emit the 'chatMessage' event

        console.log('[SOCKET.%s] Choosing transmit method ...', message.type);

        if (message.room) {
            //console.log('[SOCKET.%s] transmitting message from %s to room %s', message.type, message.username, message.room);
            console.log('[SOCKET.%s] emitting message to room `%s` with data: %j', message.type, message.room, message);
            io.sockets.in(message.room).emit('chatMessage', message);
        }
        else {
            debugger;
            return false;
            console.log('[SOCKET.%s] No Room Specified - directing to `lobby`: %s', message.type, message.username);
            io.sockets.in('lobby').emit('chatMessage', message);
        }
    });

    // Emit the status event when a socket client is disconnected
    socket.on('disconnect', function () {
        console.log('[DISCONNECT] socket room? %s', socket.room);

        io.sockets.in('lobby').emit('chatMessage', {
            type: 'status',
            text: 'disconnected',
            created: Date.now(),
            username: socket.request.user.username,
            sender: socket.request.user
        });
    });

    /*** ------------- NEW STUFF - Aiming towards different "rooms" --------------------------***/

        // once a client has connected, we expect to get a ping from them saying what room they want to join
    socket.on('join-room', function (room) {

        console.log('[SOCKET.join-room] Join Room has been called for `%s`', room);

        if (socket.room === room || socket.rooms && socket.rooms.indexOf(room)!==-1) {
            console.log('[SOCKET.join-room] Aborting - already in this room');
            return;
        }

        //if (!!socket.room) {
        //    console.log('[SOCKET.join-room] Leaving room %s', socket.room);
        //    // Emit the status event when a socket client is disconnected
        //    socket.on('disconnect', function () {
        //        io.sockets.in(socket.room).emit('chatMessage', {
        //            type: 'status',
        //            text: 'disconnected',
        //            created: Date.now(),
        //            username: socket.request.user.username,
        //            sender: socket.request.user
        //        });
        //    });
        //    socket.leave(socket.room);
        //}

        socket.join(room);
        console.log('[SOCKET.join-room] Joined new Room: %j', room);

        // Emit the status event when a new socket client is connected
        io.sockets.in(room).emit('chatMessage', {
            type: 'status',
            text: 'Is now connected',
            created: Date.now(),
            profileImageURL: socket.request.user.profileImageURL,
            username: socket.request.user.username,
            sender: socket.request.user
        });

        socket.room = room;
    });

    socket.on('leave-room', function(room) {

        console.log('[SOCKET.leave-room] Leave Room has been called for `%s`', room);

        if(socket.rooms.indexOf(room) === -1) {
            console.log('[SOCKET.leave-room] Socket is not joined to this room `%j`', socket.rooms);
            return;
        }

        if (!!room) {
            console.log('[SOCKET.leave-room] Leaving room %s', room);
            // Emit the status event when a socket client is disconnected
            socket.on('disconnect', function () {
                io.sockets.in(room).emit('chatMessage', {
                    type: 'status',
                    text: 'disconnected',
                    created: Date.now(),
                    username: socket.request.user.username,
                    sender: socket.request.user
                });
            });
            socket.leave(room);

            socket.room = null;
        }
    })

    socket.on('chatMessage', function (data) {
        console.log('[SOCKET.ALT.%s] NOT emitting message to room `%s` with data: %j', data.type, data.room, data);
        //io.sockets.in(data.room).emit('message', data.message);
    });


};

