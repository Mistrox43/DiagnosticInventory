import * as XLSX from 'xlsx';
import { TEMPLATE_SCHEMA } from '../validationRules';

/**
 * Parse an Excel file and extract data from all sheets
 * Headers are at row 3 (index 2), data starts at row 4 (index 3)
 * @param {File} file - The Excel file to parse
 * @returns {Promise<Object>} - Parsed file data with sheets, columns, and rows
 */
export const parseExcelFile = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array', cellDates: true });

        const parsedData = {
          fileName: file.name,
          workbook: workbook,
          sheets: {},
          extraColumns: {}
        };

        const requiredSheets = ['Site Information', 'CT Capabilities', 'MRI Capabilities'];

        requiredSheets.forEach(sheetName => {
          if (workbook.Sheets[sheetName]) {
            const sheetData = parseSheet(workbook.Sheets[sheetName], sheetName);
            parsedData.sheets[sheetName] = sheetData.data;
            parsedData.extraColumns[sheetName] = sheetData.extraColumns;
          }
        });

        resolve(parsedData);
      } catch (error) {
        reject(new Error(`Failed to parse Excel file: ${error.message}`));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsArrayBuffer(file);
  });
};

/**
 * Parse a single sheet
 * @param {Object} sheet - The XLSX sheet object
 * @param {string} sheetName - Name of the sheet
 * @returns {Object} - { data: { data: [], columns: [] }, extraColumns: [] }
 */
const parseSheet = (sheet, sheetName) => {
  const schema = TEMPLATE_SCHEMA[sheetName];
  if (!schema) {
    return { data: { data: [], columns: [] }, extraColumns: [] };
  }

  // Convert sheet to array of arrays
  const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '', raw: false });

  // Check if we have enough rows
  if (rawData.length <= schema.dataStartRow) {
    return { data: { data: [], columns: [] }, extraColumns: [] };
  }

  // Get header row (row 3, index 2)
  const headerRow = rawData[schema.headerRow] || [];

  // Determine columns
  const standardColumns = schema.requiredFields.map(f => f.name);
  const expectedColCount = schema.requiredFields.length;
  const actualColCount = headerRow.length;

  // Identify extra columns (only if header row has a value)
  const extraColumns = [];
  if (actualColCount > expectedColCount) {
    for (let i = expectedColCount; i < actualColCount; i++) {
      const headerValue = headerRow[i];
      // Only consider it a custom column if the header has a non-empty value
      if (headerValue && String(headerValue).trim() !== '') {
        const colLetter = XLSX.utils.encode_col(i);
        extraColumns.push({
          index: i,
          name: String(headerValue).trim(),
          columnLetter: colLetter
        });
      }
    }
  }

  // Parse data rows (starting from row 4, index 3)
  const dataRows = [];
  for (let rowIdx = schema.dataStartRow; rowIdx < rawData.length; rowIdx++) {
    const row = rawData[rowIdx];

    // Check if row is completely empty (no data in any cell)
    const isEmpty = !row || row.every(cell => !cell || String(cell).trim() === '');
    if (isEmpty) continue;

    // Include ALL rows with any data - validation will handle missing required fields
    // Store raw row data as array
    dataRows.push({
      rowIndex: rowIdx,
      rowData: row,
      excelRow: rowIdx + 1 // Excel row number (1-indexed)
    });
  }

  return {
    data: {
      data: dataRows,
      columns: standardColumns.concat(extraColumns.map(e => e.name))
    },
    extraColumns: extraColumns
  };
};

/**
 * Export data to Excel file
 * @param {Object} mergedData - Merged data organized by sheet name
 * @param {string} fileName - Output file name
 */
export const exportToExcel = (mergedData, fileName) => {
  const wb = XLSX.utils.book_new();

  Object.keys(mergedData).forEach(sheetName => {
    const sheetData = mergedData[sheetName];

    if (sheetData && sheetData.allRows) {
      // Create worksheet from array of arrays (includes headers and data)
      const ws = XLSX.utils.aoa_to_sheet(sheetData.allRows);
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
    }
  });

  // Write file
  XLSX.writeFile(wb, fileName);
};

/**
 * Get column letter from index (0-indexed)
 * @param {number} col - Column index (0-indexed)
 * @returns {string} - Excel column letter (A, B, C, ... Z, AA, AB, etc.)
 */
export const getColumnLetter = (col) => {
  return XLSX.utils.encode_col(col);
};
