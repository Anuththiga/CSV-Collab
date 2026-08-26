import express from 'express';
import cors from 'cors';
import router from './routes/index.js';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();

const corsOptions: cors.CorsOptions = {
  origin: 'http://localhost:5173',
};

app.use(cors(corsOptions));

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use('/api', router);

const PORT = Number(process.env.PORT) || 8080;

const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
  },
});

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});