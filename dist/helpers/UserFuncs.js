"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usersList = exports.userDisconnect = exports.getUserID = exports.joinUser = void 0;
const usersList = [];
exports.usersList = usersList;
const joinUser = (id, username, room, pubkey) => {
    const newUser = { id, username, room, pubkey };
    usersList.push(newUser);
    console.log('A new user has been added');
    console.log(`There are: ${usersList.length} users connected`);
    return newUser;
};
exports.joinUser = joinUser;
const getUserID = (id) => {
    return usersList.find((user) => user.id === id);
};
exports.getUserID = getUserID;
const userDisconnect = (id) => {
    const index = usersList.findIndex((user) => user.id === id);
    if (index !== -1) {
        return usersList.splice(index, 1)[0];
    }
};
exports.userDisconnect = userDisconnect;
