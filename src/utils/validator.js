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

  // Track Site IDs to detect duplicates within this file
  const siteIdTracker = new Map(); // Map<siteId, firstRowNumber>

  // Validate each row
  data.forEach((rowObj) => {
    const { rowData, excelRow } = rowObj;

    // Check if row is empty (should have been filtered, but double-check)
    const isEmpty = !rowData || rowData.every(cell => !cell || String(cell).trim() === '');
    if (isEmpty) return;

    // Check for missing required identifier fields (Facility ID and Site ID)
    const facilityId = rowData[0];
    const siteId = rowData[1];
    const hasFacilityId = facilityId && String(facilityId).trim() !== '';
    const hasSiteId = siteId && String(siteId).trim() !== '';

    // If row has any data but missing Facility ID, report error
    if (!hasFacilityId) {
      issues.push({
        file: fileName,
        sheet: sheetName,
        row: excelRow,
        column: getColumnLetter(0),
        field: 'Facility ID*',
        severity: 'error',
        message: 'Missing Facility ID - this is a required field'
      });
    } else {
      // Validate Facility ID is numeric only
      const facilityIdStr = String(facilityId).trim();
      if (!/^\d+$/.test(facilityIdStr)) {
        issues.push({
          file: fileName,
          sheet: sheetName,
          row: excelRow,
          column: getColumnLetter(0),
          field: 'Facility ID*',
          severity: 'error',
          message: `Facility ID must contain only numbers. Found: "${facilityIdStr}"`
        });
      }
    }

    // If row has any data but missing Site ID, report error
    if (!hasSiteId) {
      issues.push({
        file: fileName,
        sheet: sheetName,
        row: excelRow,
        column: getColumnLetter(1),
        field: 'Site ID*',
        severity: 'error',
        message: 'Missing Site ID - this is a required field'
      });
      return; // Skip further validation if no Site ID (needed for duplicate checking)
    } else {
      // Validate Site ID is numeric only
      const siteIdStr = String(siteId).trim();
      if (!/^\d+$/.test(siteIdStr)) {
        issues.push({
          file: fileName,
          sheet: sheetName,
          row: excelRow,
          column: getColumnLetter(1),
          field: 'Site ID*',
          severity: 'error',
          message: `Site ID must contain only numbers. Found: "${siteIdStr}"`
        });
        return; // Skip further validation if Site ID is invalid format
      }
    }

    // Check for duplicate Site ID within this file
    const siteIdKey = String(siteId).trim();
    if (siteIdTracker.has(siteIdKey)) {
      const firstRow = siteIdTracker.get(siteIdKey);
      issues.push({
        file: fileName,
        sheet: sheetName,
        row: excelRow,
        column: getColumnLetter(1),
        field: 'Site ID*',
        severity: 'warning',
        message: `Duplicate Site ID "${siteIdKey}" found in this file (first occurrence at row ${firstRow})`
      });
    } else {
      siteIdTracker.set(siteIdKey, excelRow);
    }

    // Validate each field in the schema
    // Skip col 0 (Facility ID) and col 1 (Site ID) as they're validated explicitly above
    schema.requiredFields.forEach(field => {
      if (field.col === 0 || field.col === 1) return; // Already validated above

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
          field: 'Sub-region*',
          severity: 'error',
          message: subResult.message
        });
      }
    }
  });

  return issues;
};

/**
 * Check for duplicate Site IDs across all files
 * @param {Array<Object>} parsedFiles - Array of parsed files
 * @returns {Object} - Map of duplicate Site IDs per sheet with file locations
 */
const checkCrossFileDuplicates = (parsedFiles) => {
  const sheetNames = ['Site Information', 'CT Capabilities', 'MRI Capabilities'];
  const duplicates = {};

  sheetNames.forEach(sheetName => {
    // Track Site IDs across all files: Map<siteId, Array<{fileName, row}>>
    const siteIdLocations = new Map();

    parsedFiles.forEach(file => {
      const sheetData = file.sheets[sheetName];
      if (!sheetData || !sheetData.data) return;

      sheetData.data.forEach(rowObj => {
        const { rowData, excelRow } = rowObj;
        const siteId = rowData[1];

        if (!siteId || String(siteId).trim() === '') return;

        const siteIdKey = String(siteId).trim();
        if (!siteIdLocations.has(siteIdKey)) {
          siteIdLocations.set(siteIdKey, []);
        }

        siteIdLocations.get(siteIdKey).push({
          fileName: file.fileName,
          row: excelRow
        });
      });
    });

    // Find Site IDs that appear in multiple locations
    duplicates[sheetName] = new Map();
    siteIdLocations.forEach((locations, siteId) => {
      if (locations.length > 1) {
        duplicates[sheetName].set(siteId, locations);
      }
    });
  });

  return duplicates;
};

/**
 * Validate all files together (for cross-file validation)
 * @param {Array<Object>} parsedFiles - Array of parsed files
 * @returns {Object} - Validation results for each file
 */
export const validateAllFiles = (parsedFiles) => {
  const results = {};

  // First, run individual file validations
  parsedFiles.forEach(file => {
    results[file.fileName] = validateFile(file, parsedFiles);
  });

  // Check for duplicate Site IDs across files
  const crossFileDuplicates = checkCrossFileDuplicates(parsedFiles);

  // Add warnings for cross-file duplicates
  parsedFiles.forEach(file => {
    const sheetNames = ['Site Information', 'CT Capabilities', 'MRI Capabilities'];

    sheetNames.forEach(sheetName => {
      const sheetData = file.sheets[sheetName];
      if (!sheetData || !sheetData.data) return;

      const duplicatesInSheet = crossFileDuplicates[sheetName];
      if (!duplicatesInSheet || duplicatesInSheet.size === 0) return;

      sheetData.data.forEach(rowObj => {
        const { rowData, excelRow } = rowObj;
        const siteId = rowData[1];

        if (!siteId || String(siteId).trim() === '') return;

        const siteIdKey = String(siteId).trim();
        const locations = duplicatesInSheet.get(siteIdKey);

        if (locations && locations.length > 1) {
          // This Site ID appears in multiple places
          const otherLocations = locations
            .filter(loc => !(loc.fileName === file.fileName && loc.row === excelRow))
            .map(loc => `${loc.fileName} (row ${loc.row})`)
            .join(', ');

          if (otherLocations) {
            results[file.fileName].push({
              file: file.fileName,
              sheet: sheetName,
              row: excelRow,
              column: getColumnLetter(1),
              field: 'Site ID*',
              severity: 'warning',
              message: `Site ID "${siteIdKey}" appears in multiple files. Also found in: ${otherLocations}`
            });
          }
        }
      });
    });
  });

  return results;
};
