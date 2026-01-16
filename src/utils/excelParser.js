import * as XLSX from 'xlsx';

/**
 * Parse an Excel file and extract data from specified tabs
 * @param {File} file - The Excel file to parse
 * @returns {Promise<Object>} - Parsed data with tab names as keys
 */
export const parseExcelFile = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        const parsedData = {
          fileName: file.name,
          sheets: {}
        };

        // Parse all sheets
        workbook.SheetNames.forEach(sheetName => {
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, {
            defval: null,
            raw: false // Convert dates to strings
          });

          parsedData.sheets[sheetName] = {
            data: jsonData,
            columns: jsonData.length > 0 ? Object.keys(jsonData[0]) : []
          };
        });

        resolve(parsedData);
      } catch (error) {
        reject(new Error(`Error parsing Excel file: ${error.message}`));
      }
    };

    reader.onerror = () => {
      reject(new Error('Error reading file'));
    };

    reader.readAsArrayBuffer(file);
  });
};

/**
 * Get standard and custom columns for a sheet
 * @param {Array<string>} sheetColumns - Columns in the sheet
 * @param {Array<string>} standardColumns - Standard columns for this sheet type
 * @returns {Object} - Object with standard and custom columns
 */
export const categorizeColumns = (sheetColumns, standardColumns) => {
  const standard = sheetColumns.filter(col => standardColumns.includes(col));
  const custom = sheetColumns.filter(col => !standardColumns.includes(col));
  const missing = standardColumns.filter(col => !sheetColumns.includes(col));

  return {
    standard,
    custom,
    missing
  };
};

/**
 * Export data to Excel file
 * @param {Object} data - Data organized by sheet name
 * @param {string} fileName - Name of the output file
 */
export const exportToExcel = (data, fileName) => {
  const workbook = XLSX.utils.book_new();

  Object.keys(data).forEach(sheetName => {
    const worksheet = XLSX.utils.json_to_sheet(data[sheetName]);
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  });

  XLSX.writeFile(workbook, fileName);
};
