/**
 * Merge multiple Excel files into a single dataset
 * @param {Array<Object>} parsedFiles - Array of parsed file data
 * @returns {Object} - Merged data organized by sheet name
 */
export const mergeFiles = (parsedFiles) => {
  const mergedData = {
    'Site Information': [],
    'CT Capabilities': [],
    'MRI Capabilities': []
  };

  const requiredTabs = ['Site Information', 'CT Capabilities', 'MRI Capabilities'];

  // Collect all columns across all files for each tab (including custom columns)
  const allColumns = {};
  requiredTabs.forEach(tabName => {
    allColumns[tabName] = new Set();
  });

  // First pass: collect all unique columns
  parsedFiles.forEach(file => {
    requiredTabs.forEach(tabName => {
      if (file.sheets[tabName]) {
        file.sheets[tabName].columns.forEach(col => {
          allColumns[tabName].add(col);
        });
      }
    });
  });

  // Second pass: merge data ensuring all columns are present
  parsedFiles.forEach(file => {
    requiredTabs.forEach(tabName => {
      if (file.sheets[tabName] && file.sheets[tabName].data) {
        file.sheets[tabName].data.forEach(row => {
          // Create a new row with all columns (including missing ones as null)
          const mergedRow = {};
          allColumns[tabName].forEach(col => {
            mergedRow[col] = row[col] !== undefined ? row[col] : null;
          });

          // Add source file information (optional - can be removed if not needed)
          mergedRow['_source_file'] = file.fileName;

          mergedData[tabName].push(mergedRow);
        });
      }
    });
  });

  return mergedData;
};

/**
 * Remove duplicate rows based on key field (Site ID)
 * @param {Object} mergedData - Merged data by tab
 * @param {string} keyField - Field to use for deduplication
 * @returns {Object} - Deduplicated data
 */
export const deduplicateData = (mergedData, keyField = 'Site ID') => {
  const deduplicated = {};

  Object.keys(mergedData).forEach(tabName => {
    const seen = new Set();
    deduplicated[tabName] = [];

    mergedData[tabName].forEach(row => {
      const key = row[keyField];
      if (key && !seen.has(String(key).trim())) {
        seen.add(String(key).trim());
        // Remove the source file marker
        const { _source_file, ...cleanRow } = row;
        deduplicated[tabName].push(cleanRow);
      } else if (!key) {
        // Keep rows without key field (might be invalid but let validation catch it)
        const { _source_file, ...cleanRow } = row;
        deduplicated[tabName].push(cleanRow);
      }
    });
  });

  return deduplicated;
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

  const requiredTabs = ['Site Information', 'CT Capabilities', 'MRI Capabilities'];

  requiredTabs.forEach(tabName => {
    stats.totalRows[tabName] = mergedData[tabName]?.length || 0;

    // Collect custom columns
    const customCols = new Set();
    parsedFiles.forEach(file => {
      if (file.sheets[tabName]) {
        file.sheets[tabName].columns.forEach(col => {
          // Check if this is a custom column by seeing if it's in standard columns
          const standardColumns = getStandardColumnsForTab(tabName);
          if (!standardColumns.includes(col)) {
            customCols.add(col);
          }
        });
      }
    });
    stats.customColumns[tabName] = Array.from(customCols);
  });

  return stats;
};

/**
 * Helper function to get standard columns for a tab
 * @param {string} tabName - Name of the tab
 * @returns {Array<string>} - Standard columns
 */
const getStandardColumnsForTab = (tabName) => {
  const standardColumns = {
    'Site Information': [
      'Site ID', 'Site Name', 'Country', 'City', 'Address',
      'Contact Name', 'Contact Email', 'Contact Phone', 'Status'
    ],
    'CT Capabilities': [
      'Site ID', 'CT Manufacturer', 'CT Model', 'Number of Slices',
      'Installation Date', 'Last Service Date', 'Status', 'Contrast Injection Available'
    ],
    'MRI Capabilities': [
      'Site ID', 'MRI Manufacturer', 'MRI Model', 'Field Strength',
      'Installation Date', 'Last Service Date', 'Status', 'Coils Available'
    ]
  };
  return standardColumns[tabName] || [];
};
