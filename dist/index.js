"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config();
const app_1 = __importDefault(require("./app"));
const https_1 = __importDefault(require("https"));
const socket_io_1 = require("socket.io");
const fs_1 = __importDefault(require("fs"));
const UserFuncs_1 = require("./helpers/UserFuncs");
const secureServer = https_1.default
    .createServer({
    cert: fs_1.default.readFileSync('./cert/server.crt'),
    key: fs_1.default.readFileSync('./cert/server.key'),
}, app_1.default)
    .listen(app_1.default.get('port'), () => {
    console.log('Server running on SSL/TLS serving on port: ', app_1.default.get('port'));
});
/* const server = app.listen(app.get('port'), () => {
  console.log('Server on port:', app.get('port'));
});
 */
//const io = new Server(server);
const io = new socket_io_1.Server(secureServer);
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
        // Get publickey
        const pubkeysArray = UserFuncs_1.usersList.map((user) => {
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
        const user = (0, UserFuncs_1.getUserID)(socket.id);
        socket.broadcast.to(user.room).emit('chat:message', {
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
