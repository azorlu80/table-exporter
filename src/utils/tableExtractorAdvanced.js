/**
 * Gelişmiş Tablo Extraction - Fallback Mekanizmaları ile
 * Sıralama: ExtJS Grid → HTML Table → Div-based Grid → Manuel Seçim
 */

const extractionScript = `
(function() {
    'use strict';

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

        stripHTML(html) {
            const tmp = document.createElement('div');
            tmp.innerHTML = html;
            return tmp.textContent || tmp.innerText || '';
        }
    };

    // 1. ExtJS Grid Extractor
    class ExtJSGridExtractor {
        static canExtract() {
            return typeof window.Ext !== 'undefined' && typeof Ext.ComponentQuery !== 'undefined';
        }

        static findGrids() {
            if (!this.canExtract()) return [];
            try {
                return Ext.ComponentQuery.query('gridpanel') || [];
            } catch (error) {
                console.error('ExtJS Grid query error:', error);
                return [];
            }
        }

        static extractGrid(grid, index = 0) {
            const store = grid.getStore();
            const columns = grid.getColumns();

            if (!store || !columns) {
                throw new Error('Grid store veya columns bulunamadı');
            }

            // ✅ BEST PRACTICE: Check pagination status
            const isPaginated = store.pageSize > 0;
            const currentCount = store.getCount();
            const totalCount = store.getTotalCount ? store.getTotalCount() : currentCount;

            // ✅ BEST PRACTICE: Check filter status
            const filters = store.getFilters ? store.getFilters() : null;
            const isFiltered = filters && filters.length > 0;

            // ✅ BEST PRACTICE: Check grouping status
            const groupField = store.groupField || null;
            const isGrouped = groupField !== null;

            const csv = [];
            const headers = [];
            const visibleColumns = [];

            // Headers
            columns.forEach((col, i) => {
                if (col.hidden || col.xtype === 'actioncolumn') return;
                const headerText = col.text || col.dataIndex || 'Column ' + i;
                headers.push(Utils.escapeCSV(Utils.cleanText(headerText)));
                visibleColumns.push(col);
            });

            if (headers.length === 0) {
                throw new Error('Görünür kolon bulunamadı');
            }

            csv.push(headers.join(','));

            // ✅ BEST PRACTICE: Use getData().items (respects filters!)
            // Alternative: store.getRange() also works
            const records = store.getData ? store.getData().items : store.getRange();

            records.forEach(record => {
                const row = [];
                visibleColumns.forEach(col => {
                    let value = '';
                    if (col.dataIndex) {
                        value = record.get(col.dataIndex);
                        // Apply renderer if available
                        if (col.renderer && typeof col.renderer === 'function') {
                            try {
                                const rendered = col.renderer(value, {}, record);
                                if (rendered !== undefined && rendered !== null) {
                                    value = rendered;
                                }
                            } catch (e) {
                                // Renderer failed, use raw value
                            }
                        }
                    }
                    let cellText = Utils.cleanText(String(value || ''));
                    cellText = Utils.stripHTML(cellText);
                    row.push(Utils.escapeCSV(cellText));
                });
                csv.push(row.join(','));
            });

            // ✅ BEST PRACTICE: Return metadata with warnings
            return {
                csv: csv.join('\\n'),
                rowCount: records.length,
                columnCount: visibleColumns.length,
                title: grid.title || 'ExtJS Grid ' + (index + 1),
                type: 'extjs',
                index: index,
                // Metadata
                metadata: {
                    isPaginated: isPaginated,
                    isFiltered: isFiltered,
                    isGrouped: isGrouped,
                    currentCount: currentCount,
                    totalCount: totalCount,
                    groupField: groupField
                },
                // Warnings
                warnings: [
                    ...(isPaginated && currentCount < totalCount ?
                        [\`⚠️ Pagination: Exporting \${currentCount} of \${totalCount} rows (current page only)\`] : []),
                    ...(isFiltered ?
                        [\`⚠️ Filters active: Exporting \${currentCount} filtered rows\`] : []),
                    ...(isGrouped ?
                        [\`⚠️ Grouped by: \${groupField}\`] : [])
                ]
            };
        }

        static extractAll() {
            const grids = this.findGrids();
            return grids.map((grid, index) => {
                try {
                    return { ...this.extractGrid(grid, index), error: null };
                } catch (error) {
                    return {
                        error: error.message,
                        title: 'ExtJS Grid ' + (index + 1),
                        type: 'extjs',
                        index: index
                    };
                }
            });
        }
    }

    // 2. HTML Table Extractor
    class HTMLTableExtractor {
        static findTables() {
            const tables = [];

            // Ana sayfadaki tablolar
            Array.from(document.querySelectorAll('table')).forEach(table => {
                const style = window.getComputedStyle(table);
                if (style.display !== 'none' && style.visibility !== 'hidden') {
                    const rows = table.querySelectorAll('tr');
                    if (rows.length >= 2) {
                        tables.push(table);
                    }
                }
            });

            // iFrame içindeki tablolar (same-origin only)
            try {
                const iframes = document.querySelectorAll('iframe');
                iframes.forEach(iframe => {
                    try {
                        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                        if (iframeDoc) {
                            Array.from(iframeDoc.querySelectorAll('table')).forEach(table => {
                                const style = iframeDoc.defaultView.getComputedStyle(table);
                                if (style.display !== 'none' && style.visibility !== 'hidden') {
                                    const rows = table.querySelectorAll('tr');
                                    if (rows.length >= 2) {
                                        tables.push(table);
                                    }
                                }
                            });
                        }
                    } catch (e) {
                        // Cross-origin iframe - skip
                        console.warn('Cannot access iframe (cross-origin):', e.message);
                    }
                });
            } catch (e) {
                console.warn('iFrame access error:', e);
            }

            return tables;
        }

        static extractTable(table, index = 0) {
            const csv = [];
            const thead = table.querySelector('thead');
            const tbody = table.querySelector('tbody');
            const allRows = table.querySelectorAll('tr');

            if (allRows.length === 0) {
                throw new Error('Tablo boş');
            }

            // HEADER: Multi-level header desteği (sadece SON thead row'u al)
            if (thead) {
                const theadRows = thead.querySelectorAll('tr');
                if (theadRows.length > 0) {
                    // Son row = en alt seviye başlıklar
                    const lastHeaderRow = theadRows[theadRows.length - 1];
                    const rowData = [];
                    const cells = lastHeaderRow.querySelectorAll('td, th');

                    cells.forEach(cell => {
                        const text = Utils.cleanText(cell.innerText);
                        const colspan = parseInt(cell.getAttribute('colspan') || '1');

                        // Colspan varsa tekrar et
                        for (let i = 0; i < colspan; i++) {
                            rowData.push(Utils.escapeCSV(text));
                        }
                    });

                    if (rowData.length > 0) {
                        csv.push(rowData.join(','));
                    }
                }
            }

            // BODY ROWS
            const bodyRows = tbody ? tbody.querySelectorAll('tr') : allRows;
            bodyRows.forEach(row => {
                // thead içindeki row'ları skip et
                if (thead && thead.contains(row)) return;

                const rowData = [];
                const cells = row.querySelectorAll('td, th');

                cells.forEach(cell => {
                    const text = Utils.cleanText(cell.innerText);
                    const colspan = parseInt(cell.getAttribute('colspan') || '1');

                    // Colspan varsa tekrar et
                    for (let i = 0; i < colspan; i++) {
                        rowData.push(Utils.escapeCSV(text));
                    }
                });

                if (rowData.length > 0) {
                    csv.push(rowData.join(','));
                }
            });

            // Preview
            const firstRow = allRows[0];
            const previewCells = firstRow ?
                Array.from(firstRow.querySelectorAll('td, th')).slice(0, 3) : [];
            const preview = previewCells.map(c =>
                Utils.cleanText(c.innerText).substring(0, 20)
            ).join(' | ');

            return {
                csv: csv.join('\\n'),
                rowCount: allRows.length,
                columnCount: firstRow ? firstRow.querySelectorAll('td, th').length : 0,
                title: 'HTML Table ' + (index + 1),
                preview: preview,
                type: 'html',
                index: index
            };
        }

        static extractAll() {
            const tables = this.findTables();
            return tables.map((table, index) => {
                try {
                    return { ...this.extractTable(table, index), error: null };
                } catch (error) {
                    return {
                        error: error.message,
                        title: 'HTML Table ' + (index + 1),
                        type: 'html',
                        index: index
                    };
                }
            });
        }
    }

    // 3. DIV-based Grid Extractor (FALLBACK)
    class DivGridExtractor {
        static findDivGrids() {
            // Grid benzeri div yapılarını bul
            const candidates = [];

            // x-grid, grid, data-grid gibi class'lara sahip div'ler
            const gridSelectors = [
                '.x-grid',
                '.grid',
                '.data-grid',
                '.datagrid',
                '[role="grid"]',
                '.x-grid-view',
                '.x-panel-body'
            ];

            gridSelectors.forEach(selector => {
                const elements = document.querySelectorAll(selector);
                elements.forEach(el => {
                    // İçinde row benzeri yapı var mı?
                    const rows = el.querySelectorAll('.x-grid-row, .row, [role="row"]');
                    if (rows.length > 2) {
                        candidates.push({ element: el, rows: rows });
                    }
                });
            });

            return candidates;
        }

        static extractDivGrid(gridData, index = 0) {
            const { element, rows } = gridData;
            const csv = [];

            // İlk satırı header olarak al
            if (rows.length === 0) {
                throw new Error('Grid boş');
            }

            // Her satırdaki cell'leri bul
            rows.forEach((row, rowIndex) => {
                const rowData = [];
                const cells = row.querySelectorAll('.x-grid-cell, .cell, [role="gridcell"], td, th');

                cells.forEach(cell => {
                    const text = Utils.cleanText(cell.innerText);
                    rowData.push(Utils.escapeCSV(text));
                });

                if (rowData.length > 0) {
                    csv.push(rowData.join(','));
                }
            });

            if (csv.length === 0) {
                throw new Error('Veri çıkarılamadı');
            }

            return {
                csv: csv.join('\\n'),
                rowCount: rows.length,
                columnCount: rows[0] ? rows[0].querySelectorAll('.x-grid-cell, .cell, [role="gridcell"], td, th').length : 0,
                title: 'Div Grid ' + (index + 1),
                type: 'div',
                index: index
            };
        }

        static extractAll() {
            const grids = this.findDivGrids();
            return grids.map((grid, index) => {
                try {
                    return { ...this.extractDivGrid(grid, index), error: null };
                } catch (error) {
                    return {
                        error: error.message,
                        title: 'Div Grid ' + (index + 1),
                        type: 'div',
                        index: index
                    };
                }
            });
        }
    }

    // 4. Manuel Selection Extractor (EN SON ÇARE)
    class ManualSelectionExtractor {
        static extractFromSelection() {
            const selection = window.getSelection();
            if (!selection || selection.toString().trim().length === 0) {
                throw new Error('Seçim yapılmamış');
            }

            const text = selection.toString();
            const lines = text.split('\\n').filter(line => line.trim().length > 0);

            if (lines.length === 0) {
                throw new Error('Seçilen metin boş');
            }

            // Tab veya çoklu boşlukla ayrılmış metni CSV'ye çevir
            const csv = lines.map(line => {
                const parts = line.split(/\\t+|\\s{2,}/).filter(p => p.trim().length > 0);
                return parts.map(p => Utils.escapeCSV(Utils.cleanText(p))).join(',');
            });

            return {
                csv: csv.join('\\n'),
                rowCount: csv.length,
                columnCount: csv[0] ? csv[0].split(',').length : 0,
                title: 'Manuel Seçim',
                type: 'manual',
                index: 0
            };
        }
    }

    // ANA FONKSİYON - Tüm yöntemleri dene
    function detectAndExtractAllTables() {
        const result = {
            extjsGrids: [],
            htmlTables: [],
            divGrids: [],
            manualSelection: null,
            totalCount: 0,
            methods: []
        };

        // 1. ExtJS Grid
        try {
            if (ExtJSGridExtractor.canExtract()) {
                result.extjsGrids = ExtJSGridExtractor.extractAll();
                if (result.extjsGrids.length > 0) {
                    result.methods.push('ExtJS Grid');
                }
            }
        } catch (error) {
            console.warn('ExtJS extraction failed:', error);
        }

        // 2. HTML Table
        try {
            result.htmlTables = HTMLTableExtractor.extractAll();
            if (result.htmlTables.length > 0) {
                result.methods.push('HTML Table');
            }
        } catch (error) {
            console.warn('HTML Table extraction failed:', error);
        }

        // 3. Div-based Grid (FALLBACK)
        try {
            result.divGrids = DivGridExtractor.extractAll();
            if (result.divGrids.length > 0) {
                result.methods.push('Div Grid');
            }
        } catch (error) {
            console.warn('Div Grid extraction failed:', error);
        }

        // 4. Manuel Selection (EN SON)
        try {
            const manual = ManualSelectionExtractor.extractFromSelection();
            if (manual) {
                result.manualSelection = manual;
                result.methods.push('Manuel Selection');
            }
        } catch (error) {
            // Manuel seçim yoksa normal, hata verme
        }

        // Toplam sayı
        result.totalCount = result.extjsGrids.length +
                           result.htmlTables.length +
                           result.divGrids.length +
                           (result.manualSelection ? 1 : 0);

        // Tüm tabloları birleştir
        result.allTables = [
            ...result.extjsGrids,
            ...result.htmlTables,
            ...result.divGrids
        ];

        if (result.manualSelection) {
            result.allTables.push(result.manualSelection);
        }

        return result;
    }

    return detectAndExtractAllTables();
})()
`;

module.exports = {
    extractionScript
};
