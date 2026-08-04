import app, { runPostListenChecks } from './server.js';

console.log('Hostinger launcher loaded');

const port = Number(process.env.PORT || 3000);
const host = '0.0.0.0';

const server = app.listen(port, host);

server.once('listening', () => {
  console.log(`HTTP server listening on ${host}:${port}`);
  void runPostListenChecks();
});

server.once('error', (error) => {
  const code = typeof error?.code === 'string' ? error.code : 'HTTP_STARTUP_FAILED';
  console.error(`HTTP server startup failed (${code}).`);
  process.exit(1);
});
