"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config();
const app_1 = __importDefault(require("./app"));
const socket_io_1 = require("socket.io");
const server = app_1.default.listen(app_1.default.get('port'), () => {
    console.log('Server on port:', app_1.default.get('port'));
});
const io = new socket_io_1.Server(server);
