import crypto from 'crypto';
import type { IncomingMessage } from 'http';
import type { Socket } from 'net';

import { WS_GUID } from './constants';

const handleWebSocketHandshake = (req: IncomingMessage, socket: Socket) => {
  const {
    upgrade,
    connection,
    'sec-websocket-version': secWebSocketVersion,
    'sec-websocket-key': secWebSocketKey,
  } = req.headers;

  const isWebSocketConnection =
    upgrade?.toLowerCase() === 'websocket' &&
    secWebSocketVersion === '13' &&
    connection?.toLowerCase().includes('upgrade') &&
    secWebSocketKey?.length !== 0;

  if (!isWebSocketConnection) {
    socket.write('HTTP/1.1 400 Bad Request\r\nConnection: close\r\n\r\n');
    socket.destroy();
    return;
  }

  const acceptKey = crypto
    .createHash('sha1')
    .update(`${secWebSocketKey}${WS_GUID}`)
    .digest('base64');

  const response = [
    'HTTP/1.1 101 Switching Protocols',
    'Upgrade: websocket',
    'Connection: Upgrade',
    `Sec-WebSocket-Accept: ${acceptKey}`,
    '\r\n',
  ].join('\r\n');

  socket.write(response);
  socket.setNoDelay(true);
};

export { handleWebSocketHandshake };
