"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config();
const app_1 = __importDefault(require("./app"));
const socket_io_1 = require("socket.io");
const UserFuncs_1 = require("./helpers/UserFuncs");
const server = app_1.default.listen(app_1.default.get('port'), () => {
    console.log('Server on port:', app_1.default.get('port'));
});
const io = new socket_io_1.Server(server);
// Initializing the socket io connection
io.on('connection', (socket) => {
    // For a new user joining the room
    socket.on('joinRoom', ({ username, roomname, pubkey }) => {
        // New user creation
        const newUser = (0, UserFuncs_1.joinUser)(socket.id, username, roomname, pubkey);
        console.log('New Connection!', socket.id);
        socket.join(newUser.room);
        // Show welcome message
        socket.emit('joinRoom:welcome', {
            userID: newUser.id,
            username: newUser.username,
            text: `Welcome ${newUser.username}`,
        });
        const pubkeysArray = UserFuncs_1.usersList.map((user) => {
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
        const user = (0, UserFuncs_1.getUserID)(socket.id);
        io.to(user.room).emit('chat:message', {
            userID: user.id,
            username: user.username,
            text: text,
        });
    });
    // User disconnection
    socket.on('disconnect', () => {
        // User is deleted from the list
        const user = (0, UserFuncs_1.userDisconnect)(socket.id);
        if (user) {
            io.to(user.room).emit('message', {
                userID: user.id,
                username: user.username,
                text: `${user.username} has left the chat`,
            });
        }
    });
});
