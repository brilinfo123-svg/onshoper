// pages/api/socket.js or lib/socket.js
import { Server } from 'socket.io';

let io;

export default function SocketHandler(req, res) {
  if (!io) {
    io = new Server(res.socket.server);
    res.socket.server.io = io;
    
    io.on('connection', (socket) => {
      console.log('Client connected');
      
      socket.on('join-user-room', (userId) => {
        socket.join(userId);
      });
      
      socket.on('disconnect', () => {
        console.log('Client disconnected');
      });
    });
  }
  res.end();
}