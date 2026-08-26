import { Server } from 'socket.io';

let io: Server;

export const setIO = (socketServer: Server): void => {
  io = socketServer;
};

export const getIO = (): Server => {
  if (!io) {
    throw new Error(
      'Socket.IO has not been initialized'
    );
  }

  return io;
};