require('dotenv').config();
import app from './app';
import https from 'https';
import { Server } from 'socket.io';
import fs from 'fs';

import {
  joinUser,
  getUserID,
  userDisconnect,
  usersList,
} from './helpers/UserFuncs';

const secureServer = https
  .createServer(
    {
      cert: fs.readFileSync('./cert/server.crt'),
      key: fs.readFileSync('./cert/server.key'),
    },
    app
  )
  .listen(app.get('port'), () => {
    console.log('Server running on SSL/TLS serving on port: ', app.get('port'));
  });

/* const server = app.listen(app.get('port'), () => {
  console.log('Server on port:', app.get('port'));
});
 */
//const io = new Server(server);
const io = new Server(secureServer);

// Initializing the socket io connection
io.on('connection', (socket) => {
  // For a new user joining the room
  socket.on('joinRoom', ({ username, roomname, pubkey }) => {
    // New user creation

    const newUser = joinUser(socket.id, username, roomname, pubkey);
    console.log('New Connection!', socket.id);
    socket.join(newUser.room);

    // Show welcome message

    socket.emit('joinRoom:welcome', {
      userID: newUser.id,
      username: newUser.username,
      text: `Welcome ${newUser.username}`,
    });

    // Get publickey

    const pubkeysArray = usersList.map((user: any) => {
      return user.pubkey;
    });

    // Emit current public keys
    io.sockets.emit('joinRoom:shareKeys', pubkeysArray);

    // Broadcast that a new user has joined the room

    socket.broadcast.to(newUser.room).emit('joinRoom:newUser', {
      userID: newUser.id,
      username: newUser.username,
      text: `${newUser.username} has joined the chat`,
    });
  });

  // User sends a message

  socket.on('chat', (text) => {
    // Gets the room user and the message sent

    const user = getUserID(socket.id);

    socket.broadcast.to(user.room).emit('chat:message', {
      userID: user.id,
      username: user.username,
      text: text,
    });
  });

  // User disconnection

  socket.on('disconnect', () => {
    // User is deleted from the list

    const user = userDisconnect(socket.id);

    if (user) {
      io.to(user.room).emit('message', {
        userID: user.id,
        username: user.username,
        text: `${user.username} has left the chat`,
      });
    }
  });
});
