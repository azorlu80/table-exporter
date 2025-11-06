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

// ========================================
// ARAÇLAR MENÜSÜ FONKSİYONLARI
// ========================================

// Menü toggle
function toggleToolsMenu() {
    const menu = document.getElementById('toolsMenu');
    menu.classList.toggle('hidden');
}

// Menü dışına tıklanınca kapat
document.addEventListener('click', (e) => {
    const menu = document.getElementById('toolsMenu');
    const toggle = document.getElementById('toolsToggle');
    const exportDropdown = document.querySelector('.export-dropdown');

    if (menu && !menu.classList.contains('hidden')) {
        if (!exportDropdown.contains(e.target)) {
            menu.classList.add('hidden');
        }
    }
});

// 1. Otomatik Export (mevcut fonksiyon)
function autoExport() {
    document.getElementById('toolsMenu').classList.add('hidden');
    showTableSelection();
}

// 2. Manuel Seçici
let manualSelectorActive = false;

function manualSelector() {
    document.getElementById('toolsMenu').classList.add('hidden');

    manualSelectorActive = true;

    alert(
        '📍 Manuel Seçici Aktif!\n\n' +
        'Tabloya tıklayın...\n\n' +
        '💡 İpucu: Tablo üzerine geldiğinizde highlight olacak'
    );

    setStatus('Tabloya tıklayın...', 'loading');

    // WebView'a script inject et
    webview.executeJavaScript(`
        (function() {
            let highlightedElement = null;
            let highlightDiv = null;

            function createHighlight() {
                highlightDiv = document.createElement('div');
                highlightDiv.style.cssText = \`
                    position: absolute;
                    border: 3px solid #667eea;
                    background: rgba(102, 126, 234, 0.1);
                    pointer-events: none;
                    z-index: 999999;
                    transition: all 0.2s;
                \`;
                document.body.appendChild(highlightDiv);
            }

            function updateHighlight(element) {
                if (!highlightDiv) createHighlight();
                const rect = element.getBoundingClientRect();
                highlightDiv.style.top = (rect.top + window.scrollY) + 'px';
                highlightDiv.style.left = (rect.left + window.scrollX) + 'px';
                highlightDiv.style.width = rect.width + 'px';
                highlightDiv.style.height = rect.height + 'px';
                highlightDiv.style.display = 'block';
            }

            function hideHighlight() {
                if (highlightDiv) highlightDiv.style.display = 'none';
            }

            document.addEventListener('mouseover', (e) => {
                const table = e.target.closest('table, [role="grid"], .grid, .x-grid');
                if (table) {
                    highlightedElement = table;
                    updateHighlight(table);
                }
            });

            document.addEventListener('mouseout', () => {
                hideHighlight();
            });

            document.addEventListener('click', (e) => {
                const table = e.target.closest('table, [role="grid"], .grid, .x-grid');
                if (table) {
                    e.preventDefault();
                    e.stopPropagation();

                    // Tablo datasını extract et
                    const tableData = {
                        selected: true,
                        element: table.outerHTML.substring(0, 500) // Preview
                    };

                    console.log('✅ Manual table selected', tableData);
                    alert('✅ Tablo seçildi! Şimdi export ediliyor...');

                    // Cleanup
                    if (highlightDiv) highlightDiv.remove();

                    return false;
                }
            }, true);
        })();
    `).then(() => {
        logInfo('Manual selector activated');
    }).catch(error => {
        console.error('❌ MANUAL SELECTOR ERROR:', error);
        alert('❌ Manuel seçici başlatılamadı!');
        setStatus('Hata', 'ready');
    });
}

// 3. Seçili Metni Export
async function selectionExport() {
    document.getElementById('toolsMenu').classList.add('hidden');

    try {
        showLoading('Seçili metin alınıyor...');

        const selectedText = await webview.executeJavaScript(`
            window.getSelection().toString();
        `);

        hideLoading();

        if (!selectedText || selectedText.trim().length === 0) {
            alert(
                '❌ Hiç metin seçilmedi!\n\n' +
                'Lütfen:\n' +
                '1. Tablodaki veriyi fareyle seçin\n' +
                '2. Ctrl+A ile tümünü seçebilirsiniz\n' +
                '3. Tekrar bu aracı çalıştırın'
            );
            return;
        }

        // Tab/newline ile parse et
        const rows = selectedText.split('\n').filter(r => r.trim());
        const csvRows = rows.map(row => {
            // Tab veya çoklu boşluk ile ayrılmış
            const cells = row.split(/\t+|\s{2,}/).filter(c => c.trim());
            return cells.map(cell => {
                // CSV escape
                const cleaned = cell.trim().replace(/"/g, '""');
                return `"${cleaned}"`;
            }).join(',');
        });

        const csv = csvRows.join('\n');

        if (csv.length === 0) {
            alert('❌ Veri parse edilemedi!');
            return;
        }

        // Export
        const now = new Date();
        const timestamp =
            now.getFullYear() + '-' +
            String(now.getMonth() + 1).padStart(2, '0') + '-' +
            String(now.getDate()).padStart(2, '0') + '_' +
            String(now.getHours()).padStart(2, '0') + '-' +
            String(now.getMinutes()).padStart(2, '0');

        const filename = `manuel_export_${timestamp}.csv`;

        ipcRenderer.send('save-csv', { csv, filename });

        ipcRenderer.once('save-csv-reply', (_event, response) => {
            if (response.success) {
                alert(
                    '✅ Seçili metin export edildi!\n\n' +
                    `📊 Satır: ${rows.length}\n` +
                    `💾 Dosya: ${response.size} bytes\n\n` +
                    `📂 Konum:\n${response.path}`
                );
                setStatus('Export başarılı', 'ready');
            } else {
                alert('❌ Export başarısız: ' + response.error);
            }
        });

    } catch (error) {
        hideLoading();
        console.error('❌ SELECTION EXPORT ERROR:', error);
        alert('❌ Seçili metin export edilemedi!');
    }
}

// 4-6. Özel Modlar (ExtJS, HTML, Div only)
async function extjsOnly() {
    document.getElementById('toolsMenu').classList.add('hidden');
    // TODO: Sadece ExtJS grid'leri ara
    alert('🚧 ExtJS Only modu yakında!\n\nŞimdilik "Otomatik Export" kullanın.');
}

async function htmlOnly() {
    document.getElementById('toolsMenu').classList.add('hidden');
    // TODO: Sadece HTML table'ları ara
    alert('🚧 HTML Only modu yakında!\n\nŞimdilik "Otomatik Export" kullanın.');
}

async function divOnly() {
    document.getElementById('toolsMenu').classList.add('hidden');
    // TODO: Sadece div-based grid'leri ara
    alert('🚧 Div-Based Grid modu yakında!\n\nŞimdilik "Otomatik Export" kullanın.');
}

// 7. Tüm Sayfayı Tara
async function scanAllTables() {
    document.getElementById('toolsMenu').classList.add('hidden');

    try {
        showLoading('Sayfa taranıyor...');

        const result = await webview.executeJavaScript(`
            (function() {
                const all = [];

                // ExtJS grids
                if (typeof Ext !== 'undefined' && Ext.ComponentQuery) {
                    try {
                        const grids = Ext.ComponentQuery.query('gridpanel');
                        grids.forEach((g, i) => {
                            all.push({
                                type: 'ExtJS Grid',
                                title: g.title || 'ExtJS Grid ' + (i + 1),
                                rows: g.getStore() ? g.getStore().getCount() : 0,
                                cols: g.getColumns ? g.getColumns().length : 0
                            });
                        });
                    } catch (e) {}
                }

                // HTML tables
                const tables = document.querySelectorAll('table');
                tables.forEach((t, i) => {
                    const rows = t.querySelectorAll('tr').length;
                    const cols = t.querySelector('tr') ? t.querySelector('tr').querySelectorAll('th, td').length : 0;

                    all.push({
                        type: 'HTML Table',
                        title: t.caption?.textContent || t.id || 'Table ' + (i + 1),
                        rows: rows,
                        cols: cols
                    });
                });

                // Div grids
                const divGrids = document.querySelectorAll('[role="grid"], .grid, .data-grid');
                divGrids.forEach((d, i) => {
                    all.push({
                        type: 'Div Grid',
                        title: d.getAttribute('aria-label') || 'Grid ' + (i + 1),
                        rows: d.querySelectorAll('[role="row"], .row').length,
                        cols: 'unknown'
                    });
                });

                return all;
            })();
        `);

        hideLoading();

        if (result.length === 0) {
            alert('❌ Sayfada hiç tablo bulunamadı!');
            return;
        }

        // Sonuçları göster
        let message = `🔍 Tüm Sayfa Tarama Sonucu\n\n` +
                      `Toplam ${result.length} tablo bulundu:\n\n`;

        result.forEach((t, i) => {
            message += `${i + 1}. [${t.type}] ${t.title}\n`;
            message += `   📊 ${t.rows} satır × ${t.cols} sütun\n\n`;
        });

        message += `💡 "Otomatik Export" ile export edebilirsiniz.`;

        alert(message);

    } catch (error) {
        hideLoading();
        console.error('❌ SCAN ALL ERROR:', error);
        alert('❌ Sayfa taranamadı!');
    }
}

logInfo('Renderer process started');
