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
            // Cell styling for diff highlights
            cellStyle: (params) => {
                if (!originalData) return null;
                
                const rowIndex = params.node.rowIndex;
                const originalRow = originalData[rowIndex];
                
                if (!originalRow) {
                    // New row
                    return { backgroundColor: 'rgba(16, 185, 129, 0.15)', borderLeft: '4px solid #10b981' };
                }
                
                const currentValue = params.value;
                const originalValue = originalRow[params.colDef.field];
                
                if (currentValue !== originalValue) {
                    // Modified cell
                    return { backgroundColor: 'rgba(245, 158, 11, 0.15)', borderLeft: '4px solid #f59e0b' };
                }
                
                return null;
            }
        }));
    }, [sheetData, originalData]);

    const defaultColDef = useMemo(() => ({
        flex: 1,
        minWidth: 150,
        resizable: true,
    }), []);

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
                animateRows={true}
                pagination={true}
                paginationPageSize={50}
                rowSelection="multiple"
                suppressRowClickSelection={true}
            />
        </div>
    );
}
