import { OP_CODES } from './constants';
import { markBits } from './utils';

type ParsedFrame = {
  fin: boolean;
  opcode: number;
  payload: Buffer;
};

export default class WebSocketFrameParser {
  private buffer = Buffer.alloc(0);

  parse(chunk: Buffer) {
    this.buffer = Buffer.concat([this.buffer, chunk]);

    let offset = 0;

    while (this.buffer.length - offset >= 2) {
      const b0 = this.buffer[offset];
      const b1 = this.buffer[offset + 1];
      const fin = markBits(b0, 0x80) !== 0;
      const opcode = markBits(b0, 0x0f);
      const masked = markBits(b1, 0x80) !== 0;
      let payloadLength = markBits(b1, 0x7f);

      let position = offset + 2;

      // 1. Handle Extended Payload Length (16-bit or 64-bit)
      if (payloadLength === 126) {
        if (this.buffer.length - position < 2) break;
        payloadLength = this.buffer.readUInt16BE(position);
        position += 2;
      } else if (payloadLength === 127) {
        if (this.buffer.length - position < 8) break;
        const hi = this.buffer.readUInt32BE(position);
        const lo = this.buffer.readUInt32BE(position + 4);
        position += 8;
        // TODO
        if (hi !== 0) throw new Error('Frame > 4GB not supported');
        // eslint-disable-next-line no-bitwise
        payloadLength = lo >>> 0;
      }

      // 2. Read Masking Key (4 bytes) - MANDATORY for client frames
      let maskKey;
      if (masked) {
        if (this.buffer.length - position < 4) break;
        maskKey = this.buffer.subarray(position, position + 4);
        position += 4;
      }

      // 3. Extract Payload
      if (this.buffer.length - position < payloadLength) break;
      let payload = this.buffer.subarray(position, position + payloadLength);

      // 4. Unmask Payload (MANDATORY)
      if (masked && maskKey) {
        const out = Buffer.allocUnsafe(payloadLength);
        for (let i = 0; i < payloadLength; i += 1) {
          // eslint-disable-next-line no-bitwise
          out[i] = payload[i] ^ maskKey[i % 4];
        }
        payload = out;
      }

      // 5. Pass the parsed frame
      const frame = { fin, opcode, payload };
      WebSocketFrameParser.onFrame(frame);

      // 6. Advance the offset to the next frame
      offset = position + payloadLength;
    }
  }

  private static onFrame(frame: ParsedFrame) {
    const { opcode, payload, fin } = frame;

    switch (opcode) {
      case OP_CODES.TEXT: {
        if (!fin) break;
        const text = payload.toString('utf8');
        console.log('Text:', text);
        break;
      }
      case OP_CODES.BIN: {
        break;
      }
      case OP_CODES.PING: {
        break;
      }
      case OP_CODES.PONG: {
        break;
      }
      case OP_CODES.CONT: {
        break;
      }
      case OP_CODES.CLOSE: {
        break;
      }
      default:
        console.log('Wrong opcode');
    }
  }
}
