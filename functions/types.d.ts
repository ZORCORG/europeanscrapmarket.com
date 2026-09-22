// Type declarations for Cloudflare platform modules not in @cloudflare/workers-types

declare module 'cloudflare:email' {
  export class EmailMessage {
    constructor(sender: string, recipient: string, rawMime: string);
  }
}

declare module 'cloudflare:sockets' {
  export interface Socket {
    readable: ReadableStream;
    writable: WritableStream;
    close(): void;
    opened: Promise<void>;
    closed: Promise<void>;
  }
  export function connect(address: string, options?: Record<string, unknown>): Socket;
}
