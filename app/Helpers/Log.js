const fs = require('fs');
const path = require('path');

const STORAGE_LOGS = path.join(process.cwd(), 'storage', 'logs');

function ensureLogDir() {
  if (!fs.existsSync(STORAGE_LOGS)) {
    fs.mkdirSync(STORAGE_LOGS, { recursive: true });
  }
}

function getLogFile() {
  ensureLogDir();
  const useDaily = process.env.LOG_DAILY !== 'false';
  const name = useDaily
    ? `node-${new Date().toISOString().slice(0, 10)}.log`
    : 'node.log';
  return path.join(STORAGE_LOGS, name);
}

function formatTimestamp() {
  const d = new Date();
  const date = d.toISOString().slice(0, 10); // 2026-02-25
  const time = d.toTimeString().slice(0, 8); // 09:56:09
  return `${date} ${time}`;
}

function formatMessage(level, message, context = {}) {
  const time = formatTimestamp();
  const ctx = Object.keys(context).length ? ' ' + JSON.stringify(context) : '';
  return `[${time}] ${level.toUpperCase()}: ${message}${ctx}\n`;
}

function write(level, message, context = {}, done = null) {
  const file = getLogFile();
  const line = formatMessage(level, message, context);
  fs.appendFile(file, line, 'utf8', (err) => {
    if (err) console.error('Log write failed:', err);
    if (typeof done === 'function') done();
  });
}

const Log = {
  info(message, context = {}) {
    write('info', message, context);
  },

  error(message, context = {}, done = null) {
    if (message instanceof Error) {
      context = { ...context, stack: message.stack };
      message = message.message;
    }
    write('error', message, context, done);
  },

  warning(message, context = {}) {
    write('warning', message, context);
  },

  debug(message, context = {}) {
    if (process.env.NODE_ENV === 'production') return;
    write('debug', message, context);
  },
};

module.exports = Log;
