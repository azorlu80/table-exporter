# 🌐 Test URL'leri

## Lokal Test

### Test Fixture (Auth Gerekmez)
```
file:///home/ali/Belgeler/Projects/tablo_exporter/tests/fixtures/test-table.html
```

**Test Senaryoları:**
- ✅ 5 farklı tablo türü
- ✅ Türkçe karakter testi
- ✅ Büyük tablo (100 satır)
- ✅ Çoklu tablo seçimi
- ✅ Özel karakterler

---

## Public Test Siteleri (Auth Gerekmez)

### 1. W3Schools Tables
```
https://www.w3schools.com/html/html_tables.asp
```
- Basit HTML tabloları
- Eğitim amaçlı
- Güvenilir

### 2. CosmoCode WebTable Example
```
https://cosmocode.io/automation-practice-webtable/
```
- 195 ülke tablosu
- Kompleks yapı
- Checkbox'lar var

### 3. Wikipedia
```
https://tr.wikipedia.org/wiki/T%C3%BCrkiye%27deki_iller_listesi
```
- Türkiye illeri tablosu
- Türkçe karakterler
- Gerçek veri

### 4. HTML Table Generator
```
https://www.tablesgenerator.com/html_tables
```
- Dinamik tablo oluşturma
- Export test için ideal
- Özelleştirilebilir

---

## Hastane Sistemi (Auth Gerekir)

### Production (Gerçek Veri)
```
http://10.7.72.22:8000/YoneticiTakip/Home
```

**Test Raporları:**
- Poliklinik → Muayene Bekleme Süresi
- ADSM → Gelir Takibi
- Laboratuvar → Tetkik Sonuç Süreleri
- Acil Servis → Başvuru Sayısı

**Dikkat:**
- ⚠️ Gerçek hasta verileri
- ⚠️ Production ortam
- ⚠️ Dikkatli test edin

---

## Test Öncelikleri

### 1. İlk Test (Offline)
```
file:// → test-table.html
```
- Hızlı test
- Network gerekmez
- Tüm senaryolar

### 2. İkinci Test (Online - Public)
```
https://cosmocode.io/automation-practice-webtable/
```
- Gerçek site
- Auth gerekmez
- Kompleks tablo

### 3. Son Test (Production)
```
http://10.7.72.22:8000/...
```
- Gerçek ortam
- ExtJS test
- Final validation

---

## Test Checklist

Her URL için:
- [ ] Sayfa açılıyor
- [ ] Tablo görünüyor
- [ ] Export butonu aktif
- [ ] Tablo bulundu
- [ ] CSV indirildi
- [ ] Excel'de açıldı
- [ ] Veriler doğru
- [ ] Türkçe karakterler OK

---

## Hata Senaryoları

### Test 1: Tablo Yok
```
https://google.com
```
Beklenen: "Sayfada hiç tablo bulunamadı" mesajı

### Test 2: Yükleme Hatası
```
http://invalid-url-12345.com
```
Beklenen: Network error, uygulama crash olmamalı

### Test 3: Slow Loading
```
https://httpstat.us/200?sleep=5000
```
Beklenen: Loading indicator gösterilmeli

---

## Test Çıktıları

Test sonuçları burada saklanır:
```
tests/results/
├── test-1-simple-table.csv
├── test-2-turkish-chars.csv
├── test-3-big-table.csv
├── test-4-multiple-tables-1.csv
├── test-4-multiple-tables-2.csv
├── test-4-multiple-tables-3.csv
└── test-5-special-chars.csv
```

Log dosyaları:
```
~/.config/hastane-yonetim-sistemi-yardimci-araci/logs/app.log
```
