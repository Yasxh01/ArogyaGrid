let ioInstance = null;

function setSocketIO(io) {
  ioInstance = io;
  io.on('connection', (socket) => {
    console.log(`[Socket.io] Client connected: ${socket.id}`);
    
    socket.on('join:district', (districtId) => {
      socket.join(`district:${districtId}`);
      console.log(`[Socket.io] ${socket.id} joined district:${districtId}`);
    });

    socket.on('join:phc', (phcId) => {
      socket.join(`phc:${phcId}`);
      console.log(`[Socket.io] ${socket.id} joined phc:${phcId}`);
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.io] Client disconnected: ${socket.id}`);
    });
  });
}

function broadcastEvent(eventName, payload) {
  if (ioInstance) {
    ioInstance.emit(eventName, { ...payload, broadcast_at: new Date().toISOString() });
  }
}

function broadcastToDistrict(districtId, eventName, payload) {
  if (ioInstance) {
    ioInstance.to(`district:${districtId}`).emit(eventName, payload);
  }
}

module.exports = { setSocketIO, broadcastEvent, broadcastToDistrict };
