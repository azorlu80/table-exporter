/**
 * Internationalization (i18n) Module
 * Provides automatic language detection based on OS locale
 * Supports: Turkish (tr), English (en)
 */

const { app } = require('electron');

/**
 * Translation dictionary
 * @type {Object.<string, Object.<string, string>>}
 */
const translations = {
    // Turkish translations
    tr: {
        // Window titles
        'app.title': 'Evrensel Tablo Dışa Aktarıcı',
        'app.description': 'Web tablolarını CSV/Excel formatına aktarın',

        // Navigation buttons
        'nav.back': 'Geri',
        'nav.forward': 'İleri',
        'nav.refresh': 'Yenile',
        'nav.home': 'Ana Sayfa',

        // Export buttons
        'export.main': 'Tablo Export',
        'export.tools': 'Araçlar Menüsü',

        // Tools menu sections
        'tools.header': 'Araçlar Menüsü',
        'tools.automatic': 'Otomatik',
        'tools.manual': 'Manuel',
        'tools.specialized': 'Özelleşmiş',
        'tools.advanced': 'Gelişmiş',

        // Tools menu items
        'tools.autoExport': 'Otomatik Export',
        'tools.autoExport.desc': 'Tüm yöntemleri sırayla dene',
        'tools.manualSelector': 'Manuel Seçici',
        'tools.manualSelector.desc': 'Tabloya tıklayarak seç',
        'tools.selectionExport': 'Seçim Export',
        'tools.selectionExport.desc': 'Seçili metni export et',
        'tools.scanAll': 'Tüm Tabloları Tara',
        'tools.scanAll.desc': 'Sayfadaki tüm tabloları listele',
        'tools.extjsOnly': 'Sadece ExtJS',
        'tools.extjsOnly.desc': 'Sadece ExtJS gridleri dene',
        'tools.htmlOnly': 'Sadece HTML',
        'tools.htmlOnly.desc': 'Sadece HTML tablolarını dene',
        'tools.divOnly': 'Sadece Div Grid',
        'tools.divOnly.desc': 'Sadece div tabanlı gridleri dene',
        'tools.errorExport': 'Hata Export (Ctrl+Shift+E)',
        'tools.errorExport.desc': 'Son 50 hatayı JSON olarak kaydet',

        // Status messages
        'status.ready': 'Hazır',
        'status.loading': 'Yükleniyor...',
        'status.exporting': 'Export ediliyor...',
        'status.success': 'Başarılı!',
        'status.error': 'Hata oluştu',

        // Loading messages
        'loading.detectingTables': 'Tablolar tespit ediliyor...',
        'loading.extractingData': 'Veriler çıkarılıyor...',
        'loading.generatingCSV': 'CSV oluşturuluyor...',
        'loading.saving': 'Kaydediliyor...',

        // Success messages
        'success.exported': 'Tablo başarıyla export edildi!',
        'success.saved': 'Dosya kaydedildi:',
        'success.copied': 'Panoya kopyalandı!',

        // Error messages
        'error.noTables': 'Sayfada hiç tablo bulunamadı!',
        'error.noTablesDesc': 'Lütfen:\n1. Tabloyu görüntülediğinizden emin olun\n2. Sayfa tamamen yüklenene kadar bekleyin\n3. Tekrar deneyin',
        'error.exportFailed': 'Export işlemi başarısız oldu!',
        'error.saveFailed': 'Dosya kaydedilemedi!',
        'error.selectionEmpty': 'Hiçbir metin seçilmedi!',
        'error.selectionEmptyDesc': 'Lütfen tablodaki verileri seçin (fare ile sürükleyin) ve tekrar deneyin.',

        // Table selection dialog
        'dialog.selectTable': 'Tablo Seçin',
        'dialog.foundTables': 'tablo bulundu',
        'dialog.selectOne': 'Lütfen export etmek istediğiniz tabloyu seçin:',
        'dialog.tableInfo': 'satır',
        'dialog.noTitle': 'Başlıksız Tablo',

        // Manual selector instructions
        'manual.instruction': 'Export etmek istediğiniz tablonun üzerine gelin ve tıklayın',
        'manual.click': 'TIKLA',
        'manual.selected': 'Seçildi! Export ediliyor...',

        // Scan results
        'scan.title': 'Tablo Tarama Sonuçları',
        'scan.found': 'Toplam',
        'scan.tables': 'tablo bulundu:',
        'scan.extjs': 'ExtJS Grid',
        'scan.html': 'HTML Table',
        'scan.div': 'Div Grid',
        'scan.empty': 'Hiç tablo bulunamadı!',

        // Help instructions
        'help.title': 'Nasıl Kullanılır?',
        'help.step1': '1. Web sitesine gidin ve giriş yapın',
        'help.step2': '2. Export etmek istediğiniz tabloyu bulun',
        'help.step3': '3. "📊 Tablo Export" butonuna tıklayın',
        'help.step4': '4. Eğer bulamazsa "▼" menüsünden diğer yöntemleri deneyin',

        // Common
        'common.cancel': 'İptal',
        'common.ok': 'Tamam',
        'common.close': 'Kapat',
        'common.retry': 'Tekrar Dene',
        'common.rows': 'satır',
        'common.columns': 'sütun'
    },

    // English translations
    en: {
        // Window titles
        'app.title': 'Universal Table Exporter',
        'app.description': 'Export web tables to CSV/Excel format',

        // Navigation buttons
        'nav.back': 'Back',
        'nav.forward': 'Forward',
        'nav.refresh': 'Refresh',
        'nav.home': 'Home',

        // Export buttons
        'export.main': 'Export Table',
        'export.tools': 'Tools Menu',

        // Tools menu sections
        'tools.header': 'Tools Menu',
        'tools.automatic': 'Automatic',
        'tools.manual': 'Manual',
        'tools.specialized': 'Specialized',
        'tools.advanced': 'Advanced',

        // Tools menu items
        'tools.autoExport': 'Auto Export',
        'tools.autoExport.desc': 'Try all methods sequentially',
        'tools.manualSelector': 'Manual Selector',
        'tools.manualSelector.desc': 'Click on table to select',
        'tools.selectionExport': 'Selection Export',
        'tools.selectionExport.desc': 'Export selected text',
        'tools.scanAll': 'Scan All Tables',
        'tools.scanAll.desc': 'List all tables on page',
        'tools.extjsOnly': 'ExtJS Only',
        'tools.extjsOnly.desc': 'Try ExtJS grids only',
        'tools.htmlOnly': 'HTML Only',
        'tools.htmlOnly.desc': 'Try HTML tables only',
        'tools.divOnly': 'Div Grid Only',
        'tools.divOnly.desc': 'Try div-based grids only',
        'tools.errorExport': 'Error Export (Ctrl+Shift+E)',
        'tools.errorExport.desc': 'Save last 50 errors as JSON',

        // Status messages
        'status.ready': 'Ready',
        'status.loading': 'Loading...',
        'status.exporting': 'Exporting...',
        'status.success': 'Success!',
        'status.error': 'Error occurred',

        // Loading messages
        'loading.detectingTables': 'Detecting tables...',
        'loading.extractingData': 'Extracting data...',
        'loading.generatingCSV': 'Generating CSV...',
        'loading.saving': 'Saving...',

        // Success messages
        'success.exported': 'Table exported successfully!',
        'success.saved': 'File saved:',
        'success.copied': 'Copied to clipboard!',

        // Error messages
        'error.noTables': 'No tables found on this page!',
        'error.noTablesDesc': 'Please:\n1. Make sure the table is visible\n2. Wait for the page to fully load\n3. Try again',
        'error.exportFailed': 'Export operation failed!',
        'error.saveFailed': 'Could not save file!',
        'error.selectionEmpty': 'No text selected!',
        'error.selectionEmptyDesc': 'Please select table data (drag with mouse) and try again.',

        // Table selection dialog
        'dialog.selectTable': 'Select Table',
        'dialog.foundTables': 'tables found',
        'dialog.selectOne': 'Please select the table you want to export:',
        'dialog.tableInfo': 'rows',
        'dialog.noTitle': 'Untitled Table',

        // Manual selector instructions
        'manual.instruction': 'Hover over and click the table you want to export',
        'manual.click': 'CLICK',
        'manual.selected': 'Selected! Exporting...',

        // Scan results
        'scan.title': 'Table Scan Results',
        'scan.found': 'Total',
        'scan.tables': 'tables found:',
        'scan.extjs': 'ExtJS Grid',
        'scan.html': 'HTML Table',
        'scan.div': 'Div Grid',
        'scan.empty': 'No tables found!',

        // Help instructions
        'help.title': 'How to Use?',
        'help.step1': '1. Navigate to website and login',
        'help.step2': '2. Find the table you want to export',
        'help.step3': '3. Click "📊 Export Table" button',
        'help.step4': '4. If not found, try other methods from "▼" menu',

        // Common
        'common.cancel': 'Cancel',
        'common.ok': 'OK',
        'common.close': 'Close',
        'common.retry': 'Retry',
        'common.rows': 'rows',
        'common.columns': 'columns'
    }
};

/**
 * Current language (detected from OS locale)
 * @type {string}
 */
let currentLanguage = 'en';

/**
 * Detect OS locale and set language
 * @returns {string} Detected language code (tr or en)
 */
function detectLanguage() {
    try {
        // Get system locale from Electron
        const locale = app.getLocale(); // e.g., "tr", "tr-TR", "en-US", "en-GB"

        console.log('🌍 OS Locale detected:', locale);

        // Extract base language code
        const baseLang = locale.split('-')[0].toLowerCase();

        // Check if we have translation for this language
        if (translations[baseLang]) {
            currentLanguage = baseLang;
            console.log('✅ Language set to:', currentLanguage);
        } else {
            // Default to English
            currentLanguage = 'en';
            console.log('⚠️ Language not supported, defaulting to English');
        }

        return currentLanguage;

    } catch (error) {
        console.error('❌ Language detection error:', {
            errorMessage: error.message,
            stack: error.stack?.split('\n')[0]
        });

        // Fallback to English
        currentLanguage = 'en';
        return currentLanguage;
    }
}

/**
 * Get translation for a key
 * @param {string} key - Translation key (e.g., 'app.title')
 * @returns {string} Translated text
 */
function t(key) {
    try {
        // Get translation for current language
        const translation = translations[currentLanguage]?.[key];

        if (translation) {
            return translation;
        }

        // Fallback to English
        const fallback = translations.en?.[key];
        if (fallback) {
            console.warn(`⚠️ Translation missing for '${key}' in ${currentLanguage}, using English`);
            return fallback;
        }

        // No translation found
        console.warn(`⚠️ Translation missing for key: ${key}`);
        return key;

    } catch (error) {
        console.error('❌ Translation error:', {
            errorMessage: error.message,
            key,
            language: currentLanguage
        });
        return key;
    }
}

/**
 * Get current language code
 * @returns {string} Current language code (tr or en)
 */
function getCurrentLanguage() {
    return currentLanguage;
}

/**
 * Get all translations for current language
 * @returns {Object.<string, string>} All translations
 */
function getAllTranslations() {
    return translations[currentLanguage] || translations.en;
}

// Auto-detect language on module load
detectLanguage();

module.exports = {
    t,
    getCurrentLanguage,
    getAllTranslations,
    detectLanguage
};
