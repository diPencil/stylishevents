import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const { default: app } = await import('./server.js');

const port = Number(process.env.PORT || 3000);
const host = process.env.HOST || '0.0.0.0';

app.listen(port, host, () => {
  console.log(`Stylish Events Backend Started
Server URL: http://${host}:${port}
Environment: ${process.env.NODE_ENV || 'development'}`);
});
