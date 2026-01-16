import { VALIDATION_RULES, STANDARD_COLUMNS } from '../validationRules';

/**
 * Validate a single file's data
 * @param {Object} parsedFile - Parsed Excel file data
 * @param {Array<Object>} allFiles - All parsed files for cross-file validation
 * @returns {Array<Object>} - Array of validation issues
 */
export const validateFile = (parsedFile, allFiles = []) => {
  const issues = [];
  const requiredTabs = ['Site Information', 'CT Capabilities', 'MRI Capabilities'];

  // Build context for cross-tab validation
  const context = {
    siteInformation: parsedFile.sheets['Site Information']?.data || []
  };

  // Check for missing tabs
  requiredTabs.forEach(tabName => {
    if (!parsedFile.sheets[tabName]) {
      issues.push({
        fileName: parsedFile.fileName,
        tab: 'File Structure',
        row: 'N/A',
        field: tabName,
        issue: `Missing required tab: ${tabName}`,
        severity: 'error'
      });
    }
  });

  // Validate each required tab
  requiredTabs.forEach(tabName => {
    if (parsedFile.sheets[tabName]) {
      const sheetIssues = validateSheet(
        parsedFile.fileName,
        tabName,
        parsedFile.sheets[tabName],
        allFiles,
        context
      );
      issues.push(...sheetIssues);
    }
  });

  return issues;
};

/**
 * Validate a single sheet
 * @param {string} fileName - Name of the file
 * @param {string} tabName - Name of the tab/sheet
 * @param {Object} sheetData - Sheet data with data and columns
 * @param {Array<Object>} allFiles - All files for cross-file validation
 * @param {Object} context - Context for cross-tab validation
 * @returns {Array<Object>} - Array of validation issues
 */
const validateSheet = (fileName, tabName, sheetData, allFiles, context) => {
  const issues = [];
  const { data, columns } = sheetData;
  const standardColumns = STANDARD_COLUMNS[tabName] || [];
  const rules = VALIDATION_RULES[tabName] || [];

  // Check for missing standard columns
  const missingColumns = standardColumns.filter(col => !columns.includes(col));
  missingColumns.forEach(col => {
    issues.push({
      fileName,
      tab: tabName,
      row: 'Header',
      field: col,
      issue: `Missing required column: ${col}`,
      severity: 'error'
    });
  });

  // If no data rows, warn but don't fail
  if (data.length === 0) {
    issues.push({
      fileName,
      tab: tabName,
      row: 'N/A',
      field: 'Data',
      issue: 'Sheet contains no data rows',
      severity: 'warning'
    });
    return issues;
  }

  // Collect all data from same tab across all files for cross-file validation
  const allTabData = [];
  if (allFiles.length > 0) {
    allFiles.forEach(file => {
      if (file.sheets[tabName]?.data) {
        allTabData.push(...file.sheets[tabName].data);
      }
    });
  } else {
    allTabData.push(...data);
  }

  // Validate each row
  data.forEach((row, index) => {
    const rowNumber = index + 2; // +2 because Excel is 1-indexed and first row is header

    // Apply validation rules
    rules.forEach(rule => {
      const value = row[rule.field];
      const isValid = rule.validate(value, row, allTabData, context);

      if (!isValid) {
        issues.push({
          fileName,
          tab: tabName,
          row: rowNumber,
          field: rule.field,
          issue: rule.description,
          severity: 'error'
        });
      }
    });
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
