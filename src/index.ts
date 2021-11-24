require('dotenv').config();
import app from './app';
import { Server, Socket } from 'socket.io';
import { joinUser, getUserID, userDisconnect } from './helpers/UserFuncs';

const server = app.listen(app.get('port'), () => {
  console.log('Server on port:', app.get('port'));
});
const io = new Server(server);

//initializing the socket io connection
io.on('connection', (socket) => {
  // For a new user joining the room
  socket.on('joinRoom', ({ username, roomname }) => {
    // New user creation

    const newUser = joinUser(socket.id, username, roomname);
    console.log('New Connection!', socket.id);
    socket.join(newUser.room);

    // Show welcome message

    socket.emit('message', {
      userID: newUser.id,
      username: newUser.username,
      text: `Welcome ${newUser.username}`,
    });

    // Broadcast that a new user has joined the room

    socket.broadcast.to(newUser.room).emit('message', {
      userID: newUser.id,
      username: newUser.username,
      text: `${newUser.username} has joined the chat`,
    });
  });

  // User sends a message

  socket.on('chat', (text) => {
    // Gets the room user and the message sent

    const user = getUserID(socket.id);

    io.to(user.room).emit('message', {
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
