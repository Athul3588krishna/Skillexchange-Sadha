const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const seedDB = require('./config/seed');

// Load environment variables
dotenv.config();

// Connect to Database
connectDB().then(() => {
  // Seed initial data
  seedDB();
});

const app = express();

// Middleware
app.use(cors({
  origin: '*', // Allow any origin for testing convenience
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Mount Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/sessions', require('./routes/sessionRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/exchanges', require('./routes/exchangeRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Root endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Skill Exchange Platform API' });
});

// Global error handler
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    success: false,
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
});

const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
  }
});

// Attach socket io instance to req
app.use((req, res, next) => {
  req.io = io;
  next();
});

io.on('connection', (socket) => {
  // User registers their room
  socket.on('join_user', (userId) => {
    if (userId) {
      socket.join(`user_${userId}`);
    }
  });

  // Join chat room between student and mentor
  socket.on('join_chat', (chatId) => {
    if (chatId) {
      socket.join(`chat_${chatId}`);
    }
  });

  // Live messaging
  socket.on('send_message', (data) => {
    // Broadcast message to everyone in the chat room
    io.to(`chat_${data.chatId}`).emit('receive_message', data);
    // Also notify recipient if online
    if (data.receiverId) {
      io.to(`user_${data.receiverId}`).emit('new_chat_notification', data);
    }
  });

  socket.on('disconnect', () => {
    // handle disconnect if needed
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running with Socket.io on port ${PORT}`);
});
