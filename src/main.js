const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const Logger = require('./utils/logger');

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
            title: 'Hastane Yönetim Sistemi Yardımcı Aracı',
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
                webviewTag: true,
                allowRunningInsecureContent: true,
                webSecurity: false,
                // Normal tarayıcı gibi davran
                partition: 'persist:hospital'
            }
        });

        const indexPath = path.join(__dirname, '..', 'index.html');
        mainWindow.loadFile(indexPath);

        logger.success('Pencere başarıyla oluşturuldu');

        // Development modda DevTools aç
        if (process.env.NODE_ENV === 'development') {
            mainWindow.webContents.openDevTools();
        }

        mainWindow.on('closed', () => {
            logger.info('Pencere kapatıldı');
            mainWindow = null;
        });

        // Window events
        mainWindow.on('ready-to-show', () => {
            logger.info('Pencere gösterime hazır');
        });

    } catch (error) {
        logger.error('Pencere oluşturma hatası', error);
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
        logger.error('CSV kaydetme hatası', error);
        return {
            success: false,
            error: error.message
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
        logger.error('CSV kaydetme IPC hatası', error);
        event.reply('save-csv-reply', {
            success: false,
            error: error.message
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
        logger.error('Tablo sayısı sorgulama hatası', error);
    }
});

// Hata logları
ipcMain.on('log-error', (event, data) => {
    try {
        logger.error('Renderer hatası', new Error(data.message), data);
    } catch (error) {
        console.error('Log error handler failed:', error);
    }
});

ipcMain.on('log-info', (event, message) => {
    try {
        logger.info(`Renderer: ${message}`);
    } catch (error) {
        console.error('Log info handler failed:', error);
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
