const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const Logger = require('./utils/logger');
const { t, getCurrentLanguage } = require('./utils/i18n');

const logger = new Logger('Main');
let mainWindow;

/**
 * Ana pencereyi oluştur
 */
function createWindow() {
    try {
        logger.info('Uygulama penceresi oluşturuluyor...');

        mainWindow = new BrowserWindow({
            width: 1400,
            height: 900,
            minWidth: 1000,
            minHeight: 600,
            title: t('app.title'),
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
                webviewTag: true,
                allowRunningInsecureContent: true,
                webSecurity: false,
                // Normal tarayıcı gibi davran
                partition: 'persist:table-exporter'
            }
        });

        const indexPath = path.join(__dirname, '..', 'index.html');
        mainWindow.loadFile(indexPath);

        logger.success('Pencere başarıyla oluşturuldu');

        // ZORUNLU: DevTools aç (Debug için)
        mainWindow.webContents.openDevTools();

        mainWindow.on('closed', () => {
            logger.info('Pencere kapatıldı');
            mainWindow = null;
        });

        // Window events
        mainWindow.on('ready-to-show', () => {
            logger.info('Pencere gösterime hazır');
        });

    } catch (error) {
        console.error('❌ WINDOW CREATION ERROR:', {
            errorMessage: error.message,
            errorCode: error.code,
            stack: error.stack?.split('\n')[0],
            indexPath: path.join(__dirname, '..', 'index.html')
        });

        logger.error('Pencere oluşturma hatası', error, {
            indexPath: path.join(__dirname, '..', 'index.html'),
            platform: process.platform
        });
        throw error;
    }
}

/**
 * CSV dosyasını kaydet
 */
async function saveCSVFile(csv, filename) {
    try {
        logger.info(`CSV kaydediliyor: ${filename}`);

        const result = await dialog.showSaveDialog(mainWindow, {
            title: 'CSV Dosyasını Kaydet',
            defaultPath: filename,
            filters: [
                { name: 'CSV Dosyası', extensions: ['csv'] },
                { name: 'Excel Dosyası', extensions: ['xls'] },
                { name: 'Tüm Dosyalar', extensions: ['*'] }
            ],
            properties: ['createDirectory']
        });

        if (result.canceled) {
            logger.warn('CSV kaydetme iptal edildi');
            return { success: false, canceled: true };
        }

        if (!result.filePath) {
            throw new Error('Dosya yolu alınamadı');
        }

        // UTF-8 BOM ekle (Excel için Türkçe karakter desteği)
        const BOM = '\ufeff';
        const content = BOM + csv;

        fs.writeFileSync(result.filePath, content, 'utf8');

        const stats = fs.statSync(result.filePath);

        logger.success(`CSV başarıyla kaydedildi: ${result.filePath} (${stats.size} bytes)`);

        return {
            success: true,
            path: result.filePath,
            size: stats.size
        };

    } catch (error) {
        console.error('❌ CSV SAVE ERROR:', {
            errorMessage: error.message,
            errorCode: error.code,
            stack: error.stack?.split('\n')[0],
            filename,
            csvLength: csv ? csv.length : 0
        });

        logger.error('CSV kaydetme hatası', error, {
            filename,
            csvLength: csv ? csv.length : 0,
            operation: 'saveCSVFile'
        });

        return {
            success: false,
            error: error.message || 'CSV dosyası kaydedilemedi'
        };
    }
}

/**
 * App lifecycle events
 */
app.whenReady().then(() => {
    logger.info('Electron app hazır');

    try {
        createWindow();
    } catch (error) {
        logger.error('Pencere oluşturma başarısız', error);
        app.quit();
    }

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            logger.info('Yeni pencere oluşturuluyor (activate)');
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    logger.info('Tüm pencereler kapatıldı');

    if (process.platform !== 'darwin') {
        logger.info('Uygulama sonlandırılıyor');
        app.quit();
    }
});

app.on('before-quit', () => {
    logger.info('Uygulama kapatılıyor');
});

/**
 * IPC Event Handlers
 */

// CSV kaydetme
ipcMain.on('save-csv', async (event, data) => {
    try {
        logger.info('CSV kaydetme isteği alındı');
        logger.debug('CSV verisi:', {
            filename: data.filename,
            csvLength: data.csv ? data.csv.length : 0
        });

        const { csv, filename } = data;

        if (!csv || !filename) {
            throw new Error('CSV verisi veya dosya adı eksik');
        }

        const result = await saveCSVFile(csv, filename);

        event.reply('save-csv-reply', result);

    } catch (error) {
        console.error('❌ IPC SAVE-CSV ERROR:', {
            errorMessage: error.message,
            errorCode: error.code,
            stack: error.stack?.split('\n')[0],
            hasData: !!data,
            filename: data?.filename,
            csvLength: data?.csv?.length || 0
        });

        logger.error('CSV kaydetme IPC hatası', error, {
            hasData: !!data,
            filename: data?.filename,
            csvLength: data?.csv?.length || 0,
            operation: 'ipc-save-csv'
        });

        event.reply('save-csv-reply', {
            success: false,
            error: error.message || 'CSV kaydetme işlemi başarısız oldu'
        });
    }
});

// Tablo sayısı sorgulama
ipcMain.on('get-table-count', (event) => {
    try {
        logger.debug('Tablo sayısı sorgulanıyor');
        // Bu bilgi renderer'dan gelecek, sadece log
        event.reply('get-table-count-reply', { received: true });
    } catch (error) {
        console.error('❌ GET TABLE COUNT ERROR:', {
            errorMessage: error.message,
            stack: error.stack?.split('\n')[0]
        });

        logger.error('Tablo sayısı sorgulama hatası', error, {
            operation: 'ipc-get-table-count'
        });
    }
});

// Hata logları
ipcMain.on('log-error', (_event, data) => {
    try {
        logger.error('Renderer hatası', new Error(data.message), data);
    } catch (error) {
        console.error('❌ LOG ERROR HANDLER FAILED:', {
            errorMessage: error.message,
            originalData: data
        });
    }
});

ipcMain.on('log-info', (_event, message) => {
    try {
        logger.info(`Renderer: ${message}`);
    } catch (error) {
        console.error('❌ LOG INFO HANDLER FAILED:', {
            errorMessage: error.message,
            originalMessage: message
        });
    }
});

// i18n - Get current language
ipcMain.on('get-language', (event) => {
    try {
        const language = getCurrentLanguage();
        logger.debug(`Language requested: ${language}`);
        event.reply('get-language-reply', { language });
    } catch (error) {
        console.error('❌ GET LANGUAGE ERROR:', {
            errorMessage: error.message,
            stack: error.stack?.split('\n')[0]
        });

        logger.error('Language request failed', error);
        event.reply('get-language-reply', { language: 'en' });
    }
});

// i18n - Get translation
ipcMain.on('get-translation', (event, key) => {
    try {
        const translation = t(key);
        event.reply('get-translation-reply', { key, translation });
    } catch (error) {
        console.error('❌ GET TRANSLATION ERROR:', {
            errorMessage: error.message,
            key,
            stack: error.stack?.split('\n')[0]
        });

        logger.error('Translation request failed', error, { key });
        event.reply('get-translation-reply', { key, translation: key });
    }
});

// Unhandled errors
process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception', error);
});

process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection', new Error(String(reason)), { promise });
});

logger.info('Main process başlatıldı');
