# 🤖 Claude Development Guidelines - Tablo Exporter

Bu proje **Claude AI** tarafından geliştirilmiştir. Bu dosya, projenin sürdürülebilirliği ve kod kalitesi için **best practices** ve **coding standards** içerir.

---

## 🚨 META-RULE - ABSOLUTE PRIORITY (KURAL 0)

**⚠️ HER RESPONSE BAŞINDA MUTLAKA BU CHECKLİST'İ GÖSTER:**

```
📋 MANDATORY RULES CHECK (Electron Desktop App):

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 PHASE 1: PREPARATION (Başlamadan Önce)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

□ KURAL 28 (Tutarlılık) - CLAUDE.md kurallarına sadık kalıyorum!
  • Tutarsızlık var mı? → SORU SOR!
  • Muğlaklık var mı? → NETLEŞTİR!
  • Bilmiyor muyum? → "BİLMİYORUM" DE!

□ KURAL 1 (Try-Catch) - Her async'te try-catch var!
  • File operations → try-catch ✓
  • IPC handlers → try-catch ✓
  • WebView operations → try-catch ✓

□ KURAL 2 (Logger) - Context-aware logging!
  • logger.info(), logger.error() kullanıyorum
  • Error object ile log ✓
  • Context data ekliyorum ✓

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔧 PHASE 2: DEVELOPMENT (Electron Özel)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

□ KURAL 3 (IPC Communication) - Her IPC handler try-catch!
  • Always reply (success/failure)
  • Timeout handling ✓
  • Data validation ✓

□ KURAL 4 (WebView Security) - Güvenlik önlemleri!
  • User Agent set ✓
  • Session persistence ✓
  • No credentials logged ✓

□ KURAL 5 (Dosya Organizasyonu) - Temiz yapı!
  • src/ altında modüler kod ✓
  • tests/ altında testler ✓
  • Çöp dosya yok ✓

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ PHASE 3: TESTING & QUALITY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

□ KURAL 6 (Test Etmeden "Yaptım" Deme) - Test planım var!
  • Component test edildi!
  • Fonksiyonellik test edildi!
  • Electron app'te GERÇEKTEN çalışıyor!

□ KURAL 7 (Error Messages) - User-friendly mesajlar!
  • Teknik detay kullanıcıya gösterilmiyor
  • Çözüm önerileri var
  • Context-specific log var

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📦 PHASE 4: COMMIT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

□ KURAL 8 (Commit-by-Commit) - Her özellik = Ayrı commit!
  • Küçük commit! (50-200 satır ideal)
  • Detaylı commit message! (AI için!)
  • CLAUDE.md compliance notları var!
  • ❌ PUSH YAPMA! (Kullanıcı talep edene kadar!)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️  CRITICAL REMINDERS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

❌ Eğer yukarıdaki checklist'i göstermediysen → DURDUR ve ŞİMDİ GÖSTER!
❌ Tutarsızlık varsa → KULLANICIYA SOR!
❌ Test etmediysen → "YAPTIM" DEME!
❌ Sallama → "BİLMİYORUM" diyebilirsin!

✅ Desktop App = Güvenilirlik kritik!
✅ Git History = AI Memory - Detaylı commit yaz!
✅ Electron = IPC güvenliği önemli!
✅ Tutarlılık = Güvenilirlik!
```

**NEDEN BU KURAL VAR:**
- Claude uzun konuşmalarda kuralları unutur (attention decay)
- Her response'da checklist görünce hatırlar (self-referential loop)
- User görebilir hangi kuralları takip edildiğini
- İhlal anında fark edilir

---

## 🎯 Proje Özeti

Tablo Exporter, hastane yönetim sistemlerinden tablo verilerini Excel/CSV formatına aktarmak için Electron tabanlı desktop uygulamadır.

**Mimari:**
- **Desktop Framework:** Electron
- **Main Process:** Node.js (src/main.js)
- **Renderer Process:** Browser (src/renderer.js)
- **WebView:** Embedded Chromium
- **Logging:** electron-log

**Temel Prensipler:**
1. Main process = File I/O, IPC handlers
2. Renderer process = UI logic, WebView control
3. WebView = Target site navigation
4. IPC = Inter-process communication
5. **⭐ Paket-öncelikli:** Custom kod yazmadan önce NPM paketi ara
6. **🚨 Desktop App:** Crash olmamalı, try-catch her yerde!

---

## 📋 Proje Yapısı

### Dizin Organizasyonu
```
tablo_exporter/
├── src/
│   ├── main.js              # Main process (Electron)
│   ├── renderer.js          # Renderer process (UI logic)
│   └── utils/
│       ├── logger.js        # Logging utility
│       ├── tableExtractor.js         # Legacy extractor
│       └── tableExtractorAdvanced.js # Advanced extractor with fallbacks
├── tests/
│   ├── manual/
│   │   ├── TEST_PLAN.md
│   │   └── TEST_URLS.md
│   ├── fixtures/
│   │   └── test-table.html
│   └── results/              # Test outputs (.gitignored)
├── index.html                # Main UI
├── package.json
├── README.md
├── CLAUDE.md                 # This file
└── .gitignore
```

### 🚫 Çöp Dosyalar - YASAK!
- ❌ `temp.js`, `test.js`, `debug.js` gibi temporary dosyalar
- ❌ `old/`, `backup/`, `archive/` gibi klasörler
- ❌ `console.log` debugger'lar (production'da)
- ❌ Commented out code blokları (gereksiz)
- ❌ Unused imports/variables

**Kural:** Her dosya bir amaca hizmet etmeli. Gereksiz dosya = silme zamanı!

---

## 🎯 Kod Yazım Kuralları

### 1. Try-Catch Kullanımı (ÇOK ÖNEMLİ!)

#### ✅ DOĞRU Kullanım

```javascript
/**
 * CSV dosyasını kaydet
 * @throws {Error} Dosya yazma hatası
 */
async function saveCSVFile(csv, filename) {
    try {
        logger.info(`CSV kaydediliyor: ${filename}`);

        const result = await dialog.showSaveDialog(mainWindow, {
            title: 'CSV Dosyasını Kaydet',
            defaultPath: filename,
            filters: [{ name: 'CSV Dosyası', extensions: ['csv'] }]
        });

        if (result.canceled) {
            logger.warn('CSV kaydetme iptal edildi');
            return { success: false, canceled: true };
        }

        fs.writeFileSync(result.filePath, BOM + csv, 'utf8');

        logger.success(`CSV başarıyla kaydedildi: ${result.filePath}`);

        return {
            success: true,
            path: result.filePath
        };

    } catch (error) {
        // ÇOK ÖNEMLİ: Her zaman log!
        logger.error('CSV kaydetme hatası', error);

        return {
            success: false,
            error: error.message  // User-friendly message
        };
    }
}
```

#### ❌ YANLIŞ Kullanım

```javascript
// YANLIŞ 1: Try-catch yok
async function saveCSVFile(csv, filename) {
    const result = await dialog.showSaveDialog(...);  // ❌ Crash riski
    fs.writeFileSync(result.filePath, csv);           // ❌ Crash riski
    return { success: true };
}

// YANLIŞ 2: Empty catch
try {
    dangerousFunction();
} catch (error) {
    // ❌ Sessizce yutma
}

// YANLIŞ 3: Generic error message
try {
    complexOperation();
} catch (error) {
    throw new Error('Bir hata oluştu');  // ❌ Faydasız
}
```

#### ✅ Try-Catch Best Practices

1. **Her async fonksiyonda try-catch**
   ```javascript
   async function anyAsyncFunction() {
       try {
           await something();
       } catch (error) {
           logger.error('Context-specific message', error);
           return { success: false, error: error.message };
       }
   }
   ```

2. **User-facing fonksiyonlarda anlaşılır mesajlar**
   ```javascript
   try {
       await exportTable();
   } catch (error) {
       alert(
           '❌ Tablo export edilemedi!\\n\\n' +
           'Lütfen:\\n' +
           '1. Tabloyu görüntülediğinizden emin olun\\n' +
           '2. Tekrar deneyin'
       );
   }
   ```

3. **Cascade error handling**
   ```javascript
   // Level 1: Utility function
   function readFile(path) {
       try {
           return fs.readFileSync(path);
       } catch (error) {
           logger.error('File read error', error);
           throw new Error(`Cannot read file: ${path}`);
       }
   }

   // Level 2: Business logic
   async function processFile(path) {
       try {
           const data = readFile(path);
           return processData(data);
       } catch (error) {
           logger.error('File processing error', error);
           return { success: false, error: error.message };
       }
   }

   // Level 3: User interface
   async function handleUserAction() {
       try {
           const result = await processFile(userPath);
           if (!result.success) {
               showErrorToUser(result.error);
           }
       } catch (error) {
           logger.error('User action failed', error);
           showCriticalError();
       }
   }
   ```

---

### 2. Logging Standartları (KRİTİK!)

#### 🚨 ASLA TANIMI OLMAYAN LOGGER KULLANMA - SİSTEM PATLAR!

**Bu proje `src/utils/logger.js` kullanır. Logger class instance alır, direkt method çağrılamaz!**

#### ✅ DOĞRU Logger Kullanımı

```javascript
const Logger = require('./utils/logger');
const logger = new Logger('ModuleName');  // ← Instance oluştur!

// ✅ DOĞRU - Instance methodları:
logger.info('Pencere oluşturuluyor');
logger.info(`CSV kaydediliyor: ${filename}`);
logger.success('Export tamamlandı');
logger.warn('Session bulunamadı');
logger.error('CSV kaydetme hatası', error);
logger.debug('Table extraction started', { tableCount });
```

#### ❌ YANLIŞ Logger Kullanımı

```javascript
// ❌ FELAKET - Instance oluşturmadan kullanma!
const logger = require('./utils/logger');
logger.info('mesaj');   // ❌ TypeError: logger.info is not a function

// ❌ FELAKET - Direkt import/kullanım
import logger from './utils/logger';
logger.error('hata');   // ❌ PATLAR!
```

#### 🔒 KURAL: Logger = MUTLAKA Instance!

```javascript
// src/utils/logger.js yapısı:
class Logger {
  constructor(context = 'App') {
    this.context = context;
  }

  info(message, ...args) { /* ... */ }
  error(message, error, ...args) { /* ... */ }
  warn(message, ...args) { /* ... */ }
  success(message, ...args) { /* ... */ }
  debug(message, ...args) { /* ... */ }
}

module.exports = Logger;  // ← CLASS export, instance değil!

// KULLANIM:
const Logger = require('./utils/logger');
const logger = new Logger('MyModule');  // ← Instance oluştur!
logger.info('mesaj');  // ✓ Çalışır
```

#### ❌ Console.log Kullanımı

```javascript
// ❌ PRODUCTION'DA YASAK
console.log('debug');              // Kullanma!
console.error('error');            // logger.error kullan!

// ✅ Sadece development'ta, geçici debug için OK
if (process.env.NODE_ENV === 'development') {
    console.log('[DEV] Quick debug:', data);
}
```

#### Log Seviyeleri

1. **logger.debug()** - Geliştirme sırasında detaylı bilgi
2. **logger.info()** - Normal akış bilgisi
3. **logger.success()** - Başarılı operasyonlar
4. **logger.warn()** - Potansiyel problemler
5. **logger.error()** - Hatalar (mutlaka error object ile)

#### 🚨 LOGGER KULLANMADAN ÖNCE:

**MUTLAKA `src/utils/logger.js` dosyasına bak!**

```bash
# Her logger kullanımından önce:
Read src/utils/logger.js

# Kontrol et:
✓ Class mı, instance mı export ediliyor?
✓ Hangi methodlar var?
✓ Constructor nasıl kullanılıyor?

# Sonra kullan - AYNI PATTERN!
```

**Neden bu kural var:**
- Riskmatik'te kategori yapısı vardı (logger.system.info)
- Bu projede context-based yapı var (new Logger('Module'))
- **FARKLI YAPIDA** → Logger kullanmadan önce MUTLAKA dosyaya bak!
- Yanlış kullanım → TypeError → Production PATLAR!

---

### 3. Fonksiyon Yazımı

#### ✅ DOĞRU

```javascript
/**
 * Tabloları tespit et ve listele
 * @returns {Promise<TableResult>} Bulunan tablolar
 * @throws {Error} Tablo bulunamadığında
 */
async function detectTables() {
    try {
        logger.info('Tablo tespiti başlatılıyor');

        const result = await webview.executeJavaScript(extractionScript);

        if (result.totalCount === 0) {
            throw new Error('Sayfada hiç tablo bulunamadı');
        }

        logger.success(`${result.totalCount} tablo bulundu`);
        return result;

    } catch (error) {
        logger.error('Tablo tespiti başarısız', error);
        throw error;  // Re-throw for caller to handle
    }
}
```

#### Fonksiyon Kuralları

1. **Tek sorumluluk prensibi** - Her fonksiyon bir iş yapar
2. **JSDoc açıklamaları** - Parametreler, dönüş değeri, hatalar
3. **Anlamlı isimler** - `getData()` değil, `extractTableFromDOM()`
4. **Tutarlı return** - Hep aynı tipte dön (object, array, boolean)
5. **Error handling** - Try-catch veya throw
6. **Logging** - Başlangıç, başarı, hata

---

### 4. Hata Mesajları

#### Kullanıcıya Gösterilen Mesajlar

```javascript
// ✅ Açıklayıcı ve çözüm odaklı
alert(
    '❌ Sayfada hiç tablo bulunamadı!\\n\\n' +
    'Lütfen:\\n' +
    '1. Tabloyu görüntülediğinizden emin olun\\n' +
    '2. Sayfa tamamen yüklenene kadar bekleyin\\n' +
    '3. Tekrar deneyin\\n\\n' +
    'Denenen yöntemler: ExtJS Grid, HTML Table, Div Grid'
);

// ❌ Kullanıcıya faydasız
alert('Error occurred');  // Ne hatası? Ne yapmalı?
alert(error.stack);        // Technical jargon
```

#### Log Mesajları

```javascript
// ✅ Context-specific
logger.error('CSV kaydetme hatası', error, {
    filename,
    fileSize: csv.length,
    timestamp: Date.now()
});

// ❌ Generic
logger.error('Error', error);
```

---

### 5. Async/Await Kullanımı

#### ✅ DOĞRU

```javascript
async function exportWorkflow() {
    try {
        // Sequential operations
        const tables = await detectTables();
        const selected = await userSelectTable(tables);
        const csv = await generateCSV(selected);
        const result = await saveFile(csv);

        return result;

    } catch (error) {
        logger.error('Export workflow failed', error);
        throw error;
    }
}
```

#### ❌ YANLIŞ

```javascript
// YANLIŞ 1: Callback hell
function exportWorkflow(callback) {
    detectTables((tables) => {
        userSelectTable(tables, (selected) => {
            generateCSV(selected, (csv) => {
                saveFile(csv, callback);  // ❌ Nightmare!
            });
        });
    });
}

// YANLIŞ 2: Unhandled promise
async function riskyFunction() {
    await dangerousOperation();  // ❌ No try-catch
}
```

---

### 6. IPC (Inter-Process Communication)

#### ✅ DOĞRU Pattern

```javascript
// Main Process
ipcMain.on('save-csv', async (event, data) => {
    try {
        logger.info('CSV kaydetme isteği alındı');

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

// Renderer Process
ipcRenderer.send('save-csv', { csv, filename });

ipcRenderer.once('save-csv-reply', (event, response) => {
    if (response.success) {
        showSuccess(response.path);
    } else {
        showError(response.error);
    }
});
```

#### IPC Kuralları

1. **Her IPC mutlaka try-catch**
2. **Always reply** - Caller hep cevap bekler
3. **Timeout mekanizması** - `ipcRenderer.once` + setTimeout
4. **Typed data** - Gönderilen/alınan data validation

---

### 7. UI State Management

```javascript
// ✅ Centralized state updates
function setStatus(text, type = 'ready') {
    statusText.textContent = text;
    statusDot.classList.remove('loading', 'error');

    if (type === 'loading') {
        statusDot.classList.add('loading');
    } else if (type === 'error') {
        statusDot.classList.add('error');
    }

    logger.debug(`Status updated: ${text} (${type})`);
}

// ✅ Loading state management
function showLoading(text = 'Yükleniyor...') {
    loadingText.textContent = text;
    loadingOverlay.classList.remove('hidden');
    exportBtn.disabled = true;
}

function hideLoading() {
    loadingOverlay.classList.add('hidden');
    exportBtn.disabled = false;
}
```

---

## 🔐 Güvenlik Kuralları

### 1. User Agent
```javascript
// ✅ Normal tarayıcı gibi davran
webview.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
    'AppleWebKit/537.36 (KHTML, like Gecko) ' +
    'Chrome/120.0.0.0 Safari/537.36'
);
```

### 2. Session Yönetimi
```javascript
// ✅ Persistent session
webPreferences: {
    partition: 'persist:hospital'  // Session kalıcı
}
```

### 3. Şifre Yönetimi
```javascript
// ❌ ASLA ŞİFRELERİ KAYDETME
// ❌ ASLA CONSOLE'A LOGLA
// ❌ ASLA DOSYAYA YAZ

// ✅ Sadece session cookie'leri saklanır
```

---

## 📦 Dependency Yönetimi

### package.json Kuralları

```json
{
  "dependencies": {
    // Production dependencies
    "electron-log": "^5.4.3"
  },
  "devDependencies": {
    // Development only
    "electron": "^39.1.0"
  }
}
```

### Yeni Dependency Eklerken

1. **Gerçekten gerekli mi?** - Alternatif var mı?
2. **Bundle size** - Ne kadar büyük?
3. **Maintenance** - Aktif mi?
4. **Security** - Bilinen vulnerability var mı?

```bash
# Yeni dependency ekle
npm install <package> --save       # Production
npm install <package> --save-dev   # Development

# Audit
npm audit
npm audit fix
```

---

## 🧪 Test Kuralları

### Manuel Test Workflow

1. **Local fixture** - Hızlı test
2. **Public sites** - Gerçek dünya testi
3. **Production** - Final validation

### Test Outputs

```bash
# Test sonuçları buraya
tests/results/
├── test-1-*.csv
├── test-2-*.csv
└── ...

# .gitignore'da
tests/results/
*.csv
*.xls
*.xlsx
```

### Test Checklist

Her özellik için:
- [ ] Happy path çalışıyor
- [ ] Error cases handle ediliyor
- [ ] Loading states doğru
- [ ] User feedback veriliyor
- [ ] Logs yazılıyor

---

## 🚀 Commit Kuralları

### Commit Message Format

```
type(scope): subject

body (optional)

footer (optional)
```

#### Types:
- **feat**: Yeni özellik
- **fix**: Bug fix
- **refactor**: Code refactoring
- **docs**: Dokümantasyon
- **style**: Formatting, whitespace
- **test**: Test ekleme/düzenleme
- **chore**: Build, dependencies

#### Örnekler:

```bash
# İyi commit mesajları
git commit -m "feat(export): add ExtJS grid support with fallback"
git commit -m "fix(logging): add error context to all logger calls"
git commit -m "refactor(main): extract CSV save logic to separate function"
git commit -m "docs(claude): add comprehensive coding guidelines"

# Kötü commit mesajları
git commit -m "fix bug"           # Hangi bug?
git commit -m "update code"       # Ne güncellendi?
git commit -m "wip"               # Work in progress - commit etme!
```

---

## 📚 Dokümantasyon Kuralları

### README.md
- Proje açıklaması
- Kurulum adımları
- Kullanım örnekleri
- Troubleshooting

### CLAUDE.md (Bu dosya)
- Coding standards
- Best practices
- Architecture decisions

### Kod İçi Dokümantasyon
```javascript
/**
 * JSDoc her public fonksiyonda
 * @param {string} csv - CSV content
 * @param {string} filename - File name
 * @returns {Promise<SaveResult>}
 * @throws {Error} File write error
 */
```

---

## ⚡ Performance Kuralları

1. **Lazy loading** - Sadece gerektiğinde yükle
2. **Debounce/throttle** - Frequent events
3. **Memory cleanup** - Event listeners temizle
4. **Large data** - Stream kullan, tek seferde yükleme

```javascript
// ✅ Memory efficient
webview.addEventListener('dom-ready', handler);
webview.removeEventListener('dom-ready', handler);  // Cleanup!

// ❌ Memory leak
webview.addEventListener('dom-ready', handler);  // Never removed
```

---

## 🎯 Son Kontrol Listesi

Her PR/Commit öncesi:

- [ ] Try-catch tüm async fonksiyonlarda
- [ ] Logger çağrıları uygun yerlerde
- [ ] Error messages user-friendly
- [ ] No console.log in production code
- [ ] No commented out code
- [ ] No unused imports/variables
- [ ] JSDoc açıklamaları ekli
- [ ] Test edildi (manual)
- [ ] Commit message descriptive
- [ ] No secrets in code

---

---

## 🔮 GELECEKTEKİ ENTEGRASYONLAR İÇİN KURALLAR

### KURAL 21: SUPABASE ENTEGRASYONU (İleride Kullanılabilir)

**Eğer ileride Supabase eklersen:**

#### 1️⃣ **Database Connection Pooling**

```javascript
// ✅ DOĞRU - Transaction Mode (Serverless/REST API için)
DATABASE_URL="postgresql://user:pass@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connect_timeout=30&pool_timeout=30"

// ✅ DOĞRU - Session Mode (Migration için)
DIRECT_URL="postgresql://user:pass@aws-0-eu-central-1.pooler.supabase.com:5432/postgres"

// ❌ YANLIŞ - Direct connection (IPv6-only!)
DATABASE_URL="postgresql://user:pass@db.xxx.supabase.co:5432/postgres"
```

**KURAL:**
- **Runtime:** Transaction Mode (Port 6543) + `pgbouncer=true`
- **Migration:** Session Mode Pooler (Port 5432) - Direct connection DEĞİL!
- **ASLA** `connection_limit` parametresi ekleme (external pooler ile gereksiz!)

#### 2️⃣ **Supabase Client Kullanımı**

```javascript
// ✅ DOĞRU - Singleton pattern
const { createClient } = require('@supabase/supabase-js');

let supabaseClient;

function getSupabaseClient() {
  if (!supabaseClient) {
    supabaseClient = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_KEY
    );
  }
  return supabaseClient;
}

// Kullanım:
const supabase = getSupabaseClient();
const { data, error } = await supabase.from('users').select('*');
```

---

### KURAL 22: AI SERVİSLERİ ENTEGRASYONU (İleride Kullanılabilir)

**Eğer ileride AI servisleri eklersen (Gemini, OpenAI, vb):**

#### 1️⃣ **SADECE Resmi SDK Kullan**

```javascript
// ✅ DOĞRU - Vertex AI (Google Cloud)
const { VertexAI } = require('@google-cloud/vertexai');

const vertexAI = new VertexAI({
  project: process.env.GCP_PROJECT_ID,
  location: process.env.GCP_LOCATION,
  googleAuthOptions: {
    keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
  }
});

const model = vertexAI.getGenerativeModel({
  model: process.env.GEMINI_MODEL_NAME || 'gemini-2.0-flash-exp'
});

// ❌ YANLIŞ - Eski paket kullanma!
const { GoogleGenerativeAI } = require('@google/generative-ai');  // KULLANMA!
```

#### 2️⃣ **AI API Error Handling**

```javascript
// ✅ DOĞRU - Detaylı error handling
async function generateContent(prompt) {
  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text();

  } catch (error) {
    console.error('❌ AI API ERROR:', {
      errorMessage: error.message,
      errorCode: error.code,
      statusCode: error.statusCode,
      prompt: prompt.substring(0, 100),  // İlk 100 karakter
      timestamp: new Date().toISOString()
    });

    logger.error('AI generation failed', error, {
      promptLength: prompt.length,
      modelName: process.env.GEMINI_MODEL_NAME
    });

    // Rate limit error handling
    if (error.code === 429 || error.statusCode === 429) {
      throw new Error('AI API rate limit exceeded. Please try again later.');
    }

    throw new Error('AI content generation failed');
  }
}
```

#### 3️⃣ **AI Rate Limiting**

```javascript
// ✅ DOĞRU - Rate limit tracking
class AIRateLimiter {
  constructor(maxRequests = 60, windowMs = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = [];
  }

  async checkLimit() {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.windowMs);

    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = this.requests[0];
      const waitTime = this.windowMs - (now - oldestRequest);
      throw new Error(`Rate limit exceeded. Wait ${Math.ceil(waitTime / 1000)}s`);
    }

    this.requests.push(now);
  }
}

const aiLimiter = new AIRateLimiter(60, 60000);  // 60 requests per minute

async function callAI(prompt) {
  await aiLimiter.checkLimit();
  return await generateContent(prompt);
}
```

---

### KURAL 23: ÇEVRESELconfig.env) YÖNETİMİ

**❌ ASLA .ENV DOSYASINDA KAFANA GÖRE DEĞİŞİKLİK YAPMA!**

**ZORUNLU İŞ AKIŞI:**

1. **KULLANICIDAN ONAY AL** - Sormadan değiştirme!
2. **NETTEN ARAŞTIR** - Resmi docs oku
3. **LOCAL TEST ET** - Çalışıyor mu kontrol et
4. **PRODUCTION ETKİSİ** - Production'da bu variable var mı?

```bash
# ❌ YANLIŞ - Kafana göre parametre ekleme:
DATABASE_URL="postgres://...?custom_param=123"  # ← Araştırmadan ekleme!

# ✅ DOĞRU - Resmi dokümantasyondan kontrol et:
# 1. Supabase docs oku
# 2. Hangi parametreler destekleniyor?
# 3. Kullanıcıya sor
# 4. Test et
# 5. Ancak o zaman ekle
```

---

### KURAL 24: PRISMA ORM (İleride Database Eklersen)

**Eğer ileride database eklersen:**

#### 1️⃣ **ASLA Schema Okumadan Query Yazma**

```javascript
// ❌ YANLIŞ - Varsayım yapma:
const users = await prisma.user.findMany({
  where: { aktifMi: true },  // ← "aktifMi" var mı? BİLMİYORSUN!
  select: { ad: true }       // ← "ad" mı "adi" mi? BİLMİYORSUN!
});

// ✅ DOĞRU - Önce schema.prisma'yı TAM oku:
// Read prisma/schema.prisma
//
// model User {
//   id         String  @id @default(uuid())
//   isim       String  // ← "isim", "ad" değil!
//   silinmisMi Boolean @default(false)  // ← "silinmisMi", "aktifMi" yok!
// }

const users = await prisma.user.findMany({
  where: { silinmisMi: false },  // ✓ Schema'dan kopyaladım
  select: { isim: true }         // ✓ Schema'dan kopyaladım
});
```

#### 2️⃣ **Database Güvenlik - CANLI VERİ**

```bash
# ❌ ASLA ÇALIŞTIRMA (Tüm veri silinir!):
npx prisma migrate reset
npx prisma migrate reset --force
npx prisma db push --force-reset

# ✅ GÜVENLİ Komutlar:
npx prisma migrate dev --create-only --name migration_name  # Migration oluştur
npx prisma migrate deploy  # Production'a uygula
npx prisma generate  # Client oluştur
```

---

### KURAL 25: API AUTH PATTERN (İleride API Eklersen)

**Eğer ileride authentication eklersen:**

```javascript
// ✅ DOĞRU - Middleware pattern
function requireAuth(req, res, next) {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    // Token verify
    const decoded = verifyToken(token);
    req.user = decoded;  // ← User bilgisini req'e ekle

    next();

  } catch (error) {
    logger.error('Auth middleware error', error);
    res.status(401).json({
      success: false,
      error: 'Invalid or expired token'
    });
  }
}

// Kullanım:
app.get('/api/protected', requireAuth, (req, res) => {
  const userId = req.user.id;  // ✓ Middleware'den geldi
  // ...
});
```

---

### KURAL 26: ÖNCE MEVCUT PAKETE BAK, SONRA YENİ PAKET EKLE!

**ASLA yeni paket eklemeden önce mevcut paketleri kontrol etmeden geçme!**

```bash
# ✅ HER YENİ PAKET EKLEYİŞİNDE:

# 1. Mevcut paketlere bak:
Read package.json

# 2. Gerekli paket VAR MI kontrol et:
# - axios var mı? (HTTP client)
# - electron-log var mı? (Logging)
# - date-fns var mı? (Date utilities)

# 3. YOKSA kullanıcıya sor:
"❓ Bu özellik için X paketi gerekli. Ekleyeyim mi?"

# 4. ONAY ALDIKTAN SONRA ekle:
npm install package-name

# 5. Commit message'da belirt:
git commit -m "chore(deps): add package-name

- Why: [Neden eklendi]
- Usage: [Nerede kullanılacak]
- Size: [Bundle size impact]
"
```

---

## 🔥 GENEL KURALLAR (Tüm Projeler İçin)

### KURAL 9: "YAPTIM" KURALINI ASLA UNUTMA!

**KRİTİK:** Component/feature yazdıktan sonra **MUTLAKA** test et, sonra "yaptım" de!

**❌ YAPILMAMASI GEREKENLER:**
```javascript
// Component yazdım ama:
- Import etmedim → YANLIŞ!
- Entegre etmedim → YANLIŞ!
- Test etmedim → YANLIŞ!
- "Yaptım" dedim → FELAKET!
```

**✅ DOĞRU İŞ AKIŞI:**
1. Component/feature yaz
2. **Import et, entegre et**
3. **App'te test et - gerçekten çalışıyor mu?**
4. **Console loglarını kontrol et - hata var mı?**
5. Ancak o zaman "yaptım" de

---

### KURAL 10: AWAIT/ASYNC - ASYNC FONKSIYON = MUTLAKA AWAIT!

**❌ YANLIŞ:**
```javascript
const token = getAuthToken();  // async function! ❌ Promise döner
const data = fetchData();      // async function! ❌ undefined!

fetchData();  // await yok! ❌ Data gelmeden devam eder
```

**✅ DOĞRU:**
```javascript
const token = await getAuthToken();  // ✓ Değeri bekle
const data = await fetchData();      // ✓ Data gelsin

await fetchData();  // ✓ İşlem tamamlanana kadar bekle
```

---

### KURAL 11: STATE MANAGEMENT - Library Behavior'ını ANLA!

**KRİTİK:** 3rd party library kullanıyorsan **davranışını öğren**, varsayımlarda bulunma!

**KURAL:**
- Data değiştiğinde **ilgili state'leri temizle**
- Library documentation OKU
- Behavior'ı ANLA, varsayımlarda bulunma
- Test et, beklenmedik durumları kontrol et

---

### KURAL 12: CLEAN CODE / DRY PRINCIPLE - KOD TEKRARI YASAK!

**❌ BERBAT KOD:**
```javascript
// ❌ AYNI KOD 3 KERE!
if (case1) {
  // ... 20 satır kod
}
else if (case2) {
  // ... AYNI 20 satır kod  ← TEKRAR!
}
```

**✅ TEMİZ KOD:**
```javascript
// ✅ HELPER FUNCTION
function processData(data) {
  // 20 satır kod - SADECE 1 KERE!
}

if (case1) processData(data1);
else if (case2) processData(data2);
```

**KURAL:** Aynı kod 2+ kere → Helper function yaz!

---

### KURAL 13: COMPONENT ENTEGRASYONU CHECKLİST

**✅ COMPONENT ENTEGRASYON CHECKLİST:**
- [ ] Component dosyası yazıldı mı?
- [ ] **Import edildi mi?**
- [ ] **State eklendi mi?** (gerekiyorsa)
- [ ] **Kullanıldı mı?** (JSX/kod içinde)
- [ ] **Event handler'lar bağlandı mı?**
- [ ] **App'te test edildi mi?** (gerçekten görünüyor mu?)
- [ ] **Fonksiyonellik test edildi mi?** (çalışıyor mu?)

---

### KURAL 14: ERROR HANDLING - DETAYLI LOG!

**❌ YANLIŞ:**
```javascript
catch (error) {
  logger.error('Hata oluştu');  // ← HANGİ HATA? NEREDE?
}
```

**✅ DOĞRU:**
```javascript
catch (error) {
  console.error('❌ DETAILED ERROR:', {
    errorMessage: error.message,
    errorCode: error.code,
    stack: error.stack?.split('\n')[0],
    context: { id, filename }
  });

  logger.error('Operation failed', error, {
    context: { id, filename }
  });
}
```

**KURAL:** `error.message` + `error.code` + `stack` + `context`!

---

### KURAL 15: JAVASCRIPT = TYPE SAFETY YOK → LOG HER ŞEY!

**KRİTİK:** JavaScript - type safety YOK, runtime hatalar LOG olmadan DEBUG İMKANSIZ!

**✅ ÇÖZÜM - HER YERE DETAYLI LOG:**
```javascript
function deleteItem(id) {
  try {
    // LOG parametreleri - TİP KONTROLÜ YOK, LOG VAR!
    console.log('🔍 DELETE:', {
      id,
      typeOfId: typeof id,
      isValid: typeof id === 'string' && id.length > 0
    });

    return database.delete(id);
  } catch (error) {
    // LOG hatayı + context + tip bilgisi
    console.error('❌ DELETE ERROR:', {
      errorMessage: error.message,
      receivedId: id,
      typeOfId: typeof id,
      stack: error.stack?.split('\n')[0]
    });
    throw error;
  }
}
```

**KURAL:** Type kontrolü yok → LOG kontrolü VAR!

---

### KURAL 16: PAKET-ÖNCELİKLİ GELİŞTİRME

**Custom kod yazmadan önce NPM paketi ara!**

**Yeni özellik yazarken:**
1. Önce mevcut paketlere bak (`package.json`)
2. Yaygın paket ara (100k+ haftalık download)
3. Uygun paket YOKSA custom kod yaz

**Faydaları:**
- Battle-tested (milyonlarca proje)
- Sürekli güncelleme ve güvenlik
- Performans optimize
- Zaman kazancı

---

### KURAL 17: TUTARLILIK VE NETLİK - SORU SOR, SALLAMA!

**ZORUNLU DAVRANIŞLAR:**

#### 1️⃣ **KURALLARA SADAKAT (Her Oturumda)**
- ✅ CLAUDE.md kurallarını takip et
- ✅ Her oturum = Aynı kurallar!
- ❌ ASLA kural dışına çıkma

#### 2️⃣ **TUTARSIZLIK → SORU SOR!**
```javascript
// ✅ DOĞRU YAKLAŞIM:
"❓ Tutarsızlık tespit ettim:
- Plan: Sidebar 256px
- Talep: Sidebar 280px

Hangi değeri kullanayım?"

// ❌ YANLIŞ YAKLAŞIM:
"Tamam, 280px yapıyorum" ← SALLAMA!
```

#### 3️⃣ **NETLİK KAZANDIR (Muğlaklık → Soru)**
```javascript
// ❌ MUĞLAK: "Güzel yap"
// ✅ NETLEŞTİR: "Hangi yönden? Renk/Boyut/Animation?"
```

#### 4️⃣ **SALLAMA YOK - BİLMİYORSAN SÖYLEBİLİRSİN!**
```javascript
// ✅ DOĞRU (Dürüst):
"🤔 Emin değilim. Kontrol edeyim..."

// ❌ YANLIŞ (Sallama):
"Evet uyumlu" ← BİLMİYORSAN SALLAMA!
```

---

### KURAL 18: COMMIT-BY-COMMIT DEVELOPMENT - AI PERFORMANCE!

**AI ENGİNEERİNG PRENSİBİ:** Her özellik yazıldıktan sonra HEMEN commit yap!

**NEDEN ÇOK ÖNEMLİ:**
1. **AI Context Window Limiti** - Büyük değişiklikler → AI unutur
2. **Git History = AI Memory** - Commit messages → AI checkpoint'leri
3. **Rollback Kolaylığı** - Küçük commit → Kolay geri alma

**✅ DOĞRU COMMIT STRATEJİSİ:**
```bash
# HER ÖZELLİK AYRI COMMIT!
git add src/utils/helper.js
git commit -m "feat(utils): add data validation helper

- Email validation
- Phone validation
- Turkish ID validation

CLAUDE.md compliance:
- KURAL 12: DRY principle ✓
- KURAL 1: Try-catch in validators ✓

Files: 1
Lines: +120
Tested: ✓
"
```

**COMMIT SIZE GUIDE:**
- **Ideal:** 50-200 satır
- **İyi:** 200-500 satır
- **Kabul Edilebilir:** 500-1000 satır
- **Çok Büyük:** 1000+ satır ❌

---

### 🚨 KURAL 19: ASLA KULLANICI TALEBİ OLMADAN PUSH YAPMA!

```bash
# ✅ DOĞRU:
git commit -m "feat: description"
# → Commit yapıldı (local)
# → PUSH YAPMA! Kullanıcı talep edene kadar bekle!

# ❌ ASLA YAPMA:
git push  # ← YASAK! Kullanıcı talep etmedi!
```

**Neden:** Kullanıcı test etmek/gözden geçirmek isteyebilir!

---

### KURAL 20: TEST SCRIPT ORGANIZASYONU

**📁 TÜM TEST SCRIPTLERI `tests/` KLASÖRÜNDE!**

```
tablo_exporter/
├── tests/                    # ⭐ TÜM KALICI TESTLER
│   ├── README.md            # Test dokümantasyonu
│   ├── manual/              # Manuel test planları
│   ├── fixtures/            # Test data
│   └── results/             # Test outputs (.gitignore)
└── src/
```

**KALICI vs GEÇİCİ TEST:**
- **Kalıcı:** 30+ dakika hazırlık, tekrar kullanılacak → `tests/` klasöründe
- **Geçici:** < 10 dakika, tek kullanımlık → Kullan ve SİL!

---

### KURAL 27: ÇOKLU DİL DESTEĞİ (i18n - Internationalization)

**⚠️ Open-Source Projeler İçin KRİTİK!**

**ZORUNLU DURUM:** GitHub'a koyacaksan MUTLAKA Türkçe + İngilizce!

---

#### 1️⃣ **NE ZAMAN i18n EKLE?**

```javascript
// ✅ i18n EKLE:
- GitHub'a açık kaynak olarak koyulacaksa
- Uluslararası kullanıcı hedefleniyorsa
- Desktop/mobile app (birden fazla dilde kullanılabilir)

// ❌ i18n GEREKSİZ:
- Sadece tek şirket/kurum kullanacaksa
- Local/internal tool
- Prototype/demo
```

---

#### 2️⃣ **YAPILANDIRMA: Automatic OS-Based Detection**

**✅ EN İYİ YÖNTEM - Electron Apps:**

```javascript
// src/utils/i18n.js

const { app } = require('electron');

const translations = {
    tr: {
        'app.title': 'Evrensel Tablo Dışa Aktarıcı',
        'button.export': 'Export Et'
    },
    en: {
        'app.title': 'Universal Table Exporter',
        'button.export': 'Export'
    }
};

let currentLanguage = 'en';

function detectLanguage() {
    const locale = app.getLocale(); // "tr", "tr-TR", "en-US"
    const baseLang = locale.split('-')[0].toLowerCase();

    currentLanguage = translations[baseLang] ? baseLang : 'en';
    return currentLanguage;
}

function t(key) {
    return translations[currentLanguage]?.[key] || key;
}

detectLanguage(); // Auto-detect on load

module.exports = { t, detectLanguage };
```

**Main Process (src/main.js):**
```javascript
const { t } = require('./utils/i18n');

mainWindow = new BrowserWindow({
    title: t('app.title'),  // Auto-translated based on OS
    // ...
});
```

**Renderer Process (src/renderer.js):**
```javascript
// IPC communication to get translations
async function t(key) {
    return new Promise((resolve) => {
        ipcRenderer.send('get-translation', key);
        ipcRenderer.once('get-translation-reply', (_event, data) => {
            resolve(data.translation);
        });
    });
}

// Usage:
const buttonText = await t('button.export');
```

**HTML (index.html):**
```html
<!-- Use data-i18n attribute -->
<h1>
    <span data-i18n="app.title">Universal Table Exporter</span>
</h1>

<button data-i18n="button.export">Export</button>

<script>
    async function translateUI() {
        const elements = document.querySelectorAll('[data-i18n]');
        for (const el of elements) {
            const key = el.getAttribute('data-i18n');
            el.textContent = await t(key);
        }
    }
</script>
```

---

#### 3️⃣ **ALTERNATİF YÖNTEMLER**

**A) English Only + README.tr.md (Basit Projeler)**

```bash
# Sadece README'yi çevir, UI İngilizce kalsın
project/
├── README.md          # English (primary)
├── README.tr.md       # Turkish translation
└── src/               # UI: English only
```

**B) Manual Language Toggle (Web Apps)**

```html
<!-- Language selector dropdown -->
<select onchange="changeLanguage(this.value)">
    <option value="en">English</option>
    <option value="tr">Türkçe</option>
</select>

<script>
    function changeLanguage(lang) {
        localStorage.setItem('language', lang);
        location.reload();
    }
</script>
```

---

#### 4️⃣ **BEST PRACTICES**

**✅ YAPILANDIR:**

```javascript
// ✅ Centralized translations file
src/utils/i18n.js  // Tek dosyada tüm çeviriler

// ✅ Structured keys (nested)
{
    'button.export': 'Export',
    'button.save': 'Save',
    'error.noTables': 'No tables found',
    'error.exportFailed': 'Export failed'
}

// ✅ Fallback to English
if (!translations[lang]) {
    lang = 'en';  // Always fallback
}

// ✅ Log language detection
console.log('🌍 Language detected:', locale);
```

**❌ YAPMA:**

```javascript
// ❌ Hardcoded strings scattered everywhere
alert('Tablo bulunamadı!');  // BAD!

// ❌ Mixed languages in code
const title = 'Export Table';  // BAD! Use t('button.export')

// ❌ No fallback
const text = translations[lang][key];  // Throws error if missing!
```

---

#### 5️⃣ **TRANSLATION DICTIONARY TEMPLATE**

```javascript
const translations = {
    tr: {
        // App
        'app.title': 'Başlık',
        'app.description': 'Açıklama',

        // Buttons
        'button.export': 'Export Et',
        'button.save': 'Kaydet',
        'button.cancel': 'İptal',

        // Status
        'status.ready': 'Hazır',
        'status.loading': 'Yükleniyor...',

        // Errors
        'error.noTables': 'Tablo bulunamadı!',
        'error.exportFailed': 'Export başarısız!'
    },
    en: {
        // App
        'app.title': 'Title',
        'app.description': 'Description',

        // Buttons
        'button.export': 'Export',
        'button.save': 'Save',
        'button.cancel': 'Cancel',

        // Status
        'status.ready': 'Ready',
        'status.loading': 'Loading...',

        // Errors
        'error.noTables': 'No tables found!',
        'error.exportFailed': 'Export failed!'
    }
};
```

---

#### 6️⃣ **COMMIT CHECKLIST**

```bash
# i18n ekledikten sonra:
✓ src/utils/i18n.js oluşturuldu
✓ Main process entegre edildi
✓ Renderer process entegre edildi
✓ HTML data-i18n attribute'ları eklendi
✓ README.md (English) + README.tr.md (optional)
✓ OS locale detection test edildi
✓ Fallback to English test edildi

# Test:
✓ Turkish system → Turkish UI
✓ English system → English UI
✓ Other system → English UI (fallback)
```

---

#### 7️⃣ **WHEN TO ADD LANGUAGE?**

**Priority 1 (MUST):**
- Turkish (tr) → Native language
- English (en) → GitHub lingua franca

**Priority 2 (Optional):**
- Spanish (es) → 2nd most spoken
- French (fr) → Academic/business
- German (de) → Europe

**Priority 3 (Advanced):**
- Chinese (zh) → Asia market
- Japanese (ja) → Tech community
- Russian (ru) → Eastern Europe

---

#### 8️⃣ **TOOLS & PACKAGES**

```javascript
// ✅ Custom i18n (Bu projede kullanılan)
// - Lightweight
// - Zero dependency
// - Perfect for simple apps

// ✅ i18next (Advanced projects)
npm install i18next

// ✅ react-intl (React apps)
npm install react-intl

// ❌ OVERKILL for simple apps
// - Too many dependencies
// - Complicated setup
```

---

#### 9️⃣ **README TEMPLATE**

```markdown
# 🌍 Multi-Language Support

This application automatically detects your system language and displays the interface accordingly.

**Supported Languages:**
- 🇹🇷 Turkish (Türkçe) - Native
- 🇺🇸 English - Default

**Language Detection:**
- **Windows:** System locale (Settings → Time & Language)
- **Linux:** `echo $LANG`
- **macOS:** System Preferences → Language & Region

**Fallback:** If your language is not supported, the app defaults to English.

---

# 🌍 Çoklu Dil Desteği

Bu uygulama sistem dilinizi otomatik algılar ve arayüzü buna göre gösterir.

**Desteklenen Diller:**
- 🇹🇷 Türkçe - Ana dil
- 🇺🇸 İngilizce - Varsayılan

**Dil Algılama:**
- **Windows:** Sistem dili (Ayarlar → Saat ve Dil)
- **Linux:** `echo $LANG`
- **macOS:** Sistem Tercihleri → Dil ve Bölge

**Yedek:** Diliniz desteklenmiyorsa uygulama İngilizce olarak açılır.
```

---

## 🎯 ÖZET - Core Principles

**"Test etmeden 'yaptım' deme!"** ← KURAL 9
**"Async function = await, istisna yok!"** ← KURAL 10
**"Library behavior'ını anla!"** ← KURAL 11
**"Kod tekrarı = refactor!"** ← KURAL 12
**"Yarım iş bırakma!"** ← KURAL 13
**"Error'ları detaylı logla!"** ← KURAL 14
**"JavaScript = Type safety yok, LOG her şey!"** ← KURAL 15
**"Paket önce, custom kod sonra!"** ← KURAL 16
**"Tutarsızlık varsa sor!"** ← KURAL 17
**"Commit-by-commit = AI performance!"** ← KURAL 18
**"Push YASAK! (Kullanıcı talep edene kadar)"** ← KURAL 19
**"Test scriptleri organize!"** ← KURAL 20
**"GitHub = Türkçe + İngilizce (OS-based auto)"** ← KURAL 27

---

**Developed with ❤️ by Claude AI**

*Last updated: 2025-01-06*
*Adapted from Riskmatik 3.0 best practices*
