// Proxy Worker: routes europeanscrapmarket.com + www to the Pages deployment.
// wrangler auto-creates the DNS CNAME records when custom_domain = true.
export default {
  async fetch(request) {
    const url = new URL(request.url);
    url.protocol = 'https:';
    url.hostname = 'europeanscrapmarket.pages.dev';
    url.port = '';

    // Preserve method, headers, body
    const newReq = new Request(url, request);
    // Set forwarded host so Pages knows the original domain
    newReq.headers.set('x-forwarded-host', request.headers.get('host') || '');
    newReq.headers.set('x-forwarded-proto', 'https');

    return fetch(newReq);
  },
};
