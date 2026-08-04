const http = require('node:http');

const port = Number(process.env.PORT || 3000);
const host = '0.0.0.0';

let requestHandler = (req, res) => {
  const isHealthCheck = req.url === '/health';

  res.statusCode = isHealthCheck ? 200 : 503;
  res.setHeader('content-type', 'application/json; charset=utf-8');
  res.end(JSON.stringify({
    status: isHealthCheck ? 'starting' : 'service_starting',
  }));
};

const server = http.createServer((req, res) => {
  requestHandler(req, res);
});

server.listen(port, host, () => {
  console.log(`Bootstrap HTTP listener active on ${host}:${port}`);

  import('./src/server.js')
    .then(({ default: app, runPostListenChecks }) => {
      requestHandler = app;
      console.log('Express application loaded');
      void runPostListenChecks();
    })
    .catch((error) => {
      const code = typeof error?.code === 'string'
        ? error.code
        : 'APPLICATION_IMPORT_FAILED';

      console.error(`Express application failed to load (${code}).`);
      process.exitCode = 1;
    });
});

server.once('error', (error) => {
  const code = typeof error?.code === 'string'
    ? error.code
    : 'BOOTSTRAP_LISTENER_FAILED';

  console.error(`Bootstrap listener failed (${code}).`);
  process.exit(1);
});
