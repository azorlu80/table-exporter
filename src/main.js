const { app, BrowserWindow, ipcMain, dialog, Menu } = require('electron');
const path = require('path');
const fs = require('fs');
const ExcelJS = require('exceljs');
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

        // DevTools (F12 veya context menu ile açılabilir)
        // mainWindow.webContents.openDevTools();

        mainWindow.on('closed', () => {
            logger.info('Pencere kapatıldı');
            mainWindow = null;
        });

        // Window events
        mainWindow.on('ready-to-show', () => {
            logger.info('Pencere gösterime hazır');
        });

        // SSL certificate errors bypass (local servers için)
        mainWindow.webContents.on('certificate-error', (event, url, error, certificate, callback) => {
            event.preventDefault();
            callback(true); // Trust the certificate
            logger.warn(`SSL certificate error ignored for: ${url}`);
        });

        // Context menu (sağ tık) - tüm uygulama için
        mainWindow.webContents.on('context-menu', (event, params) => {
            const menu = Menu.buildFromTemplate([
                {
                    label: 'Kes',
                    role: 'cut',
                    enabled: params.editFlags.canCut
                },
                {
                    label: 'Kopyala',
                    role: 'copy',
                    enabled: params.editFlags.canCopy
                },
                {
                    label: 'Yapıştır',
                    role: 'paste',
                    enabled: params.editFlags.canPaste
                },
                { type: 'separator' },
                {
                    label: 'Tümünü Seç',
                    role: 'selectAll'
                },
                { type: 'separator' },
                {
                    label: 'DevTools',
                    click: () => {
                        mainWindow.webContents.toggleDevTools();
                    }
                }
            ]);

            menu.popup();
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
 * CSV/Excel dosyasını kaydet
 */
async function saveCSVFile(csv, filename) {
    try {
        logger.info(`Dosya kaydediliyor: ${filename}`);

        // Uzantısız dosya adı
        const baseName = filename.replace(/\.(csv|xlsx)$/i, '');

        const result = await dialog.showSaveDialog(mainWindow, {
            title: 'Excel veya CSV olarak kaydet',
            defaultPath: baseName,  // Uzantısız - filter otomatik ekleyecek
            filters: [
                { name: 'Excel Dosyası (.xlsx)', extensions: ['xlsx'] },
                { name: 'CSV Dosyası (.csv)', extensions: ['csv'] }
            ],
            properties: ['createDirectory', 'showOverwriteConfirmation']
        });

        if (result.canceled) {
            logger.warn('Kaydetme iptal edildi');
            return { success: false, canceled: true };
        }

        if (!result.filePath) {
            throw new Error('Dosya yolu alınamadı');
        }

        let finalPath = result.filePath;
        let ext = path.extname(finalPath).toLowerCase();

        // Uzantı kontrolü ve ekleme
        if (!ext || (ext !== '.xlsx' && ext !== '.csv')) {
            // Varsayılan olarak xlsx ekle
            finalPath = finalPath + '.xlsx';
            ext = '.xlsx';
            logger.info(`Varsayılan uzantı eklendi: .xlsx`);
        }

        if (ext === '.xlsx') {
            // Excel export
            await saveAsExcel(csv, finalPath);
        } else {
            // CSV export (default)
            const BOM = '\ufeff';
            const content = BOM + csv;
            fs.writeFileSync(finalPath, content, 'utf8');
        }

        const stats = fs.statSync(finalPath);

        logger.success(`Dosya başarıyla kaydedildi: ${finalPath} (${stats.size} bytes)`);

        return {
            success: true,
            path: finalPath,
            size: stats.size,
            format: ext === '.xlsx' ? 'Excel' : 'CSV'
        };

    } catch (error) {
        console.error('❌ FILE SAVE ERROR:', {
            errorMessage: error.message,
            errorCode: error.code,
            stack: error.stack?.split('\n')[0],
            filename,
            csvLength: csv ? csv.length : 0
        });

        logger.error('Dosya kaydetme hatası', error, {
            filename,
            csvLength: csv ? csv.length : 0,
            operation: 'saveCSVFile'
        });

        return {
            success: false,
            error: error.message || 'Dosya kaydedilemedi'
        };
    }
}

/**
 * Excel dosyası oluştur
 */
async function saveAsExcel(csv, filePath) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet1');

    // DEBUG: CSV preview
    logger.info('CSV ilk 500 karakter:', csv.substring(0, 500));

    // CSV'yi parse et
    const rows = csv.split('\n').map(row => {
        // CSV escaping'i handle et
        const cells = [];
        let currentCell = '';
        let insideQuotes = false;

        for (let i = 0; i < row.length; i++) {
            const char = row[i];

            if (char === '"') {
                if (insideQuotes && row[i + 1] === '"') {
                    currentCell += '"';
                    i++;
                } else {
                    insideQuotes = !insideQuotes;
                }
            } else if (char === ',' && !insideQuotes) {
                cells.push(currentCell);
                currentCell = '';
            } else {
                currentCell += char;
            }
        }
        cells.push(currentCell);
        return cells;
    });

    // Border style (kenarlık)
    const borderStyle = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
    };

    // Header row (bold + kenarlık)
    if (rows.length > 0) {
        const headerRow = worksheet.addRow(rows[0]);
        headerRow.font = { bold: true };
        headerRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E0E0' }
        };
        // Header'a kenarlık ekle
        headerRow.eachCell(cell => {
            cell.border = borderStyle;
        });
    }

    // Data rows (kenarlıkla)
    for (let i = 1; i < rows.length; i++) {
        const dataRow = worksheet.addRow(rows[i]);
        // Her hücreye kenarlık ekle
        dataRow.eachCell(cell => {
            cell.border = borderStyle;
        });
    }

    // Auto-fit columns
    worksheet.columns.forEach(column => {
        let maxLength = 0;
        column.eachCell({ includeEmpty: true }, cell => {
            const cellLength = cell.value ? cell.value.toString().length : 0;
            if (cellLength > maxLength) {
                maxLength = cellLength;
            }
        });
        column.width = Math.min(maxLength + 2, 50);
    });

    // Kaydet
    await workbook.xlsx.writeFile(filePath);
    logger.info(`Excel dosyası oluşturuldu: ${filePath}`);
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
