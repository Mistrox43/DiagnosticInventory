import React from 'react';

const ValidationResults = ({ validationResults }) => {
  if (!validationResults || Object.keys(validationResults).length === 0) {
    return null;
  }

  const allIssues = Object.values(validationResults).flat();
  const errorCount = allIssues.filter(issue => issue.severity === 'error').length;
  const warningCount = allIssues.filter(issue => issue.severity === 'warning').length;

  const groupByFile = () => {
    const grouped = {};
    Object.entries(validationResults).forEach(([fileName, issues]) => {
      if (issues.length > 0) {
        grouped[fileName] = issues;
      }
    });
    return grouped;
  };

  const fileGroups = groupByFile();
  const hasIssues = Object.keys(fileGroups).length > 0;

  return (
    <div className="validation-results">
      <h2>Validation Results</h2>

      <div className="results-summary">
        <div className="summary-card total">
          <h3>{allIssues.length}</h3>
          <p>Total Issues</p>
        </div>
        <div className="summary-card errors">
          <h3>{errorCount}</h3>
          <p>Errors</p>
        </div>
        <div className="summary-card warnings">
          <h3>{warningCount}</h3>
          <p>Warnings</p>
        </div>
      </div>

      {!hasIssues ? (
        <div className="no-issues">
          All files passed validation!
        </div>
      ) : (
        Object.entries(fileGroups).map(([fileName, issues]) => (
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
        ))
      )}
    </div>
  );
};

export default ValidationResults;
