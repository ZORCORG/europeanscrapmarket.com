// Type declarations for Cloudflare platform modules

declare module 'cloudflare:email' {
  export class EmailMessage {
    constructor(sender: string, recipient: string, rawMime: string);
  }
}
