# Diagnostic Inventory Validator

A web-based application for validating and merging Excel files containing diagnostic equipment inventory data. The application runs entirely in the browser with no backend required.

## Features

- **File Upload**: Upload multiple Excel files (.xlsx, .xls)
- **Data Validation**: Comprehensive validation rules for three required tabs:
  - Site Information
  - CT Capabilities
  - MRI Capabilities
- **Detailed Error Reporting**: Explicit identification of tab, row, and data quality issues
- **Custom Column Support**: Automatically handles extra columns added to standard templates
- **File Merging**: Combine multiple files into a single Excel file
- **Zero Backend**: All processing happens locally in your browser
- **Netlify Ready**: Configured for easy deployment to Netlify

## Tech Stack

- **Framework**: React 18
- **Build Tool**: Vite
- **Excel Processing**: SheetJS (xlsx)
- **Styling**: CSS3
- **Deployment**: Netlify

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd DiagnosticInventory
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open your browser to the URL shown in the terminal (typically `http://localhost:5173`)

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Deployment to Netlify

### Option 1: Netlify CLI

1. Install Netlify CLI:
```bash
npm install -g netlify-cli
```

2. Build and deploy:
```bash
npm run build
netlify deploy --prod --dir=dist
```

### Option 2: GitHub Integration

1. Push your code to GitHub
2. Connect your repository to Netlify
3. Netlify will automatically detect the settings from `netlify.toml`

## Excel File Requirements

### Required Tabs

Each Excel file must contain three tabs with the following names (exact match):

1. **Site Information**
2. **CT Capabilities**
3. **MRI Capabilities**

### Standard Columns

#### Site Information
- Site ID (required, unique)
- Site Name (required)
- Country (required)
- City
- Address
- Contact Name
- Contact Email (validated format)
- Contact Phone (validated format)
- Status (must be: Active, Inactive, or Pending)

#### CT Capabilities
- Site ID (required, must exist in Site Information)
- CT Manufacturer (required)
- CT Model (required)
- Number of Slices (required, positive integer)
- Installation Date (date format)
- Last Service Date (date format, must be after Installation Date)
- Status (must be: Operational, Under Maintenance, or Decommissioned)
- Contrast Injection Available (must be: Yes or No)

#### MRI Capabilities
- Site ID (required, must exist in Site Information)
- MRI Manufacturer (required)
- MRI Model (required)
- Field Strength (required, positive number like 1.5, 3.0, 7.0)
- Installation Date (date format)
- Last Service Date (date format, must be after Installation Date)
- Status (must be: Operational, Under Maintenance, or Decommissioned)
- Coils Available

### Custom Columns

You can add any additional columns to the standard templates. Custom columns:
- Will not be validated
- Will be included in the merged output
- Will be preserved exactly as provided

## Validation Rules

The application performs two types of validation:

### Single Field Validation
- Required field checks
- Data type validation
- Format validation (email, phone, dates)
- Value range checks
- Enumerated value checks

### Cross-Field Validation
- Date logical consistency (service date after installation date)
- Site ID uniqueness across files
- Site ID existence across tabs

## Usage

1. **Upload Files**: Click the file input and select one or more Excel files
2. **Validate**: Click "Validate Files" to run validation checks
3. **Review Results**: View detailed validation results with specific row and column information
4. **Merge**: Click "Merge Files" to combine all valid files into a single Excel file
5. **Download**: The merged file will automatically download to your computer

## File Structure

```
DiagnosticInventory/
├── src/
│   ├── components/
│   │   ├── FileUpload.jsx          # File upload component
│   │   └── ValidationResults.jsx    # Validation results display
│   ├── utils/
│   │   ├── excelParser.js          # Excel file parsing
│   │   ├── validator.js            # Validation engine
│   │   └── merger.js               # File merging logic
│   ├── validationRules.js          # Validation rule definitions
│   ├── App.jsx                     # Main application component
│   ├── App.css                     # Application styles
│   ├── main.jsx                    # Application entry point
│   └── index.css                   # Global styles
├── index.html                      # HTML template
├── vite.config.js                  # Vite configuration
├── netlify.toml                    # Netlify configuration
└── package.json                    # Dependencies and scripts
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License
