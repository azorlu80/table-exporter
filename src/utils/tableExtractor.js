/**
 * Tablo Extraction Utility
 * ExtJS Grid ve HTML Table'ları extract eder
 */

const extractionScript = `
(function() {
    'use strict';

    // Utility fonksiyonlar
    const Utils = {
        cleanText(txt) {
            if (!txt) return '';
            return String(txt).replace(/\\s+/g, ' ').trim();
        },

        escapeCSV(text) {
            if (!text) return '""';
            text = String(text);
            text = text.replace(/"/g, '""');
            return '"' + text + '"';
        },

        getTimestamp() {
            const d = new Date();
            return d.getFullYear() + '-' +
                   String(d.getMonth() + 1).padStart(2, '0') + '-' +
                   String(d.getDate()).padStart(2, '0') + '_' +
                   String(d.getHours()).padStart(2, '0') + '-' +
                   String(d.getMinutes()).padStart(2, '0');
        }
    };

    // ExtJS Grid Extractor
    class ExtJSGridExtractor {
        static canExtract() {
            return typeof window.Ext !== 'undefined' &&
                   typeof Ext.ComponentQuery !== 'undefined';
        }

        static findGrids() {
            try {
                const grids = Ext.ComponentQuery.query('gridpanel');
                return grids || [];
            } catch (error) {
                console.error('ExtJS Grid query error:', error);
                return [];
            }
        }

        static extractGrid(grid, index = 0) {
            try {
                const store = grid.getStore();
                const columns = grid.getColumns();

                if (!store || !columns) {
                    throw new Error('Grid store veya columns bulunamadı');
                }

                const csv = [];
                const headers = [];
                const visibleColumns = [];

                // Headers
                for (let i = 0; i < columns.length; i++) {
                    const col = columns[i];
                    if (col.hidden || col.xtype === 'actioncolumn') continue;

                    const headerText = col.text || col.dataIndex || 'Column ' + i;
                    headers.push(Utils.escapeCSV(Utils.cleanText(headerText)));
                    visibleColumns.push(col);
                }

                if (headers.length === 0) {
                    throw new Error('Görünür kolon bulunamadı');
                }

                csv.push(headers.join(','));

                // Data rows
                const records = store.getRange();

                for (let r = 0; r < records.length; r++) {
                    const record = records[r];
                    const row = [];

                    for (let c = 0; c < visibleColumns.length; c++) {
                        const col = visibleColumns[c];
                        const dataIndex = col.dataIndex;
                        let value = '';

                        if (dataIndex) {
                            value = record.get(dataIndex);

                            // Renderer varsa kullan
                            if (col.renderer && typeof col.renderer === 'function') {
                                try {
                                    const rendered = col.renderer(value, {}, record);
                                    if (rendered !== undefined && rendered !== null) {
                                        value = rendered;
                                    }
                                } catch (e) {
                                    console.warn('Renderer error:', e);
                                }
                            }
                        }

                        let cellText = Utils.cleanText(String(value || ''));
                        // HTML taglerini temizle
                        cellText = cellText.replace(/<[^>]+>/g, '');
                        row.push(Utils.escapeCSV(cellText));
                    }

                    csv.push(row.join(','));
                }

                // Grid preview bilgisi
                const title = grid.title || 'Grid ' + (index + 1);

                return {
                    csv: csv.join('\\n'),
                    rowCount: records.length,
                    columnCount: visibleColumns.length,
                    title: title,
                    index: index
                };

            } catch (error) {
                console.error('ExtJS Grid extraction error:', error);
                throw error;
            }
        }

        static extractAll() {
            const grids = this.findGrids();
            return grids.map((grid, index) => {
                try {
                    const data = this.extractGrid(grid, index);
                    return { ...data, error: null };
                } catch (error) {
                    return {
                        error: error.message,
                        title: 'Grid ' + (index + 1),
                        index: index
                    };
                }
            });
        }
    }

    // HTML Table Extractor
    class HTMLTableExtractor {
        static findTables() {
            return Array.from(document.querySelectorAll('table'));
        }

        static extractTable(table, index = 0) {
            try {
                const csv = [];
                const rows = table.querySelectorAll('tr');

                if (rows.length === 0) {
                    throw new Error('Tablo boş');
                }

                for (let i = 0; i < rows.length; i++) {
                    const row = [];
                    const cells = rows[i].querySelectorAll('td, th');

                    for (let j = 0; j < cells.length; j++) {
                        const text = Utils.cleanText(cells[j].innerText);
                        row.push(Utils.escapeCSV(text));
                    }

                    if (row.length > 0) {
                        csv.push(row.join(','));
                    }
                }

                // Tablo preview
                const firstRow = table.querySelector('tr');
                const previewCells = firstRow ?
                    Array.from(firstRow.querySelectorAll('td, th')).slice(0, 3) : [];
                const preview = previewCells.map(c =>
                    Utils.cleanText(c.innerText).substring(0, 20)
                ).join(' | ');

                return {
                    csv: csv.join('\\n'),
                    rowCount: rows.length,
                    columnCount: firstRow ? firstRow.querySelectorAll('td, th').length : 0,
                    preview: preview,
                    index: index
                };

            } catch (error) {
                console.error('HTML Table extraction error:', error);
                throw error;
            }
        }

        static extractAll() {
            const tables = this.findTables();
            return tables.map((table, index) => {
                try {
                    const data = this.extractTable(table, index);
                    return { ...data, error: null };
                } catch (error) {
                    return {
                        error: error.message,
                        preview: 'Tablo ' + (index + 1),
                        index: index
                    };
                }
            });
        }
    }

    // Main Export Function
    function detectAndExtractTables() {
        const result = {
            extjsGrids: [],
            htmlTables: [],
            method: null,
            totalCount: 0
        };

        // ExtJS Grid'leri kontrol et
        if (ExtJSGridExtractor.canExtract()) {
            result.extjsGrids = ExtJSGridExtractor.extractAll();
            result.method = 'ExtJS';
        }

        // HTML Table'ları kontrol et
        result.htmlTables = HTMLTableExtractor.extractAll();

        // Toplam sayı
        result.totalCount = result.extjsGrids.length + result.htmlTables.length;

        if (result.totalCount === 0) {
            throw new Error('Sayfada hiç tablo bulunamadı!');
        }

        return result;
    }

    // Return the result
    return detectAndExtractTables();
})()
`;

module.exports = {
    extractionScript
};
