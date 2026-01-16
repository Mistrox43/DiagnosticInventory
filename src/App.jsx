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
      const deduplicationResult = deduplicateData(merged);
      const deduplicated = deduplicationResult.data;
      const duplicates = deduplicationResult.duplicates;

      // Get merge statistics
      const stats = getMergeStats(parsedFiles, deduplicated);

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().slice(0, 10);
      const fileName = `MRI_CT_Site_Directory_Merged_${timestamp}.xlsx`;

      // Export to Excel
      exportToExcel(deduplicated, fileName);

      // Show success message with stats
      let message = `Successfully merged ${stats.totalFiles} files!\n\n`;
      message += `Rows per tab:\n`;
      Object.entries(stats.totalRows).forEach(([tab, count]) => {
        message += `- ${tab}: ${count} rows\n`;
      });

      // Show duplicate information if any were found
      const totalDuplicates = Object.values(duplicates).reduce((sum, info) => sum + info.duplicateCount, 0);
      if (totalDuplicates > 0) {
        message += `\n⚠️ Duplicates removed during merge:\n`;
        Object.entries(duplicates).forEach(([tab, info]) => {
          if (info.duplicateCount > 0) {
            message += `- ${tab}: ${info.duplicateCount} duplicate row(s) removed\n`;
            if (info.duplicateSiteIds.length > 0) {
              message += `  Site IDs: ${info.duplicateSiteIds.join(', ')}\n`;
            }
          }
        });
        message += `\nNote: First occurrence of each Site ID was kept.\n`;
      }

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
        <h1>MRI/CT Site Directory Validator & Merger</h1>
        <p>Upload, validate, and merge Site Directory files (v5.1.1) - Ontario Health Central Wait Time Management Program</p>
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
        <ValidationResults
          validationResults={validationResults}
          parsedFiles={parsedFiles}
        />
      )}
    </div>
  );
}

export default App;
