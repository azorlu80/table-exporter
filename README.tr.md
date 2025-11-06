# 📊 Table Exporter

**Web tablolarını CSV/Excel formatına aktarın.**

Herhangi bir web sitesinden tablo verilerini çıkaran masaüstü uygulaması. Özellikle yerleşik export özellikleri çalışmadığında kullanışlıdır.

## ✨ Özellikler

- 🎯 **Otomatik algılama** - ExtJS Grid, HTML Table, Div tabanlı tablolar
- 🌍 **Çoklu dil** - Türkçe/İngilizce (sistem dilinden otomatik)
- 🛠️ **8 Export Aracı** - Birden fazla yedek strateji
- 🔐 **Yerel işlem** - Hiçbir veri dışarı gönderilmez
- 💾 **UTF-8 BOM** - Excel'de mükemmel Türkçe karakter desteği

## 🚀 Hızlı Başlangıç

```bash
# Bağımlılıkları yükle
npm install

# Uygulamayı çalıştır
npm start
```

## 📖 Kullanım

1. Hedef web sitesine git
2. Giriş yap (oturum kalıcı)
3. Export etmek istediğin tabloyu bul
4. **"Tablo Export"** butonuna tıkla
5. Otomatik algılama başarısız olursa **▼ menüden** diğer araçları dene
6. CSV olarak kaydet ve Excel'de aç

## 🛠️ Export Araçları

| Araç | Açıklama |
|------|----------|
| Otomatik Export | Tüm yöntemleri sırayla dener (önerilen) |
| Manuel Seçici | Tabloya tıklayarak seç |
| Seçim Export | Seçili metni export et (kopyala-yapıştır) |
| Tüm Tabloları Tara | Sayfadaki tüm tabloları listele |
| Sadece ExtJS | Sencha ExtJS uygulamaları için |
| Sadece HTML | Standart HTML tabloları için |
| Sadece Div Grid | Modern framework tabloları için |

## 🌍 Çoklu Dil

Sistem dilinizi otomatik algılar:
- 🇹🇷 Türkçe sistem → Türkçe arayüz
- 🇬🇧 İngilizce sistem → İngilizce arayüz
- 🌐 Diğer → İngilizce arayüz (varsayılan)

## 📦 Teknolojiler

- **Electron** - Masaüstü framework
- **Node.js** - Backend runtime
- **JavaScript** - Saf JS, framework yok

## 📝 Lisans

MIT Lisansı - detaylar için [LICENSE](LICENSE)

---

🇬🇧 **For English documentation:** [README.md](README.md)
