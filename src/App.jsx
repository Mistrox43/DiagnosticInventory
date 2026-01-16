import React, { useState } from 'react';
import FileUpload from './components/FileUpload';
import ValidationResults from './components/ValidationResults';
import { parseExcelFile } from './utils/excelParser';
import { validateAllFiles } from './utils/validator';
import { mergeFiles, deduplicateData, getMergeStats } from './utils/merger';
import { exportToExcel } from './utils/excelParser';
import './App.css';

function App() {
  const [files, setFiles] = useState([]);
  const [parsedFiles, setParsedFiles] = useState([]);
  const [validationResults, setValidationResults] = useState({});
  const [isValidating, setIsValidating] = useState(false);

  const handleFilesChange = async (newFiles) => {
    const fileObjects = newFiles.map(file => ({
      file,
      name: file.name,
      validated: false,
      issues: []
    }));

    setFiles(prev => [...prev, ...fileObjects]);
  };

  const handleRemoveFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setParsedFiles(prev => prev.filter((_, i) => i !== index));

    // Update validation results
    const fileToRemove = files[index];
    setValidationResults(prev => {
      const newResults = { ...prev };
      delete newResults[fileToRemove.name];
      return newResults;
    });
  };

  const handleValidate = async () => {
    setIsValidating(true);

    try {
      // Parse all files
      const parsed = await Promise.all(
        files.map(fileObj => parseExcelFile(fileObj.file))
      );

      setParsedFiles(parsed);

      // Validate all files
      const results = validateAllFiles(parsed);
      setValidationResults(results);

      // Update file objects with validation status
      const updatedFiles = files.map((fileObj, index) => ({
        ...fileObj,
        validated: true,
        issues: results[fileObj.name] || []
      }));

      setFiles(updatedFiles);
    } catch (error) {
      console.error('Error during validation:', error);
      alert(`Error during validation: ${error.message}`);
    } finally {
      setIsValidating(false);
    }
  };

  const handleMerge = () => {
    if (parsedFiles.length === 0) {
      alert('Please validate files first before merging');
      return;
    }

    try {
      // Merge files
      const merged = mergeFiles(parsedFiles);

      // Deduplicate based on Site ID
      const deduplicated = deduplicateData(merged);

      // Get merge statistics
      const stats = getMergeStats(parsedFiles, deduplicated);

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      const fileName = `merged_diagnostic_inventory_${timestamp}.xlsx`;

      // Export to Excel
      exportToExcel(deduplicated, fileName);

      // Show success message with stats
      let message = `Successfully merged ${stats.totalFiles} files!\n\n`;
      message += `Rows per tab:\n`;
      Object.entries(stats.totalRows).forEach(([tab, count]) => {
        message += `- ${tab}: ${count} rows\n`;
      });

      if (Object.values(stats.customColumns).some(cols => cols.length > 0)) {
        message += `\nCustom columns included:\n`;
        Object.entries(stats.customColumns).forEach(([tab, cols]) => {
          if (cols.length > 0) {
            message += `- ${tab}: ${cols.join(', ')}\n`;
          }
        });
      }

      alert(message);
    } catch (error) {
      console.error('Error during merge:', error);
      alert(`Error during merge: ${error.message}`);
    }
  };

  const allFilesValidated = files.length > 0 && files.every(f => f.validated);
  const hasFiles = files.length > 0;

  return (
    <div className="app">
      <div className="header">
        <h1>Diagnostic Inventory Validator</h1>
        <p>Upload, validate, and merge Excel files with Site Information, CT Capabilities, and MRI Capabilities</p>
      </div>

      <FileUpload
        files={files}
        onFilesChange={handleFilesChange}
        onRemoveFile={handleRemoveFile}
      />

      {hasFiles && (
        <div className="action-buttons">
          <button
            onClick={handleValidate}
            disabled={isValidating}
            className="btn btn-primary"
          >
            {isValidating ? 'Validating...' : 'Validate Files'}
          </button>

          <button
            onClick={handleMerge}
            disabled={!allFilesValidated}
            className="btn btn-success"
          >
            Merge Files
          </button>
        </div>
      )}

      {allFilesValidated && (
        <ValidationResults validationResults={validationResults} />
      )}
    </div>
  );
}

export default App;
