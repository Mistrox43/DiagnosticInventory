import { TEMPLATE_SCHEMA, validateValue, validateSubregion } from '../validationRules';
import { getColumnLetter } from './excelParser';

/**
 * Validate a single file's data
 * @param {Object} parsedFile - Parsed Excel file data
 * @param {Array<Object>} allFiles - All parsed files for cross-file validation
 * @returns {Array<Object>} - Array of validation issues
 */
export const validateFile = (parsedFile, allFiles = []) => {
  const issues = [];
  const requiredSheets = ['Site Information', 'CT Capabilities', 'MRI Capabilities'];

  // Check for missing sheets
  requiredSheets.forEach(sheetName => {
    if (!parsedFile.sheets[sheetName]) {
      issues.push({
        file: parsedFile.fileName,
        sheet: sheetName,
        row: '-',
        column: '-',
        field: '-',
        severity: 'error',
        message: `Required sheet "${sheetName}" not found`
      });
    }
  });

  // Validate each sheet
  requiredSheets.forEach(sheetName => {
    if (parsedFile.sheets[sheetName]) {
      const sheetIssues = validateSheet(
        parsedFile.fileName,
        sheetName,
        parsedFile.sheets[sheetName],
        parsedFile.extraColumns[sheetName] || [],
        allFiles
      );
      issues.push(...sheetIssues);
    }
  });

  return issues;
};

/**
 * Validate a single sheet
 * @param {string} fileName - Name of the file
 * @param {string} sheetName - Name of the sheet
 * @param {Object} sheetData - Sheet data with data array
 * @param {Array} extraColumns - Extra columns in this sheet
 * @param {Array<Object>} allFiles - All files for cross-file validation
 * @returns {Array<Object>} - Array of validation issues
 */
const validateSheet = (fileName, sheetName, sheetData, extraColumns, allFiles) => {
  const issues = [];
  const schema = TEMPLATE_SCHEMA[sheetName];

  if (!schema) return issues;

  const { data } = sheetData;

  // If no data rows, add warning
  if (!data || data.length === 0) {
    issues.push({
      file: fileName,
      sheet: sheetName,
      row: '-',
      column: '-',
      field: 'Data',
      severity: 'warning',
      message: 'Sheet contains no data rows'
    });
    return issues;
  }

  // Validate each row
  data.forEach((rowObj) => {
    const { rowData, excelRow } = rowObj;

    // Check if row is empty (should have been filtered, but double-check)
    const isEmpty = !rowData || rowData.every(cell => !cell || String(cell).trim() === '');
    if (isEmpty) return;

    // Check if Site ID exists (col 1)
    const siteId = rowData[1];
    if (!siteId || String(siteId).trim() === '') {
      return; // Skip rows without Site ID
    }

    // Validate each field in the schema
    schema.requiredFields.forEach(field => {
      const value = rowData[field.col];
      const result = validateValue(value, field.type, field.name, rowData, field);

      if (!result.valid) {
        issues.push({
          file: fileName,
          sheet: sheetName,
          row: excelRow,
          column: getColumnLetter(field.col),
          field: field.name,
          severity: field.required ? 'error' : 'warning',
          message: result.message
        });
      }
    });

    // Special validation for Site Information: Sub-region validation
    if (sheetName === 'Site Information') {
      const region = rowData[7]; // Ontario Health Region
      const subregion = rowData[8]; // Sub-region
      const subResult = validateSubregion(region, subregion);

      if (!subResult.valid) {
        issues.push({
          file: fileName,
          sheet: sheetName,
          row: excelRow,
          column: getColumnLetter(8),
          field: 'Sub-region',
          severity: 'error',
          message: subResult.message
        });
      }
    }
  });

  return issues;
};

/**
 * Validate all files together (for cross-file validation)
 * @param {Array<Object>} parsedFiles - Array of parsed files
 * @returns {Object} - Validation results for each file
 */
export const validateAllFiles = (parsedFiles) => {
  const results = {};

  parsedFiles.forEach(file => {
    results[file.fileName] = validateFile(file, parsedFiles);
  });

  return results;
};
