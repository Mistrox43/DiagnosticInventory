import React, { useState } from 'react';

const ValidationResults = ({ validationResults }) => {
  const [activeTab, setActiveTab] = useState('file-level');

  if (!validationResults || Object.keys(validationResults).length === 0) {
    return null;
  }

  const allIssues = Object.values(validationResults).flat();

  // Separate issues into file-level and cross-file categories
  const separateIssues = () => {
    const fileLevelIssues = {};
    const crossFileIssues = {};

    Object.entries(validationResults).forEach(([fileName, issues]) => {
      fileLevelIssues[fileName] = [];
      crossFileIssues[fileName] = [];

      issues.forEach(issue => {
        // Cross-file issues have the pattern "appears in multiple files"
        if (issue.message && issue.message.includes('appears in multiple files')) {
          crossFileIssues[fileName].push(issue);
        } else {
          fileLevelIssues[fileName].push(issue);
        }
      });
    });

    return { fileLevelIssues, crossFileIssues };
  };

  const { fileLevelIssues, crossFileIssues } = separateIssues();

  // Count issues for each category
  const fileLevelCount = Object.values(fileLevelIssues).flat().length;
  const crossFileCount = Object.values(crossFileIssues).flat().length;

  const fileLevelErrors = Object.values(fileLevelIssues).flat().filter(i => i.severity === 'error').length;
  const fileLevelWarnings = Object.values(fileLevelIssues).flat().filter(i => i.severity === 'warning').length;

  const crossFileErrors = Object.values(crossFileIssues).flat().filter(i => i.severity === 'error').length;
  const crossFileWarnings = Object.values(crossFileIssues).flat().filter(i => i.severity === 'warning').length;

  const renderIssuesByFile = (issuesByFile) => {
    const hasIssues = Object.values(issuesByFile).some(issues => issues.length > 0);

    if (!hasIssues) {
      return (
        <div className="no-issues">
          No issues found in this category!
        </div>
      );
    }

    return Object.entries(issuesByFile).map(([fileName, issues]) => {
      if (issues.length === 0) return null;

      return (
        <div key={fileName} className="file-results">
          <h3>{fileName}</h3>
          {issues.map((issue, index) => (
            <div key={index} className={`issue-item ${issue.severity}`}>
              <div className="issue-header">
                <span className="issue-location">
                  {issue.sheet} - Row {issue.row} - Col {issue.column} - {issue.field}
                </span>
                <span className={`issue-type ${issue.severity}`}>
                  {issue.severity}
                </span>
              </div>
              <div className="issue-description">
                {issue.message}
              </div>
            </div>
          ))}
        </div>
      );
    });
  };

  return (
    <div className="validation-results">
      <h2>Validation Results</h2>

      <div className="results-summary">
        <div className="summary-card total">
          <h3>{allIssues.length}</h3>
          <p>Total Issues</p>
        </div>
        <div className="summary-card errors">
          <h3>{fileLevelErrors + crossFileErrors}</h3>
          <p>Errors</p>
        </div>
        <div className="summary-card warnings">
          <h3>{fileLevelWarnings + crossFileWarnings}</h3>
          <p>Warnings</p>
        </div>
      </div>

      {allIssues.length === 0 ? (
        <div className="no-issues">
          All files passed validation!
        </div>
      ) : (
        <>
          <div className="validation-tabs">
            <button
              className={`validation-tab ${activeTab === 'file-level' ? 'active' : ''}`}
              onClick={() => setActiveTab('file-level')}
            >
              <span className="tab-label">File-Level Issues</span>
              <span className="tab-count">({fileLevelCount})</span>
              {fileLevelCount > 0 && (
                <span className="tab-breakdown">
                  {fileLevelErrors > 0 && <span className="error-badge">{fileLevelErrors} errors</span>}
                  {fileLevelWarnings > 0 && <span className="warning-badge">{fileLevelWarnings} warnings</span>}
                </span>
              )}
            </button>
            <button
              className={`validation-tab ${activeTab === 'cross-file' ? 'active' : ''}`}
              onClick={() => setActiveTab('cross-file')}
            >
              <span className="tab-label">Cross-File / Merge Issues</span>
              <span className="tab-count">({crossFileCount})</span>
              {crossFileCount > 0 && (
                <span className="tab-breakdown">
                  {crossFileErrors > 0 && <span className="error-badge">{crossFileErrors} errors</span>}
                  {crossFileWarnings > 0 && <span className="warning-badge">{crossFileWarnings} warnings</span>}
                </span>
              )}
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'file-level' && (
              <div className="tab-panel">
                <div className="tab-description">
                  <p>Issues found within individual files (field validation, duplicates within same file, format errors, etc.)</p>
                </div>
                {renderIssuesByFile(fileLevelIssues)}
              </div>
            )}

            {activeTab === 'cross-file' && (
              <div className="tab-panel">
                <div className="tab-description">
                  <p>Issues that occur when merging multiple files (duplicate Site IDs across files, conflicts, etc.)</p>
                </div>
                {renderIssuesByFile(crossFileIssues)}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ValidationResults;
