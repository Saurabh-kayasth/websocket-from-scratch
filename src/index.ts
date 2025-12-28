import type { IncomingMessage, ServerResponse } from 'http';
import http from 'http';
import type { Socket } from 'net';

import { PORT } from './constants';
import { handleWebSocketHandshake } from './utils';

const server = http.createServer(
  (req: IncomingMessage, res: ServerResponse) => {
    res.writeHead(426, { connection: 'close' });
    res.end('Need WebSocket Upgrade Request');
  },
);

server.on('upgrade', (req: IncomingMessage, socket: Socket) => {
  handleWebSocketHandshake(req, socket);

  socket.on('data', () => {
    try {
      // TODO: Parser
    } catch (e) {
      console.error(e);
    }
  });

  socket.on('error', (e: Error) => console.log(e));

  socket.on('end', () => console.log('Socket connection ended.'));
});

server.listen(PORT, () => {
  console.log(`Server is listening on PORT ${PORT}`);
});
