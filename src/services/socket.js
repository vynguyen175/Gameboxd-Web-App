import { io } from 'socket.io-client';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';
let socket = null;

export const connectSocket = () => {
  const token = localStorage.getItem('gameboxd_token');
  if (!token || socket?.connected) return;

  socket = io(API_BASE_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
  });

  socket.on('connect', () => console.log('Socket connected'));
  socket.on('connect_error', (err) => console.error('Socket error:', err.message));
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => socket;
const socketService = { connectSocket, disconnectSocket, getSocket };
export default socketService;
