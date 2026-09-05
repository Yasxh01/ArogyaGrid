const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { PORT, NODE_ENV } = require('./config/env');
const db = require('./config/db');
const { seedDatabase } = require('./db/seed');
const { setSocketIO } = require('./services/socketService');
const apiRoutes = require('./routes/api');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});
setSocketIO(io);

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api/v1', apiRoutes);

app.get('/', (req, res) => {
  res.json({
    name: 'ArogyaGrid Core Backend',
    version: '1.0.0',
    docs: '/api/v1/health',
    status: 'ONLINE'
  });
});

app.use(errorHandler);

async function startServer() {
  await db.initialize();
  await seedDatabase();

  return new Promise((resolve) => {
    server.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(` ArogyaGrid Backend Server listening on port ${PORT}`);
      console.log(` Environment: ${NODE_ENV}`);
      console.log(` REST Gateway: http://localhost:${PORT}/api/v1`);
      console.log(` Real-Time WebSocket Gateway attached.`);
      console.log(`====================================================`);
      resolve(server);
    });
  });
}

if (require.main === module) {
  startServer();
}

module.exports = { app, server, startServer };
