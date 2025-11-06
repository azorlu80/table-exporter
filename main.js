const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        icon: path.join(__dirname, 'icon.png'),
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            webviewTag: true,
            allowRunningInsecureContent: true
        }
    });

    mainWindow.loadFile('index.html');

    // Development için console açık
    // mainWindow.webContents.openDevTools();

    mainWindow.on('closed', function () {
        mainWindow = null;
    });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// CSV kaydetme
ipcMain.on('save-csv', (event, data) => {
    const { csv, filename } = data;

    dialog.showSaveDialog(mainWindow, {
        title: 'CSV Dosyasını Kaydet',
        defaultPath: filename,
        filters: [
            { name: 'CSV Dosyası', extensions: ['csv'] },
            { name: 'Tüm Dosyalar', extensions: ['*'] }
        ]
    }).then(result => {
        if (!result.canceled && result.filePath) {
            // UTF-8 BOM ekle (Excel için Türkçe karakter desteği)
            const BOM = '\ufeff';
            fs.writeFileSync(result.filePath, BOM + csv, 'utf8');

            event.reply('save-csv-reply', {
                success: true,
                path: result.filePath
            });
        } else {
            event.reply('save-csv-reply', {
                success: false
            });
        }
    }).catch(err => {
        console.error(err);
        event.reply('save-csv-reply', {
            success: false,
            error: err.message
        });
    });
});
