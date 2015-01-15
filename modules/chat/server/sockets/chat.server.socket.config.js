'use strict';

// Create the chat configuration
module.exports = function (io, socket) {
    // Emit the status event when a new socket client is connected
    io.emit('chatMessage', {
        type: 'status',
        text: 'Is now connected',
        created: Date.now(),
        profileImageURL: socket.request.user.profileImageURL,
        username: socket.request.user.username
    });

    // Send a chat messages to all connected sockets when a message is received 
    socket.on('chatMessage', function (message) {
        message.type = 'message';
        message.created = Date.now();
        message.profileImageURL = socket.request.user.profileImageURL;
        message.sender = socket.request.user;
        message.username = socket.request.user.username;

        // Emit the 'chatMessage' event
        io.emit('chatMessage', message);

        console.log('Got message (with room?): %j', message);

        if (message.room) {
            console.log('transmitting message to room %s', message.room);
            io.sockets.in(message.room).emit('chatMessage', message);
        }
    });

    // Emit the status event when a socket client is disconnected
    socket.on('disconnect', function () {
        io.emit('chatMessage', {
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
        if (!!socket.room) {
            console.log('[ChatCfg] Leaving room %s', socket.room);
            socket.leave(socket.room);
        }
        debugger;
        console.log('[ChatCfg] Joining room %s', room);
        socket.join(room);
        console.log('Joined new Room: %j', room);

        socket.room = room;
    });

    socket.on('chatMessage', function (data) {
        io.sockets.in(data.room).emit('message', data.message);
    });

};

