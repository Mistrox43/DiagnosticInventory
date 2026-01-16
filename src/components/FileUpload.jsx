import React from 'react';

const FileUpload = ({ files, onFilesChange, onRemoveFile }) => {
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const excelFiles = selectedFiles.filter(file =>
      file.name.endsWith('.xlsx') || file.name.endsWith('.xls')
    );

    if (excelFiles.length !== selectedFiles.length) {
      alert('Only Excel files (.xlsx, .xls) are supported');
    }

    if (excelFiles.length > 0) {
      onFilesChange(excelFiles);
    }
  };

  const getStatusBadge = (file) => {
    if (!file.validated) {
      return <span className="status-badge pending">Pending</span>;
    }

    const hasErrors = file.issues && file.issues.length > 0;
    if (hasErrors) {
      return <span className="status-badge invalid">{file.issues.length} Issues</span>;
    }

    return <span className="status-badge valid">Valid</span>;
  };

  return (
    <div className="upload-section">
      <h2>Upload Excel Files</h2>
      <p style={{ marginBottom: '15px', color: '#666' }}>
        Upload one or more Excel files containing Site Information, CT Capabilities, and MRI Capabilities tabs
      </p>

      <div className="file-input-wrapper">
        <input
          type="file"
          multiple
          accept=".xlsx,.xls"
          onChange={handleFileChange}
          className="file-input"
        />
      </div>

      {files.length > 0 && (
        <div className="uploaded-files">
          <h3 style={{ marginBottom: '15px' }}>Uploaded Files ({files.length})</h3>
          {files.map((file, index) => (
            <div key={index} className="file-item">
              <span className="file-name">{file.name}</span>
              <div className="file-status">
                {getStatusBadge(file)}
                <button
                  onClick={() => onRemoveFile(index)}
                  className="remove-btn"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
