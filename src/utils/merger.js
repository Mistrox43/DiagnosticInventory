import { TEMPLATE_SCHEMA } from '../validationRules';
import * as XLSX from 'xlsx';

/**
 * Merge multiple Excel files into a single dataset
 * @param {Array<Object>} parsedFiles - Array of parsed file data
 * @returns {Object} - Merged data organized by sheet name, ready for export
 */
export const mergeFiles = (parsedFiles) => {
  const mergedData = {
    'Site Information': { headers: null, rows: [], extraCols: [] },
    'CT Capabilities': { headers: null, rows: [], extraCols: [] },
    'MRI Capabilities': { headers: null, rows: [], extraCols: [] }
  };

  const sheetNames = ['Site Information', 'CT Capabilities', 'MRI Capabilities'];

  // Collect all extra columns across all files for each sheet
  const allExtraCols = {
    'Site Information': {},
    'CT Capabilities': {},
    'MRI Capabilities': {}
  };

  parsedFiles.forEach(fileData => {
    sheetNames.forEach(sheetName => {
      const extras = fileData.extraColumns[sheetName] || [];
      extras.forEach(extra => {
        if (!allExtraCols[sheetName][extra.name]) {
          allExtraCols[sheetName][extra.name] = Object.keys(allExtraCols[sheetName]).length;
        }
      });
    });
  });

  // Get header rows from first workbook
  const firstWorkbook = parsedFiles[0].workbook;

  sheetNames.forEach(sheetName => {
    const sheet = firstWorkbook.Sheets[sheetName];
    if (sheet) {
      const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
      const schema = TEMPLATE_SCHEMA[sheetName];

      // Copy only the header row (row 3, index 2)
      mergedData[sheetName].headers = [data[schema.headerRow]];

      // Get extra column names
      const extraColNames = Object.keys(allExtraCols[sheetName]);
      mergedData[sheetName].extraCols = extraColNames;

      // Add extra column headers to the header row
      if (mergedData[sheetName].headers.length > 0 && extraColNames.length > 0) {
        const headerRow = mergedData[sheetName].headers[0];
        extraColNames.forEach(colName => {
          headerRow.push(colName);
        });
      }
    }
  });

  // Merge data rows from all files
  parsedFiles.forEach(fileData => {
    sheetNames.forEach(sheetName => {
      const sheetData = fileData.sheets[sheetName];
      if (!sheetData || !sheetData.data) return;

      const rows = sheetData.data;
      const extras = fileData.extraColumns[sheetName] || [];
      const schema = TEMPLATE_SCHEMA[sheetName];

      // Build map of extra column names to indices in this file
      const fileExtraMap = {};
      extras.forEach(extra => {
        fileExtraMap[extra.name] = extra.index;
      });

      const extraColNames = Object.keys(allExtraCols[sheetName]);

      // Process each data row
      rows.forEach(rowObj => {
        const row = rowObj.rowData;

        // Get base row (standard columns)
        const baseRow = row.slice(0, schema.requiredFields.length);

        // Add extra columns
        extraColNames.forEach(colName => {
          if (fileExtraMap.hasOwnProperty(colName)) {
            const idx = fileExtraMap[colName];
            baseRow.push(row[idx] || '');
          } else {
            baseRow.push('');
          }
        });

        mergedData[sheetName].rows.push(baseRow);
      });
    });
  });

  // Convert to format expected by exporter
  const exportData = {};
  sheetNames.forEach(sheetName => {
    const data = mergedData[sheetName];
    exportData[sheetName] = {
      allRows: data.headers.concat(data.rows)
    };
  });

  return exportData;
};

/**
 * Remove duplicate rows based on Site ID (col 1)
 * @param {Object} mergedData - Merged data by sheet
 * @returns {Object} - { data: deduplicated data, duplicates: info about duplicates }
 */
export const deduplicateData = (mergedData) => {
  const deduplicated = {};
  const duplicateInfo = {};
  const sheetNames = ['Site Information', 'CT Capabilities', 'MRI Capabilities'];

  sheetNames.forEach(sheetName => {
    const data = mergedData[sheetName];
    if (!data || !data.allRows) {
      deduplicated[sheetName] = data;
      duplicateInfo[sheetName] = { duplicateCount: 0, duplicateSiteIds: [] };
      return;
    }

    // Header is now just the first row (row 3 from original Excel)
    const headers = [data.allRows[0]];
    const dataRows = data.allRows.slice(1);

    const seen = new Set();
    const uniqueRows = [];
    const duplicateSiteIds = [];
    let duplicateCount = 0;

    dataRows.forEach(row => {
      const siteId = row[1]; // Site ID is at column 1
      if (siteId && String(siteId).trim()) {
        const key = String(siteId).trim();
        if (!seen.has(key)) {
          seen.add(key);
          uniqueRows.push(row);
        } else {
          duplicateCount++;
          if (!duplicateSiteIds.includes(key)) {
            duplicateSiteIds.push(key);
          }
        }
      } else {
        // Keep rows without Site ID (validation will catch this)
        uniqueRows.push(row);
      }
    });

    deduplicated[sheetName] = {
      allRows: headers.concat(uniqueRows)
    };

    duplicateInfo[sheetName] = {
      duplicateCount,
      duplicateSiteIds
    };
  });

  return { data: deduplicated, duplicates: duplicateInfo };
};

/**
 * Get merge statistics
 * @param {Array<Object>} parsedFiles - Array of parsed files
 * @param {Object} mergedData - Merged data
 * @returns {Object} - Statistics about the merge
 */
export const getMergeStats = (parsedFiles, mergedData) => {
  const stats = {
    totalFiles: parsedFiles.length,
    totalRows: {},
    customColumns: {}
  };

  const sheetNames = ['Site Information', 'CT Capabilities', 'MRI Capabilities'];

  sheetNames.forEach(sheetName => {
    const data = mergedData[sheetName];

    if (data && data.allRows) {
      // Subtract 1 for the header row to get count of data rows only
      stats.totalRows[sheetName] = data.allRows.length - 1;
    } else {
      stats.totalRows[sheetName] = 0;
    }

    // Collect custom columns
    const customCols = new Set();
    parsedFiles.forEach(file => {
      const extras = file.extraColumns[sheetName] || [];
      extras.forEach(extra => {
        customCols.add(extra.name);
      });
    });

    stats.customColumns[sheetName] = Array.from(customCols);
  });

  return stats;
};
