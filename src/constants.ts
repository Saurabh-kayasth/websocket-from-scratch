const OP_CODES = {
  // data frames
  CONT: 0x0, // for fragmented messages
  TEXT: 0x1, // contains UTF-8 encoded data
  BIN: 0x2, // contains binary frame
  // control frames
  CLOSE: 0x8, // to close websocket connection
  PING: 0x9, // to check connection alive
  PONG: 0xa, // to respond to ping
};

const WS_GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';

const PORT = 5000;

export { OP_CODES, PORT, WS_GUID };
