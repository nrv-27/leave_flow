import jwt from 'jsonwebtoken';

export const initSocket = (io) => {
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication required'));
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;
      socket.role = decoded.role;
      socket.teamId = decoded.teamId;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.userId} (${socket.role})`);

    // Join personal room
    socket.join(`user:${socket.userId}`);

    // Join team room based on role
    if (socket.role === 'manager') {
      socket.join(`team:${socket.teamId}:manager`);
    } else {
      socket.join(`team:${socket.teamId}:employees`);
    }

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.userId}`);
    });
  });
};
