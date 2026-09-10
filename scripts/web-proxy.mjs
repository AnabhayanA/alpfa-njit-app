import { spawn } from 'node:child_process';
import http from 'node:http';
import net from 'node:net';

const APP_PORT = 8081;
const PROXY_PORT = 3000;
const CALENDAR_URL = 'https://calendar.google.com/calendar/ical/alpfanjit%40gmail.com/public/basic.ics';

function getBufferedResponseHeaders(headers) {
  return Object.fromEntries(
    [...headers].filter(([name]) => !['content-encoding', 'content-length', 'transfer-encoding'].includes(name)),
  );
}

let expo;

function isPortOpen(port) {
  return new Promise((resolve) => {
    const socket = net.createConnection({ port, host: 'localhost' });
    socket.once('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.once('error', () => resolve(false));
  });
}

const proxy = http.createServer(async (request, response) => {
  try {
    if (request.url === '/api/calendar') {
      const calendarResponse = await fetch(CALENDAR_URL);
      response.writeHead(calendarResponse.status, {
        'Content-Type': calendarResponse.headers.get('content-type') || 'text/calendar',
        'Cache-Control': 'no-store',
        'Access-Control-Allow-Origin': '*',
      });
      response.end(Buffer.from(await calendarResponse.arrayBuffer()));
      return;
    }

    const targetUrl = `http://localhost:${APP_PORT}${request.url}`;
    const appResponse = await fetch(targetUrl, {
      headers: request.headers,
    });
    response.writeHead(appResponse.status, getBufferedResponseHeaders(appResponse.headers));
    response.end(Buffer.from(await appResponse.arrayBuffer()));
  } catch (error) {
    console.error('Web proxy request failed:', error);
    if (!response.headersSent) {
      response.writeHead(502, { 'Content-Type': 'text/plain' });
      response.end('Local web proxy could not reach the Expo server.');
    }
  }
});

async function start() {
  if (await isPortOpen(APP_PORT)) {
    console.log(`Using the Expo web server already running on port ${APP_PORT}.`);
  } else {
    const command = process.platform === 'win32' ? 'cmd.exe' : 'npx';
    const args = process.platform === 'win32'
      ? ['/d', '/s', '/c', 'npx expo start --web --port 8081']
      : ['expo', 'start', '--web', '--port', String(APP_PORT)];
    expo = spawn(command, args, {
      cwd: process.cwd(),
      env: process.env,
      stdio: 'inherit',
    });
    expo.on('exit', (code) => {
      proxy.close();
      process.exit(code ?? 0);
    });
  }

  proxy.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.log(`Web proxy is already running at http://localhost:${PROXY_PORT}.`);
      return;
    }
    throw error;
  });
  proxy.listen(PROXY_PORT, () => {
    console.log(`Web app available at http://localhost:${PROXY_PORT}`);
  });
}

start();

function shutdown() {
  proxy.close();
  expo?.kill();
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
