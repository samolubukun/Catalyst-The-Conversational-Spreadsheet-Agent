"use client"

import { useMemo, useCallback, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { 
    ModuleRegistry, 
    AllCommunityModule
} from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';

ModuleRegistry.registerModules([
    AllCommunityModule,
]);

export default function SpreadsheetViewer({ sheetData, originalData, onCellChange }) {
    const gridRef = useRef();

    // Memoize cell styling separately from column structure.
    // This way columnDefs only rebuilds when the column keys change (new file loaded),
    // NOT on every data update or preview toggle — a major cause of grid freezing.
    const getCellStyle = useCallback((params) => {
        const row = params.data;
        if (row) {
            if (row._cellStyle && row._cellStyle[params.colDef.field]) {
                return row._cellStyle[params.colDef.field];
            }
            if (row._style && row._style[params.colDef.field]) {
                return row._style[params.colDef.field];
            }
            const fieldHighlightKey = `_highlight_${params.colDef.field}`;
            if (row[fieldHighlightKey]) {
                return { backgroundColor: 'rgba(254, 240, 138, 0.25)', borderLeft: '4px solid #eab308' };
            }
        }
        if (!originalData) return null;
        const rowIndex = params.node.rowIndex;
        const originalRow = originalData[rowIndex];
        if (!originalRow) {
            return { backgroundColor: 'rgba(16, 185, 129, 0.15)', borderLeft: '4px solid #10b981' };
        }
        const currentValue = params.value;
        const originalValue = originalRow[params.colDef.field];
        if (currentValue !== originalValue) {
            return { backgroundColor: 'rgba(245, 158, 11, 0.15)', borderLeft: '4px solid #f59e0b' };
        }
        return null;
    }, [originalData]);

    // Derive a stable column key string — only changes when the actual column structure changes
    const columnKeySignature = useMemo(() =>
        sheetData && sheetData.length > 0 ? Object.keys(sheetData[0]).join(',') : ''
    , [sheetData]);

    // Compute column definitions from data keys
    const columnDefs = useMemo(() => {
        if (!sheetData || sheetData.length === 0) return [];
        const keys = Object.keys(sheetData[0]);
        return keys.map(key => ({
            field: key,
            headerName: key.charAt(0).toUpperCase() + key.slice(1),
            sortable: true,
            filter: true,
            editable: true,
            cellStyle: getCellStyle,
        }));
    }, [columnKeySignature, getCellStyle]);

    const defaultColDef = useMemo(() => ({
        flex: 1,
        minWidth: 150,
        resizable: true,
    }), []);

    const getRowStyle = useCallback((params) => {
        const row = params.data;
        if (!row) return null;
        
        // 1. Explicit style object injected by AI
        if (row._rowStyle) return row._rowStyle;
        if (row._style && typeof row._style === 'object' && !row._style[Object.keys(row._style)[0]]) {
            return row._style;
        }
        
        // 2. Background color or hex code
        if (row._bg) return { backgroundColor: row._bg };
        if (row._backgroundColor) return { backgroundColor: row._backgroundColor };
        
        // 3. Boolean highlight flag (soft yellow neobrutalist style)
        if (row._highlight || row.highlighted || row.isHighlighted) {
            return { backgroundColor: 'rgba(254, 240, 138, 0.25)', borderLeft: '4px solid #eab308' };
        }
        
        return null;
    }, []);

    const onCellValueChanged = useCallback((event) => {
        if (onCellChange) {
            onCellChange(sheetData, event.colDef.field, event.newValue);
        }
    }, [onCellChange, sheetData]);

    return (
        <div className="ag-theme-quartz w-full h-full dark:ag-theme-quartz-dark">
            <AgGridReact
                theme="legacy"
                ref={gridRef}
                rowData={sheetData}
                columnDefs={columnDefs}
                defaultColDef={defaultColDef}
                onCellValueChanged={onCellValueChanged}
                getRowStyle={getRowStyle}
                animateRows={false}
                rowBuffer={20}
                pagination={true}
                paginationPageSize={50}
                rowSelection="multiple"
                suppressRowClickSelection={true}
            />
        </div>
    );
}
