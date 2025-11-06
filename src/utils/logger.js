const log = require('electron-log');
const path = require('path');
const { app } = require('electron');

// Log seviyelerini ayarla
log.transports.file.level = 'info';
log.transports.console.level = 'debug';

// Log dosyası konumu
if (app) {
    const userDataPath = app.getPath('userData');
    log.transports.file.resolvePathFn = () => path.join(userDataPath, 'logs', 'app.log');
}

// Format
log.transports.file.format = '[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}] {text}';
log.transports.console.format = '[{h}:{i}:{s}] [{level}] {text}';

// Custom logger
class Logger {
    constructor(context = 'App') {
        this.context = context;
    }

    info(message, ...args) {
        log.info(`[${this.context}] ${message}`, ...args);
    }

    error(message, error, ...args) {
        if (error instanceof Error) {
            log.error(`[${this.context}] ${message}`, {
                message: error.message,
                stack: error.stack,
                ...args
            });
        } else {
            log.error(`[${this.context}] ${message}`, error, ...args);
        }
    }

    warn(message, ...args) {
        log.warn(`[${this.context}] ${message}`, ...args);
    }

    debug(message, ...args) {
        log.debug(`[${this.context}] ${message}`, ...args);
    }

    success(message, ...args) {
        log.info(`[${this.context}] ✅ ${message}`, ...args);
    }
}

module.exports = Logger;
