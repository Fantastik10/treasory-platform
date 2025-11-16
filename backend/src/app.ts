import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import bureauRoutes from './routes/bureauRoutes';
import espaceRoutes from './routes/espaceRoutes';
import messageRoutes from './routes/messageRoutes';
import notificationRoutes from './routes/notificationRoutes';
import { setupNotificationSocket } from './sockets/notificationSocket';
import accountRoutes from './routes/accountRoutes';
import transactionRoutes from './routes/transactionRoutes';
import financialRoutes from './routes/financialRoutes';
import syncRoutes from './routes/syncRoutes';
import bankConfigRoutes from './routes/bankConfigRoutes';
import analyticsRoutes from './routes/analyticsRoutes';

export const app = express();
export const server = createServer(app);
export const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middlewares
// app.use(cors());
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware JSON avec parsing strict désactivé
//app.use(express.json());
app.use(express.json({
  strict: false, // Accepte les JSON mal formattés
  verify: (req: any, res, buf) => {
    try {
      JSON.parse(buf.toString());
    } catch (e) {
      console.log('❌ JSON malformé reçu:', buf.toString());
      // On laisse passer quand même pour que le contrôleur gère l'erreur
    }
  }
}));

app.get('/api', (req, res) => {
  res.json({
    name: 'Trésorerie Platform API',
    version: '1.0.0',
    status: '✅ Online',
    author: 'Carry Kouadio',
    endpoints: {
      accounts: '/api/accounts',
      users: '/api/users',
      bureaux: '/api/bureaux',
      donors: '/api/donors',
      reminders: '/api/reminders'
    }
  });
});

// Middleware de logging pour debug
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.path}`);
  console.log('📦 Headers:', req.headers);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('📝 Body:', req.body);
  }
  next();
});



// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/bureaux', bureauRoutes);
app.use('/api/espaces', espaceRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/financial', financialRoutes);
app.use('/api/sync', syncRoutes);
app.use('/api/bank-config', bankConfigRoutes);
app.use('/api/analytics', analyticsRoutes);

// WebSockets
setupNotificationSocket(io);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Treasory API is running',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl 
  });
});