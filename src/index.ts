require('dotenv').config();
import app from './app';
import { Server, Socket } from 'socket.io';

const server = app.listen(app.get('port'), () => {
  console.log('Server on port:', app.get('port'));
});
const io = new Server(server);
