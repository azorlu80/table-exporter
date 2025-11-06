# 🧪 Manuel Test Planı

## Test Ortamı

- **Uygulama:** Hastane Yönetim Sistemi Yardımcı Aracı v1.0.0
- **Test Platformu:** Linux / Windows
- **Hedef Site:** http://10.7.72.22:8000/YoneticiTakip/Home

---

## Test Senaryoları

### 1. ✅ Temel İşlevsellik Testleri

#### 1.1 Uygulama Başlatma
- [ ] `npm start` komutu ile uygulama açılıyor
- [ ] Pencere boyutu 1400x900 olarak açılıyor
- [ ] Başlık "Hastane Yönetim Sistemi Yardımcı Aracı" görünüyor
- [ ] Talimatlar ekranı otomatik açılıyor

#### 1.2 Tarayıcı Navigasyonu
- [ ] URL kutusuna adres yazılabiliyor
- [ ] "Git" butonu ile sayfaya gidiliyor
- [ ] "◀ Geri" butonu çalışıyor
- [ ] "▶ İleri" butonu çalışıyor
- [ ] "↻ Yenile" butonu sayfayı yeniliyor

#### 1.3 Login ve Session
- [ ] Hastane sistemine normal login yapılabiliyor
- [ ] Kullanıcı adı ve şifre ile giriş başarılı
- [ ] Session korunuyor (uygulamayı kapatıp açınca login gerekmiyor)
- [ ] Cookie'ler saklanıyor

---

### 2. 📊 Tablo Export Testleri

#### 2.1 ExtJS Grid Export
**Test Adımları:**
1. Login ol
2. Sol menüden "Poliklinik" → herhangi bir rapor seç
3. Tablo tamamen yüklensin
4. "📊 Tabloyu Export Et" butonuna tıkla

**Beklenen Sonuç:**
- [ ] Tablo(lar) bulundu
- [ ] ExtJS Grid olarak tanındı
- [ ] CSV başarıyla kaydedildi
- [ ] Dosya Excel ile açılıyor
- [ ] Türkçe karakterler doğru görünüyor
- [ ] Sütun başlıkları doğru
- [ ] Veri sayısı doğru

#### 2.2 HTML Table Export
**Test Adımları:**
1. HTML tablo içeren bir sayfaya git
2. "📊 Tabloyu Export Et" butonuna tıkla

**Beklenen Sonuç:**
- [ ] HTML Table olarak tanındı
- [ ] Export başarılı

#### 2.3 Çoklu Tablo Seçimi
**Test Adımları:**
1. Birden fazla tablo olan bir sayfaya git
2. "📊 Tabloyu Export Et" butonuna tıkla
3. Tablo seçim ekranı açılsın
4. Bir tablo seç

**Beklenen Sonuç:**
- [ ] Tüm tablolar listelendi
- [ ] Her tablo için satır/sütun sayısı gösteriliyor
- [ ] Tablo tipi (ExtJS, HTML, Div) belirtiliyor
- [ ] Seçilen tablo başarıyla export edildi

#### 2.4 Fallback Mekanizmaları
**Test Adımları:**
1. Div-based grid yapısı olan sayfaya git
2. Export et

**Beklenen Sonuç:**
- [ ] Div Grid olarak tanındı ve export edildi
- [ ] ExtJS bulunamazsa HTML denedi
- [ ] HTML bulunamazsa Div denedi

---

### 3. 🔧 Hata Yönetimi Testleri

#### 3.1 Tablo Bulunamama
**Test Adımları:**
1. Tablo olmayan bir sayfaya git
2. Export butonuna tıkla

**Beklenen Sonuç:**
- [ ] "Sayfada hiç tablo bulunamadı" mesajı gösterildi
- [ ] Uygulama crash olmadı

#### 3.2 Yükleme Sırasında Export
**Test Adımları:**
1. Bir sayfaya git
2. Henüz yüklenmeden export butonuna tıkla

**Beklenen Sonuç:**
- [ ] Buton disabled durumda
- [ ] Yükleme bitene kadar bekliyor

#### 3.3 Network Hatası
**Test Adımları:**
1. Geçersiz URL gir
2. Git butonuna tıkla

**Beklenen Sonuç:**
- [ ] Hata mesajı gösteriliyor
- [ ] Uygulama crash olmadı

---

### 4. 🎨 UI/UX Testleri

#### 4.1 Görsel Test
- [ ] Renk şeması tutarlı
- [ ] Fontlar okunabilir
- [ ] Butonlar responsive
- [ ] Modal'lar doğru açılıp kapanıyor
- [ ] Loading animasyonu çalışıyor
- [ ] Status bar güncellemeleri doğru

#### 4.2 Animasyonlar
- [ ] Talimatlar ekranı smooth açılıyor/kapanıyor
- [ ] Modal animasyonları çalışıyor
- [ ] Loading spinner dönüyor
- [ ] Status dot pulse yapıyor

---

### 5. 🔐 Güvenlik Testleri

#### 5.1 User Agent
**Kontrol:**
- [ ] WebView User-Agent Chrome olarak ayarlanmış
- [ ] Hastane sistemi loglarında "Electron" görünmüyor
- [ ] Normal tarayıcı gibi davranıyor

#### 5.2 Session Yönetimi
- [ ] Cookie'ler güvenli saklanıyor
- [ ] Session localStorage'da persist ediliyor
- [ ] Şifreler kaydedilmiyor

---

### 6. 📁 Dosya İşlemleri Testleri

#### 6.1 CSV Kaydetme
- [ ] Kaydet dialog'u açılıyor
- [ ] Varsayılan dosya adı timestamp ile
- [ ] Dosya seçilen konuma kaydediliyor
- [ ] UTF-8 BOM ekleniyor (Türkçe karakterler için)

#### 6.2 Dosya İçeriği
- [ ] CSV formatı doğru
- [ ] Sütunlar virgülle ayrılmış
- [ ] Satırlar newline ile ayrılmış
- [ ] Özel karakterler escape edilmiş
- [ ] Excel'de düzgün açılıyor

---

### 7. 📊 Performans Testleri

#### 7.1 Büyük Tablolar
**Test:**
- [ ] 1000+ satırlı tablo export ediliyor
- [ ] 50+ sütunlu tablo export ediliyor
- [ ] Export süresi < 5 saniye
- [ ] Bellek kullanımı makul

#### 7.2 Çoklu Export
**Test:**
- [ ] Arka arkaya 5 tablo export edilebiliyor
- [ ] Her export bağımsız çalışıyor
- [ ] Memory leak yok

---

### 8. 🪵 Logging Testleri

#### 8.1 Log Dosyaları
**Kontrol:**
- [ ] Log dosyası oluşuyor: `~/.config/hastane-yonetim-sistemi-yardimci-araci/logs/app.log`
- [ ] Info logları yazılıyor
- [ ] Error logları stack trace ile yazılıyor
- [ ] Timestamp formatı doğru

#### 8.2 Console Çıktıları
- [ ] Renderer process logları console'da görünüyor
- [ ] Main process logları dosyaya yazılıyor
- [ ] Error'lar düzgün format edilmiş

---

## Test Geçiş Kriterleri

### Kritik (Fail = Release Yapılamaz)
- ✅ Login çalışmalı
- ✅ En az bir tablo türü export edilebilmeli
- ✅ CSV dosyası Excel'de açılmalı
- ✅ Türkçe karakterler doğru görünmeli
- ✅ Uygulama crash olmamalı

### Önemli (Fail = Fix Gerekli)
- ⚠️ User Agent doğru ayarlanmalı
- ⚠️ Session persist edilmeli
- ⚠️ Çoklu tablo seçimi çalışmalı
- ⚠️ Hata mesajları anlaşılır olmalı

### İyi Olur (Fail = Kabul Edilebilir)
- 💡 Animasyonlar smooth olmalı
- 💡 Loading süreleri kısa olmalı
- 💡 Log dosyaları temiz formatlanmalı

---

## Test Sonuçları

### Test Tarihi: __________
### Test Eden: __________
### Versiyon: v1.0.0

| Test | Sonuç | Notlar |
|------|-------|--------|
| 1.1 Başlatma | ☐ Pass / ☐ Fail | |
| 1.2 Navigasyon | ☐ Pass / ☐ Fail | |
| 1.3 Login | ☐ Pass / ☐ Fail | |
| 2.1 ExtJS Export | ☐ Pass / ☐ Fail | |
| 2.2 HTML Export | ☐ Pass / ☐ Fail | |
| 2.3 Çoklu Tablo | ☐ Pass / ☐ Fail | |
| 2.4 Fallback | ☐ Pass / ☐ Fail | |
| 3.x Hata Yönetimi | ☐ Pass / ☐ Fail | |
| 4.x UI/UX | ☐ Pass / ☐ Fail | |
| 5.x Güvenlik | ☐ Pass / ☐ Fail | |
| 6.x Dosya İşlemleri | ☐ Pass / ☐ Fail | |
| 7.x Performans | ☐ Pass / ☐ Fail | |
| 8.x Logging | ☐ Pass / ☐ Fail | |

### Genel Değerlendirme
- [ ] ✅ Release Ready
- [ ] ⚠️ Minor Fixes Needed
- [ ] ❌ Major Issues - Not Ready

### Notlar:
```
...
```
