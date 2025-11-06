const { ipcRenderer } = require('electron');
const { extractionScript } = require('./utils/tableExtractorAdvanced');

// Elements
const webview = document.getElementById('webview');
const urlInput = document.getElementById('urlInput');
const urlDisplay = document.getElementById('urlDisplay');
const statusText = document.getElementById('statusText');
const statusDot = document.getElementById('statusDot');
const exportBtn = document.getElementById('exportBtn');
const instructionsOverlay = document.getElementById('instructionsOverlay');
const tableModal = document.getElementById('tableModal');
const loadingOverlay = document.getElementById('loadingOverlay');
const loadingText = document.getElementById('loadingText');
const tableList = document.getElementById('tableList');

let currentTables = null;

// Webview User Agent (Normal Chrome tarayıcı gibi görün)
webview.addEventListener('dom-ready', () => {
    webview.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );
    logInfo('WebView User-Agent set to Chrome');
});

// Initial setup
setTimeout(() => {
    navigateToUrl();
}, 500);

// Webview event listeners
webview.addEventListener('did-start-loading', () => {
    setStatus('Yükleniyor...', 'loading');
    exportBtn.disabled = true;
});

webview.addEventListener('did-stop-loading', () => {
    setStatus('Hazır', 'ready');
    exportBtn.disabled = false;
});

webview.addEventListener('did-navigate', (e) => {
    urlInput.value = e.url;
    urlDisplay.textContent = e.url;
    logInfo(`Navigated to: ${e.url}`);
});

webview.addEventListener('did-navigate-in-page', (e) => {
    urlInput.value = e.url;
    urlDisplay.textContent = e.url;
});

webview.addEventListener('console-message', (e) => {
    console.log('WebView Console:', e.message);
});

// URL input Enter key
urlInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        navigateToUrl();
    }
});

// Functions
function navigateToUrl() {
    const url = urlInput.value.trim();
    if (url) {
        webview.src = url;
        setStatus('Yükleniyor...', 'loading');
        logInfo(`Navigating to: ${url}`);
    }
}

function goBack() {
    if (webview.canGoBack()) {
        webview.goBack();
    }
}

function goForward() {
    if (webview.canGoForward()) {
        webview.goForward();
    }
}

function reloadPage() {
    webview.reload();
}

function hideInstructions() {
    instructionsOverlay.classList.add('hidden');
}

function setStatus(text, type = 'ready') {
    statusText.textContent = text;
    statusDot.classList.remove('loading');
    if (type === 'loading') {
        statusDot.classList.add('loading');
    }
}

function showLoading(text = 'Tablolar aranıyor...') {
    loadingText.textContent = text;
    loadingOverlay.classList.remove('hidden');
}

function hideLoading() {
    loadingOverlay.classList.add('hidden');
}

function hideTableModal() {
    tableModal.classList.add('hidden');
    currentTables = null;
}

// Table selection
async function showTableSelection() {
    try {
        showLoading('Tablolar taranıyor...');
        exportBtn.disabled = true;
        setStatus('Tablolar aranıyor...', 'loading');

        logInfo('Starting table extraction...');

        // Execute extraction script
        const result = await webview.executeJavaScript(extractionScript);

        logInfo(`Extraction result: ${JSON.stringify({
            totalCount: result.totalCount,
            methods: result.methods
        })}`);

        hideLoading();

        if (result.totalCount === 0) {
            alert(
                '❌ Sayfada hiç tablo bulunamadı!\\n\\n' +
                'Lütfen:\\n' +
                '1. Tabloyu görüntülediğinizden emin olun\\n' +
                '2. Sayfa tamamen yüklenene kadar bekleyin\\n' +
                '3. Tekrar deneyin\\n\\n' +
                'Denenen yöntemler: ExtJS Grid, HTML Table, Div Grid'
            );
            setStatus('Tablo bulunamadı', 'ready');
            exportBtn.disabled = false;
            return;
        }

        // Tek tablo varsa doğrudan export et
        if (result.totalCount === 1) {
            const table = result.allTables[0];
            if (table.error) {
                alert(`❌ Hata: ${table.error}`);
                setStatus('Hata oluştu', 'ready');
                exportBtn.disabled = false;
                return;
            }

            logInfo(`Single table found, exporting directly...`);
            await exportTable(table);
            return;
        }

        // Çoklu tablo - seçim göster
        currentTables = result.allTables;
        displayTableList(result.allTables);
        tableModal.classList.remove('hidden');
        setStatus(`${result.totalCount} tablo bulundu`, 'ready');
        exportBtn.disabled = false;

    } catch (error) {
        hideLoading();

        // Detaylı error log (sizin için)
        console.error('❌ TABLE SELECTION ERROR:', {
            errorMessage: error.message,
            errorName: error.name,
            errorCode: error.code,
            stack: error.stack?.split('\n').slice(0, 3).join('\n'),
            pageUrl: webview.getURL(),
            timestamp: new Date().toISOString()
        });

        logError('Table selection error', error);

        // User-friendly message (kullanıcı için)
        alert(
            '❌ Tablo arama sırasında hata oluştu!\\n\\n' +
            'Lütfen:\\n' +
            '1. Sayfayı yenileyin (🔄 Yenile butonu)\\n' +
            '2. Tablonun tam yüklenmesini bekleyin\\n' +
            '3. Tekrar deneyin\\n\\n' +
            'Sorun devam ederse sistem yöneticisine bildirin.'
        );

        setStatus('Hata oluştu', 'ready');
        exportBtn.disabled = false;
    }
}

function displayTableList(tables) {
    tableList.innerHTML = '';

    tables.forEach((table, index) => {
        const item = document.createElement('div');
        item.className = 'table-item';
        item.onclick = () => selectTable(index);

        const badgeClass =
            table.type === 'extjs' ? 'badge-extjs' :
            table.type === 'html' ? 'badge-html' :
            'badge-div';

        const badgeText =
            table.type === 'extjs' ? 'ExtJS Grid' :
            table.type === 'html' ? 'HTML Table' :
            table.type === 'div' ? 'Div Grid' :
            'Manuel';

        item.innerHTML = `
            <div class="table-item-info">
                <div class="table-item-title">${table.title || 'Tablo ' + (index + 1)}</div>
                <div class="table-item-meta">
                    ${table.rowCount || 0} satır × ${table.columnCount || 0} sütun
                    ${table.preview ? ' • ' + table.preview : ''}
                </div>
            </div>
            <div class="table-item-badge ${badgeClass}">${badgeText}</div>
        `;

        tableList.appendChild(item);
    });
}

async function selectTable(index) {
    if (!currentTables || !currentTables[index]) {
        alert('❌ Tablo bulunamadı!');
        return;
    }

    const table = currentTables[index];
    hideTableModal();

    if (table.error) {
        alert(`❌ Bu tablo export edilemedi:\\n\\n${table.error}`);
        return;
    }

    await exportTable(table);
}

async function exportTable(table) {
    try {
        showLoading('CSV dosyası hazırlanıyor...');
        setStatus('Export ediliyor...', 'loading');

        logInfo(`Exporting table: ${table.title} (${table.rowCount} rows)`);

        // Dosya adı oluştur
        const now = new Date();
        const timestamp =
            now.getFullYear() + '-' +
            String(now.getMonth() + 1).padStart(2, '0') + '-' +
            String(now.getDate()).padStart(2, '0') + '_' +
            String(now.getHours()).padStart(2, '0') + '-' +
            String(now.getMinutes()).padStart(2, '0');

        const filename = `tablo_${timestamp}.csv`;

        // IPC ile main process'e gönder
        ipcRenderer.send('save-csv', {
            csv: table.csv,
            filename: filename
        });

        // Cevap dinle
        ipcRenderer.once('save-csv-reply', (_event, response) => {
            hideLoading();

            if (response.success) {
                const message =
                    `✅ Tablo başarıyla kaydedildi!\\n\\n` +
                    `📋 Tablo: ${table.title}\\n` +
                    `📊 Satır: ${table.rowCount}\\n` +
                    `📊 Sütun: ${table.columnCount}\\n` +
                    `💾 Dosya: ${response.size} bytes\\n\\n` +
                    `📂 Konum:\\n${response.path}\\n\\n` +
                    `💡 Excel ile açabilirsiniz!`;

                alert(message);
                setStatus('Export başarılı', 'ready');
                logInfo(`Export successful: ${response.path}`);
            } else if (response.canceled) {
                setStatus('Export iptal edildi', 'ready');
                logInfo('Export canceled by user');
            } else {
                alert(`❌ Kaydetme hatası:\\n\\n${response.error || 'Bilinmeyen hata'}`);
                setStatus('Hata oluştu', 'ready');
                logError('Save error', response.error);
            }
        });

    } catch (error) {
        hideLoading();

        // Detaylı error log (sizin için)
        console.error('❌ EXPORT ERROR:', {
            errorMessage: error.message,
            errorName: error.name,
            errorCode: error.code,
            stack: error.stack?.split('\n').slice(0, 3).join('\n'),
            tableTitle: table?.title,
            tableRows: table?.rowCount,
            tableCols: table?.columnCount,
            tableType: table?.type,
            csvLength: table?.csv?.length,
            timestamp: new Date().toISOString()
        });

        logError('Export error', error);

        // User-friendly message (kullanıcı için)
        alert(
            '❌ Tablo export edilemedi!\\n\\n' +
            'Lütfen:\\n' +
            '1. Tabloyu görüntülediğinizden emin olun\\n' +
            '2. Tekrar deneyin\\n\\n' +
            'Sorun devam ederse sistem yöneticisine bildirin.'
        );

        setStatus('Hata oluştu', 'ready');
    }
}

// Logging helpers
function logInfo(message) {
    ipcRenderer.send('log-info', message);
}

function logError(message, error) {
    ipcRenderer.send('log-error', {
        message: message,
        error: error ? error.toString() : 'No error object'
    });
}

// Global error handler
window.onerror = function(message, source, lineno, colno, error) {
    console.error('❌ WINDOW ERROR:', {
        message,
        source,
        lineno,
        colno,
        errorMessage: error?.message,
        stack: error?.stack?.split('\n').slice(0, 3).join('\n'),
        timestamp: new Date().toISOString()
    });

    logError('Window error', {
        message,
        source,
        lineno,
        colno,
        error: error ? error.toString() : 'No error'
    });
};

// Error collection for export (son 50 hata)
const errorHistory = [];
const MAX_ERROR_HISTORY = 50;

function addToErrorHistory(errorData) {
    errorHistory.unshift({
        ...errorData,
        timestamp: new Date().toISOString()
    });

    // Sadece son 50 hatayı tut
    if (errorHistory.length > MAX_ERROR_HISTORY) {
        errorHistory.pop();
    }
}

// Override console.error to capture all errors
const originalConsoleError = console.error;
console.error = function(...args) {
    // Orijinal console.error'u çağır
    originalConsoleError.apply(console, args);

    // Eğer ilk argüman object ise, error history'ye ekle
    if (args[0] && typeof args[0] === 'object') {
        addToErrorHistory(args[0]);
    } else if (args[0] && typeof args[0] === 'string' && args[0].startsWith('❌')) {
        // ❌ ile başlayan error mesajları
        addToErrorHistory({
            type: 'console-error',
            message: args[0],
            data: args[1]
        });
    }
};

// Gizli hata export özelliği (Ctrl+Shift+E)
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'E') {
        e.preventDefault();
        exportErrors();
    }
});

function exportErrors() {
    try {
        if (errorHistory.length === 0) {
            alert('✅ Hiç hata kaydı yok!\n\nUygulama sorunsuz çalışıyor.');
            return;
        }

        // Hata raporunu hazırla
        const report = {
            appName: 'Universal Table Exporter',
            version: '1.0.0',
            exportDate: new Date().toISOString(),
            platform: navigator.platform,
            userAgent: navigator.userAgent,
            errorCount: errorHistory.length,
            errors: errorHistory
        };

        // JSON formatında kaydet
        const jsonContent = JSON.stringify(report, null, 2);
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        const filename = `errors_${timestamp}.json`;

        // Main process'e gönder (CSV kaydetme fonksiyonunu kullan)
        ipcRenderer.send('save-csv', {
            csv: jsonContent,
            filename: filename
        });

        ipcRenderer.once('save-csv-reply', (_event, response) => {
            if (response.success) {
                alert(
                    `✅ Hata raporu kaydedildi!\n\n` +
                    `📁 Dosya: ${filename}\n` +
                    `📊 Hata Sayısı: ${errorHistory.length}\n` +
                    `💾 Boyut: ${response.size} bytes\n\n` +
                    `📂 Konum:\n${response.path}\n\n` +
                    `Bu dosyayı sistem yöneticisine gönderin.`
                );

                console.log('✅ Error report exported:', response.path);
            } else {
                alert('❌ Hata raporu kaydedilemedi!\n\n' + (response.error || 'Bilinmeyen hata'));
            }
        });

    } catch (error) {
        console.error('❌ ERROR EXPORT FAILED:', {
            errorMessage: error.message,
            stack: error.stack
        });
        alert('❌ Hata raporu oluşturulamadı!');
    }
}

logInfo('Renderer process started');
