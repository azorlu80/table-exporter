# 📊 Table Exporter

**Export web tables to CSV/Excel when built-in export fails.**

Desktop app that extracts table data from any website, especially useful when native export features are broken.

## ✨ Features

- 🎯 **Auto-detection** - ExtJS Grid, HTML Table, Div-based grids
- 🌍 **Multi-language** - Turkish/English (auto-detected from OS)
- 🛠️ **8 Export Tools** - Multiple fallback strategies
- 🔐 **Local-only** - No data sent to external servers
- 💾 **UTF-8 BOM** - Perfect Turkish character support in Excel

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run application
npm start
```

## 📖 Usage

1. Navigate to your target website
2. Login (session persists)
3. Find the table you want to export
4. Click **"Export Table"** button
5. If auto-detection fails, try other tools from **▼ menu**
6. Save as CSV and open in Excel

## 🛠️ Export Tools

| Tool | Description |
|------|-------------|
| Auto Export | Tries all methods sequentially (recommended) |
| Manual Selector | Click on table to select |
| Selection Export | Export selected text (copy-paste) |
| Scan All Tables | List all tables on page |
| ExtJS Only | For Sencha ExtJS applications |
| HTML Only | For standard HTML tables |
| Div Grid Only | For modern framework tables |

## 🌍 Multi-Language

Automatically detects your system language:
- 🇹🇷 Turkish system → Turkish UI
- 🇬🇧 English system → English UI
- 🌐 Others → English UI (default)

## 📦 Tech Stack

- **Electron** - Desktop framework
- **Node.js** - Backend runtime
- **JavaScript** - Pure JS, no frameworks

## 📝 License

MIT License - see [LICENSE](LICENSE)

---

🇹🇷 **Türkçe döküman için:** [README.tr.md](README.tr.md)
