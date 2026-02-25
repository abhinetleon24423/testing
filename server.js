require('dotenv').config();
const express = require('express');
const path = require('path');

const Log = require('./app/Helpers/Log');

process.env.TZ = process.env.APP_TIMEZONE || 'Asia/Kolkata';

process.on('uncaughtException', (err) => {
  Log.error(err, { type: 'uncaughtException' }, () => {
    console.error(err);
    process.exit(1);
  });
});

process.on('unhandledRejection', (reason, promise) => {
  const msg = reason instanceof Error ? reason : String(reason);
  const ctx = reason instanceof Error ? { stack: reason.stack, type: 'unhandledRejection' } : { type: 'unhandledRejection' };
  Log.error(msg, ctx);
  console.warn('Unhandled rejection logged to storage/logs');
});

const { connectDB } = require('./database/connection');
const webRoutes = require('./routes/web');
const helper = require('./app/Helpers/helper');

connectDB();

const server = express();

server.set('view engine', 'ejs');
server.set('views', path.join(__dirname, 'views'));
server.use(express.json());
server.use(express.urlencoded({ extended: true }));
server.use(express.static(path.join(__dirname, 'public')));

server.use(webRoutes);

// 404 – no route matched: return HTML for browser, JSON for API
server.use((req, res) => {
  const accept = (req.get('Accept') || '').toLowerCase();
  if (accept.includes('application/json')) {
    return helper.apiResponse(res, false, 'Not found', [], 404);
  }
  res.status(404).render('pages/404', { title: 'Page not found' });
});

const PORT = process.env.PORT || 3000;
const APP_NAME = process.env.APP_NAME || 'Project';

server.listen(PORT, () => {
  console.log(`${APP_NAME} running on http://localhost:${PORT}`);
});

module.exports = server;
