import { Server } from 'socket.io';
import { verifyToken } from '../utils/jwt';

export const setupNotificationSocket = (io: Server) => {
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (token) {
        const decoded = verifyToken(token);
        (socket as any).user = decoded;
        next();
      } else {
        next(new Error('Authentication error'));
      }
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log('User connected:', (socket as any).user.email);

    // Rejoindre les rooms des bureaux de l'utilisateur
    socket.on('join-bureau', (bureauId: string) => {
      socket.join(`bureau-${bureauId}`);
      console.log(`User joined bureau: ${bureauId}`);
    });

    // Quitter une room bureau
    socket.on('leave-bureau', (bureauId: string) => {
      socket.leave(`bureau-${bureauId}`);
      console.log(`User left bureau: ${bureauId}`);
    });

    // Écouter les nouveaux messages
    socket.on('new-message', (data: { bureauId: string; message: any }) => {
      socket.to(`bureau-${data.bureauId}`).emit('message-received', data.message);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', (socket as any).user.email);
    });
  });
};