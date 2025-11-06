# Table Exporter

Desktop tool for exporting tables from web applications to CSV/Excel format.

## Why?

Many legacy web applications have broken or missing export features. This tool extracts table data directly from the browser DOM and converts it to CSV format.

## Features

- Automatic table detection (ExtJS, HTML tables, div-based grids)
- Multiple export strategies (8 different methods)
- Turkish and English interface
- UTF-8 BOM support for Excel compatibility
- Session persistence (login once, stays logged in)

## Installation

```bash
npm install
npm start
```

## Usage

1. Open the application
2. Navigate to your target website
3. Login if required
4. Click the "Export Table" button
5. Select the table from the list
6. Save as CSV

If automatic detection fails, use the dropdown menu (▼) to try alternative methods:
- Manual selector (click on table)
- Selection export (copy-paste data)
- Scan all tables (see what's available)

## Export Methods

The tool tries multiple strategies to find tables:

- **ExtJS grids** - Uses `Ext.ComponentQuery`
- **HTML tables** - Standard `<table>` elements
- **Div grids** - Modern framework tables (role="grid")

## Tech Stack

Built with Electron and vanilla JavaScript. No frameworks required.

## CSV Format

Output files use UTF-8 with BOM encoding, which ensures Turkish characters (ç, ğ, ı, ö, ş, ü) display correctly when opened in Excel.

## License

MIT

---

**Turkish documentation:** [README.tr.md](README.tr.md)
