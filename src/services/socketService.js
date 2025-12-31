import { io } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const SOCKET_URL = API_URL.replace(/\/api\/?$/, '');

class SocketService {
  constructor() {
    this.socket = null;
    this.pendingListeners = [];
  }

  connect(userData) {
    if (this.socket && this.socket.connected) return;

    if (!this.socket) {
      this.socket = io(SOCKET_URL);
    } else {
      this.socket.connect();
    }

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket.id);

      // Join Admin Room - FORCE role to 'admin' as this is the Admin Panel
      const adminJoinPayload = {
        role: 'admin',
        adminId: userData.id || userData._id || 'admin_placeholder_id'
      };
      console.log('🔗 [SocketService] Connected. Emitting join-room:', adminJoinPayload);
      this.socket.emit('join-room', adminJoinPayload);

      // Attach pending listeners
      this.pendingListeners.forEach(({ eventName, callback }) => {
        this.socket.on(eventName, callback);
      });
      this.pendingListeners = [];
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  on(eventName, callback) {
    if (this.socket) {
      this.socket.on(eventName, callback);
    } else {
      this.pendingListeners.push({ eventName, callback });
    }
  }

  off(eventName, callback) {
    if (this.socket) {
      this.socket.off(eventName, callback);
    }
    // Also remove from pending if present
    this.pendingListeners = this.pendingListeners.filter(
      l => l.eventName !== eventName || l.callback !== callback
    );
  }
}

export const socketService = new SocketService();
