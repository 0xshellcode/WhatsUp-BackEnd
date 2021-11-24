require('dotenv').config();
import app from './app';
import { Server } from 'socket.io';
import {
  joinUser,
  getUserID,
  userDisconnect,
  usersList,
} from './helpers/UserFuncs';

const server = app.listen(app.get('port'), () => {
  console.log('Server on port:', app.get('port'));
});
const io = new Server(server);

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

    const pubkeysArray = usersList.map((user: any) => {
      return user.pubkey;
    });

    socket.emit('joinRoom:shareKeys', pubkeysArray);
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

    io.to(user.room).emit('chat:message', {
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
