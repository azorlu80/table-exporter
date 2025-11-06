# 📊 Universal Table Exporter

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Electron](https://img.shields.io/badge/Electron-31.0.0-47848F.svg?logo=electron)
![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20Linux%20%7C%20macOS-lightgrey.svg)

**A universal desktop tool for exporting web tables to CSV/Excel when built-in export functionality fails.**

[Features](#-features) •
[Installation](#-installation) •
[Usage](#-usage) •
[Table Support](#-supported-table-types) •
[Contributing](#-contributing) •
[License](#-license)

</div>

---

## 📖 Overview

Universal Table Exporter is an open-source Electron-based desktop application designed to extract table data from web applications and export them to CSV/Excel format. This tool is particularly useful when:

- 🚫 Built-in PDF/Excel export features are broken
- 🔒 Web applications lack export functionality
- 🌐 Working with complex JavaScript frameworks (ExtJS, React, Angular, etc.)
- 🏥 Dealing with enterprise management systems (Hospital, ERP, CRM)
- 📊 Need to extract data from dynamically loaded tables

### 🎯 Problem Statement

Many web-based management systems (especially legacy enterprise software) have broken or non-existent table export features due to:
- Developer errors in implementation
- Outdated JavaScript libraries
- Complex framework-specific table components
- Session/authentication issues

This tool solves these problems by providing a **universal table extraction engine** with multiple fallback strategies.

---

## ✨ Features

### Core Functionality
- ✅ **Universal Table Detection** - Automatically detects and extracts tables from any website
- ✅ **Multi-Framework Support** - ExtJS Grid, HTML Table, Div-based grids, and more
- ✅ **Intelligent Fallback Chain** - If one method fails, automatically tries alternatives
- ✅ **UTF-8 BOM Support** - Perfect Turkish character support in Excel
- ✅ **Session Persistence** - Login once, use indefinitely (cookies preserved)
- ✅ **User-Agent Spoofing** - Appears as Chrome browser to avoid detection
- ✅ **Embedded Chromium** - Full browser experience within the app

### Technical Features
- 🔐 **Local-Only Processing** - All data processing happens locally (zero external requests)
- 🚀 **Fast Performance** - Handles tables with thousands of rows instantly
- 📝 **Detailed Logging** - Comprehensive logs for debugging (electron-log)
- 🛡️ **Error Handling** - Graceful degradation with user-friendly error messages
- 💾 **No Data Storage** - No user data is ever saved or transmitted

---

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- Git (optional)

### Quick Start

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/tablo_exporter.git
cd tablo_exporter

# Install dependencies
npm install

# Run the application
npm start
```

### Alternative: Download Binary (Coming Soon)
Pre-built binaries will be available for:
- Windows (`.exe`)
- Linux (`.AppImage`)
- macOS (`.dmg`)

---

## 🚀 Usage

### Step 1: Launch Application
```bash
npm start
```

The application opens with an embedded browser (WebView).

### Step 2: Navigate & Login
1. Navigate to your target web application
2. Login with your credentials
3. Your session will be automatically preserved

### Step 3: Find Your Table
- Navigate to the page containing the table
- Wait for the table to fully load
- Ensure the table is visible on screen

### Step 4: Export
1. Click the **"📊 Export Table"** button (top toolbar)
2. If multiple tables are detected, select the desired one
3. Choose save location
4. Done! Open the CSV file in Excel

### Example Workflow (Hospital Management System)

```
1. Start app → npm start
2. Navigate → http://hospital-system.local/reports
3. Login → username: doctor1, password: ******
4. Select report → Patient Records → Daily Report
5. Wait for table load → ✓ Loaded (250 rows)
6. Click Export → Save as: daily_report_2025-01-06.csv
7. Open in Excel → ✓ All data + Turkish characters perfect!
```

---

## 📊 Supported Table Types

### 1. ExtJS Grid (Priority)
```javascript
// Detected via Ext.ComponentQuery
Ext.ComponentQuery.query('gridpanel')
```
**Example:** Sencha ExtJS applications, legacy enterprise systems

**Features:**
- Column header extraction
- Data renderer support
- Hidden column filtering
- Store-based data extraction

### 2. HTML Table (Standard)
```html
<table>
  <thead>
    <tr><th>Name</th><th>Age</th></tr>
  </thead>
  <tbody>
    <tr><td>John</td><td>25</td></tr>
  </tbody>
</table>
```
**Example:** Wikipedia, standard web pages

### 3. Div-Based Grids (Fallback)
```html
<div class="grid">
  <div class="row">
    <div class="cell">Data</div>
  </div>
</div>
```
**Example:** Modern React/Angular data tables, custom implementations

### 4. Manual Text Selection (Last Resort)
If all automated methods fail, users can manually select and copy table text.

---

## 🏗️ Architecture

### Tech Stack
- **Electron** - Desktop framework (Chromium + Node.js)
- **electron-log** - Professional logging system
- **Node.js** - Backend runtime
- **JavaScript** - Primary language

### Project Structure
```
tablo_exporter/
├── src/
│   ├── main.js                     # Main process (Electron)
│   ├── renderer.js                 # Renderer process (UI logic)
│   └── utils/
│       ├── logger.js               # Logging utility
│       ├── tableExtractor.js       # Legacy extractor
│       └── tableExtractorAdvanced.js # Advanced multi-strategy extractor
├── tests/
│   ├── manual/
│   │   ├── TEST_PLAN.md           # Comprehensive test checklist
│   │   └── TEST_URLS.md           # Test URLs
│   ├── fixtures/
│   │   └── test-table.html        # Local test scenarios (5 cases)
│   └── results/                   # Test outputs (.gitignored)
├── index.html                     # Main UI
├── package.json                   # Dependencies & scripts
├── README.md                      # This file
├── CLAUDE.md                      # Coding guidelines
└── .gitignore                     # Git ignore rules
```

### Data Flow
```
┌─────────────┐
│  User Input │ → Navigate to website
└──────┬──────┘
       │
┌──────▼──────────────────────────┐
│  WebView (Embedded Chromium)    │ → Load page + Execute JS
└──────┬──────────────────────────┘
       │
┌──────▼──────────────────────────┐
│  Table Detection Engine         │
│  1. ExtJS Grid                  │ → Try each method
│  2. HTML Table                  │
│  3. Div Grid                    │
└──────┬──────────────────────────┘
       │
┌──────▼──────────────────────────┐
│  CSV Generation                 │ → UTF-8 BOM + Escaping
└──────┬──────────────────────────┘
       │
┌──────▼──────────────────────────┐
│  File Save Dialog               │ → Save to disk
└──────────────────────────────────┘
```

---

## 🔐 Security & Privacy

### Data Privacy
- ✅ **Zero External Requests** - No data leaves your computer
- ✅ **Local Processing** - All extraction happens locally
- ✅ **No Analytics** - No tracking or telemetry
- ✅ **No Cloud Storage** - Data never uploaded anywhere

### Credentials
- ⚠️ **Passwords NOT Stored** - Only session cookies are preserved
- ⚠️ **Session Local Only** - Stored in local Electron partition
- ⚠️ **User Agent Spoofing** - App appears as Chrome (for compatibility)

### Security Best Practices
- All async operations wrapped in try-catch
- Detailed error logging (local only)
- Graceful error handling
- No eval() or remote code execution

---

## 🧪 Testing

### Manual Test Plan
```bash
# 1. Test with local fixture (fast)
npm start
# → Navigate to: file:///path/to/tests/fixtures/test-table.html
# → Test 5 scenarios: Simple, Turkish, Large, Multiple, Special chars

# 2. Test with public sites
# → Wikipedia tables
# → CosmoCode ExtJS demo
# → W3Schools HTML tables

# 3. Test with target system (if accessible)
# → Hospital management system
# → ERP systems
# → Custom applications
```

Detailed test plan: [tests/manual/TEST_PLAN.md](tests/manual/TEST_PLAN.md)

---

## 🛠️ Development

### Dev Mode
```bash
npm run dev  # Runs with --enable-logging flag
```

### Build Executables
```bash
# Windows
npm run build-win

# Linux
npm run build-linux

# All platforms
npm run build
```

### Logging
Logs are saved to:
- **Windows:** `%USERPROFILE%\AppData\Roaming\hastane-tablo-exporter\logs\`
- **Linux:** `~/.config/hastane-tablo-exporter/logs/`
- **macOS:** `~/Library/Logs/hastane-tablo-exporter/`

---

## 🐛 Troubleshooting

### "No tables found" Error
**Symptoms:** Export button doesn't find any tables

**Solutions:**
1. Ensure table is visible on screen (scroll to it)
2. Wait for page to fully load (check loading indicators)
3. Refresh page (🔄 Refresh button) and try again
4. Check if table is inside an iframe (not currently supported)

### Empty CSV File
**Symptoms:** CSV file is empty or has only headers

**Solutions:**
1. Wait longer for dynamic content to load
2. Scroll down to trigger lazy-loading tables
3. Check if table uses JavaScript to load data (wait for AJAX)
4. Try a different export target (if multiple tables)

### Turkish Characters Broken in Excel
**Symptoms:** "Ç, Ğ, İ, Ö, Ş, Ü" appear as "Ã‡, ÄŸ" etc.

**Solutions:**
- This shouldn't happen! The tool adds UTF-8 BOM automatically
- If it does: Open CSV in Notepad, verify file starts with `ï»¿` (BOM)
- Alternative: In Excel, use "Data → From Text/CSV" and select UTF-8 encoding

### Session Expired
**Symptoms:** Redirected to login page repeatedly

**Solutions:**
- Session cookies are persistent, but server may expire them
- Simply login again (credentials not stored, must re-enter)
- Session will persist until app is closed or server invalidates it

---

## 🤝 Contributing

Contributions are welcome! This is an open-source project built with ❤️ for the community.

### How to Contribute

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Follow coding guidelines** (see [CLAUDE.md](CLAUDE.md))
4. **Test your changes** (manual test + fixtures)
5. **Commit with clear messages** (see commit format below)
6. **Push to your fork** (`git push origin feature/amazing-feature`)
7. **Open a Pull Request**

### Commit Message Format
```
type(scope): subject

body (optional)

footer (optional)
```

**Types:** `feat`, `fix`, `refactor`, `docs`, `test`, `chore`

**Example:**
```bash
git commit -m "feat(extractor): add support for React Table v8

- Detect react-table instances via data attributes
- Extract data from virtualized tables
- Handle column formatters

CLAUDE.md compliance:
- KURAL 1: Try-catch all async operations ✓
- KURAL 2: Logger with context ✓
- KURAL 12: DRY principle - shared helper functions ✓

Files: 2
Lines: +250/-10
Tested: ✓ Manual test with React Table demo
"
```

### Development Guidelines
Please read [CLAUDE.md](CLAUDE.md) for comprehensive coding standards including:
- Try-catch best practices
- Logger usage (context-aware)
- Error handling patterns
- IPC communication rules
- Commit guidelines
- Testing requirements

---

## 📚 Similar Projects & Inspiration

This project was inspired by and builds upon:

### Table Scraping Libraries
- [tabletojson](https://www.npmjs.com/package/tabletojson) - HTML table to JSON conversion
- [table-scraper](https://www.npmjs.com/package/table-scraper) - Scrape HTML tables
- [Ext.ux.Exporter](https://github.com/edspencer/Ext.ux.Exporter) - ExtJS grid exporter

### Electron Data Tools
- [electron-excel-dl](https://github.com/granieri/electron-excel-dl) - Excel workbook generator
- [SheetJS with Electron](https://docs.sheetjs.com/docs/demos/desktop/electron/) - Spreadsheet integration

### Key Differentiators
Unlike existing tools, Universal Table Exporter:
- ✅ Provides a **desktop GUI** (not CLI or library)
- ✅ Supports **multiple table types** with fallback strategies
- ✅ Includes **session management** for authenticated sites
- ✅ Works with **any website** (universal compatibility)
- ✅ **Zero configuration** - works out of the box

---

## 📄 License

MIT License

Copyright (c) 2025 Universal Table Exporter Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

---

## 👥 Authors & Contributors

### Created by
- **Ali** - *Initial work* - Hospital Management Systems Specialist

### Contributors
See the list of [contributors](https://github.com/YOUR_USERNAME/tablo_exporter/contributors) who participated in this project.

---

## 🙏 Acknowledgments

- Electron community for excellent documentation
- ExtJS community for grid extraction patterns
- SheetJS for spreadsheet format inspiration
- All contributors and users who report issues

---

## 📊 Project Stats

![GitHub stars](https://img.shields.io/github/stars/YOUR_USERNAME/tablo_exporter?style=social)
![GitHub forks](https://img.shields.io/github/forks/YOUR_USERNAME/tablo_exporter?style=social)
![GitHub issues](https://img.shields.io/github/issues/YOUR_USERNAME/tablo_exporter)
![GitHub pull requests](https://img.shields.io/github/issues-pr/YOUR_USERNAME/tablo_exporter)

---

## 🗺️ Roadmap

### v1.0.0 (Current)
- ✅ ExtJS Grid support
- ✅ HTML Table support
- ✅ Session management
- ✅ UTF-8 BOM support
- ✅ Basic logging

### v1.1.0 (Planned)
- ⬜ React Table v8 support
- ⬜ AG Grid support
- ⬜ iframe table detection
- ⬜ Multiple table batch export
- ⬜ Excel (.xlsx) direct export

### v1.2.0 (Future)
- ⬜ Browser extension version
- ⬜ CLI version for automation
- ⬜ Custom table selectors
- ⬜ Export templates
- ⬜ PDF export support

### v2.0.0 (Vision)
- ⬜ AI-powered table detection
- ⬜ Smart column mapping
- ⬜ Data transformation rules
- ⬜ Cloud sync (optional)

---

## 📞 Support

### Need Help?
- 📖 Check [Troubleshooting](#-troubleshooting) section
- 🐛 [Open an issue](https://github.com/YOUR_USERNAME/tablo_exporter/issues)
- 💬 [Discussions](https://github.com/YOUR_USERNAME/tablo_exporter/discussions)

### Found a Bug?
Please include:
- Steps to reproduce
- Expected vs actual behavior
- Screenshots/logs (from `AppData/Roaming/.../logs/`)
- OS and app version

### Feature Requests
We welcome feature requests! Open an issue with:
- Use case description
- Proposed solution
- Alternative solutions considered

---

<div align="center">

**Made with ❤️ by the community, for the community**

⭐ Star this repo if you find it useful!

[Report Bug](https://github.com/YOUR_USERNAME/tablo_exporter/issues) •
[Request Feature](https://github.com/YOUR_USERNAME/tablo_exporter/issues) •
[Contribute](CONTRIBUTING.md)

</div>
