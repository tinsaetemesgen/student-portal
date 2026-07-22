// socket/socket.js - Socket.io configuration
const Message = require('../models/Message');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Store connected users { userId: socketId }
const connectedUsers = {};

const initializeSocket = (io) => {
  // Socket middleware: Authenticate user
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.user.id;
      socket.userRole = decoded.user.role;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`✅ User connected: ${socket.userId}`);

    // Store user connection
    connectedUsers[socket.userId] = socket.id;
    io.emit('users:online', Object.keys(connectedUsers));

    // ============================================
    // 📌 SEND MESSAGE
    // ============================================
    socket.on('message:send', async (data) => {
      try {
        const { receiverId, content } = data;

        // Validate receiver exists
        const receiver = await User.findById(receiverId);
        if (!receiver) {
          socket.emit('message:error', { error: 'User not found' });
          return;
        }

        // Create and save message
        const message = new Message({
          senderId: socket.userId,
          receiverId,
          content,
        });
        await message.save();

        // Populate sender info
        const populatedMessage = await Message.findById(message._id)
          .populate('senderId', 'name email role')
          .populate('receiverId', 'name email role');

        // Emit to sender (confirmation)
        socket.emit('message:sent', populatedMessage);

        // Emit to receiver if online
        const receiverSocketId = connectedUsers[receiverId];
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('message:received', populatedMessage);
        }

        // Emit unread count update to receiver
        const unreadCount = await Message.countDocuments({
          receiverId,
          isRead: false,
        });
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('message:unread', { count: unreadCount });
        }
      } catch (error) {
        console.error(error);
        socket.emit('message:error', { error: 'Failed to send message' });
      }
    });

    // ============================================
    // 📌 MARK MESSAGES AS READ
    // ============================================
    socket.on('message:read', async (data) => {
      try {
        const { senderId } = data;
        await Message.updateMany(
          {
            senderId,
            receiverId: socket.userId,
            isRead: false,
          },
          {
            $set: { isRead: true, readAt: new Date() },
          }
        );

        const unreadCount = await Message.countDocuments({
          receiverId: socket.userId,
          isRead: false,
        });

        // Notify sender that messages were read
        const senderSocketId = connectedUsers[senderId];
        if (senderSocketId) {
          io.to(senderSocketId).emit('message:read', { userId: socket.userId });
        }

        // Update unread count
        socket.emit('message:unread', { count: unreadCount });
      } catch (error) {
        console.error(error);
      }
    });

    // ============================================
    // 📌 TYPING INDICATOR
    // ============================================
    socket.on('typing:start', (data) => {
      const { receiverId } = data;
      const receiverSocketId = connectedUsers[receiverId];
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('typing:start', {
          userId: socket.userId,
        });
      }
    });

    socket.on('typing:stop', (data) => {
      const { receiverId } = data;
      const receiverSocketId = connectedUsers[receiverId];
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('typing:stop', {
          userId: socket.userId,
        });
      }
    });

    // ============================================
    // 📌 DISCONNECT
    // ============================================
    socket.on('disconnect', () => {
      console.log(`❌ User disconnected: ${socket.userId}`);
      delete connectedUsers[socket.userId];
      io.emit('users:online', Object.keys(connectedUsers));
    });
  });

  return connectedUsers;
};

module.exports = { initializeSocket, connectedUsers };