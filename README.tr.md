# Table Exporter

Web uygulamalarından tabloları CSV/Excel formatına aktaran masaüstü aracı.

## Neden?

Birçok eski web uygulamasında export özelliği bozuk veya eksik. Bu araç, tablo verilerini doğrudan tarayıcı DOM'undan çıkarır ve CSV formatına dönüştürür.

## Özellikler

- Otomatik tablo algılama (ExtJS, HTML tablolar, div tabanlı gridler)
- Çoklu export stratejisi (8 farklı yöntem)
- Türkçe ve İngilizce arayüz
- UTF-8 BOM desteği (Excel uyumluluğu)
- Oturum kalıcılığı (bir kez giriş yap, açık kalsın)

## Kurulum

```bash
npm install
npm start
```

## Kullanım

1. Uygulamayı aç
2. Hedef web sitesine git
3. Gerekirse giriş yap
4. "Tablo Export" butonuna tıkla
5. Listeden tabloyu seç
6. CSV olarak kaydet

Otomatik algılama başarısız olursa, açılır menüden (▼) alternatif yöntemleri dene:
- Manuel seçici (tabloya tıkla)
- Seçim export (kopyala-yapıştır)
- Tüm tabloları tara (ne var göster)

## Export Yöntemleri

Araç tabloları bulmak için birden fazla strateji dener:

- **ExtJS gridler** - `Ext.ComponentQuery` kullanır
- **HTML tablolar** - Standart `<table>` elementleri
- **Div gridler** - Modern framework tabloları (role="grid")

## Teknolojiler

Electron ve vanilla JavaScript ile geliştirildi. Framework gerektirmez.

## CSV Formatı

Çıktı dosyaları UTF-8 BOM encoding kullanır, böylece Türkçe karakterler (ç, ğ, ı, ö, ş, ü) Excel'de doğru görünür.

## Lisans

MIT

---

**İngilizce döküman:** [README.md](README.md)
