# CORS on the API server (103.20.90.115)

**Development:** The React app uses a proxy (`package.json` → `"proxy": "http://103.20.90.115"`). Requests from the dev server go to `/api/message` (same origin), then the proxy forwards to the API. No CORS change needed for local dev.

**Production:** If the frontend is served from a different origin (e.g. another domain), the API at `http://103.20.90.115` must send CORS headers. Add the following on that server.

## Allow CORS from all origins

### Express (Node.js)

```bash
npm install cors
```

```javascript
const express = require('express');
const cors = require('cors');
const app = express();

// Allow all origins
app.use(cors());

// Or explicitly allow all:
// app.use(cors({ origin: true }));  // reflect request origin
// app.use(cors({ origin: '*' }));    // allow any origin (no credentials)
```

### Fastify (Node.js)

```bash
npm install @fastify/cors
```

```javascript
const fastify = require('fastify')({ logger: true });
fastify.register(require('@fastify/cors'), { origin: true });
```

### Raw Node.js / custom middleware

Send these response headers before the body:

- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods: GET, POST, OPTIONS`
- `Access-Control-Allow-Headers: Content-Type, Accept`

Handle `OPTIONS` (preflight) with status 204 and the same headers.

---

After changing the server, restart it. The React app in development already avoids CORS by using the proxy; production builds need the server to allow the frontend’s origin (or `*`).
