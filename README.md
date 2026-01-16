# MRI/CT Site Directory Validator & Merger

A web-based application for validating and merging MRI/CT Site Directory Excel files (v5.1.1). This tool is designed for the Ontario Health - Central Wait Time Management Program. The application runs entirely in the browser with no backend required.

## Features

- **File Upload**: Upload multiple Site Directory Excel files (.xlsx, .xlsm)
- **Data Validation**: Comprehensive validation rules for three required sheets:
  - Site Information
  - CT Capabilities
  - MRI Capabilities
- **Detailed Error Reporting**: Explicit identification of sheet, row, column, and data quality issues
- **Custom Column Support**: Automatically handles extra columns added to standard templates
- **File Merging**: Combine multiple files into a single Excel file with deduplication
- **Zero Backend**: All processing happens locally in your browser - your data never leaves your computer
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

### File Structure

- **Headers**: Row 3 (Excel row 3)
- **Data**: Starts at Row 4 (Excel row 4)

### Required Sheets

Each Excel file must contain three sheets with the following names (exact match):

1. **Site Information**
2. **CT Capabilities**
3. **MRI Capabilities**

### Standard Columns

#### Site Information (35 columns)
- Facility ID (required)
- Site ID (required, unique)
- Facility Name (required)
- Site Name (required)
- Street Address (required)
- City (required)
- Postal Code (required, Canadian format: A1A 1A1)
- Ontario Health Region (required, validated against list)
- Sub-region (required, validated against region)
- Performs CT? (required, Yes/No)
- Performs MRI? (required, Yes/No)
- Site Phone CT (conditional on Performs CT)
- Site Fax CT (conditional on Performs CT)
- Site Phone MRI (conditional on Performs MRI)
- Site Fax MRI (conditional on Performs MRI)
- Booking Contact Email CT
- Booking Contact Email MRI
- Multi-site facility (Yes/No)
- Multi-site Name
- OHIP (required, Yes/No)
- WSIB (required, Yes/No)
- DND (required, Yes/No)
- IFH (required, Yes/No)
- RAMQ (required, Yes/No)
- Other Payment
- Wheelchair accessible (required, Yes/No)
- Stretcher accessible (required, Yes/No)
- Hoyer lift available (required, Yes/No)
- Hearing Impaired (required, Yes/No)
- Accessible parking (required, Yes/No)
- Bariatric patients (required, Yes/No)
- Interpreter Services (required, Yes/No)
- PICC/Port-a-Cath (required, Yes/No)
- Last Updated Date (required, date format)
- Completed By (required)

#### CT Capabilities (20 columns)
- Facility ID (required)
- Site ID (required)
- Facility Name
- Site Name
- Perform CT (required, Yes/No)
- Cardiac CT (required, Yes/No)
- Cardiac CT Exams (conditional on Cardiac CT)
- CT Myeloma Scan (required, Yes/No)
- CT Colonography (required, Yes/No)
- CT Guided Biopsy (required, Yes/No)
- CT Guided Biopsy Area (conditional on CT Guided Biopsy)
- Vascular CT (required, Yes/No)
- Vascular CT area (conditional on Vascular CT)
- Other exams
- Adult CT (required, Yes/No)
- General anesthesia (non-paediatric) (required, Yes/No)
- Paediatric CT (required, Yes/No)
- Min age non-sedate (required, 0-18 or "NA")
- Min age GA (required, 0-18 or "NA")
- Max weight CT (required, number)

#### MRI Capabilities (25 columns)
- Facility ID (required)
- Site ID (required)
- Facility Name
- Site Name
- Perform MRI (required, Yes/No)
- Cardiac MRI (required, Yes/No)
- Breast MRI (required, Yes/No)
- Vascular MRI (required, Yes/No)
- Vascular MRI area (conditional on Vascular MRI)
- Other exams
- CIED (required, Yes/No)
- Aneurysm clips (required, Yes/No)
- Aneurysm coils (required, Yes/No)
- Neurostimulator (required, Yes/No)
- Cochlear implant (required, Yes/No)
- Programmable shunts (required, Yes/No)
- Adult MRI (required, Yes/No)
- General anesthesia (non-paediatric) (required, Yes/No)
- Paediatric MRI (required, Yes/No)
- Min age non-sedate (required, 0-18 or "NA")
- Min age GA (required, 0-18 or "NA")
- Max weight MRI (required, number)
- 1.5T available (required, Yes/No)
- 3T available (required, Yes/No)
- Max bore diameter (required, number)

### Valid Ontario Health Regions and Sub-regions

**Central**
- Central West, Central, North Simcoe Muskoka, Mississauga Halton

**East**
- South East, Champlain, Central East

**Toronto**
- Toronto Central, Toronto North, Toronto South

**West**
- Erie St. Clair, South West, Waterloo Wellington, Hamilton Niagara Haldimand Brant

**North East**
- North East

**North West**
- North West

### Custom Columns

You can add any additional columns after the standard columns. Custom columns:
- Will not be validated
- Will be included in the merged output
- Will be preserved exactly as provided

## Validation Rules

The application performs comprehensive validation:

### Field-Level Validation
- Required field checks
- Data type validation (text, number, date)
- Format validation (postal code, email, phone)
- Value range checks (age 0-18 or "NA")
- Enumerated value checks (Yes/No, regions, etc.)

### Conditional Validation
- Phone/fax fields required when "Performs CT/MRI?" is "Yes"
- Detail fields required when parent capability is "Yes"

### Cross-Field Validation
- Sub-region must be valid for the selected Ontario Health Region

## Usage

1. **Upload Files**: Click the file input and select one or more Site Directory Excel files
2. **Validate**: Click "Validate Files" to run validation checks
3. **Review Results**: View detailed validation results with specific row, column, and field information
4. **Merge**: Click "Merge Files" to combine all files into a single Excel file
5. **Download**: The merged file will automatically download to your computer

## File Structure

```
DiagnosticInventory/
├── src/
│   ├── components/
│   │   ├── FileUpload.jsx          # File upload component
│   │   └── ValidationResults.jsx    # Validation results display
│   ├── utils/
│   │   ├── excelParser.js          # Excel file parsing and export
│   │   ├── validator.js            # Validation engine
│   │   └── merger.js               # File merging logic
│   ├── validationRules.js          # Complete schema and validation rules
│   ├── App.jsx                     # Main application component
│   ├── App.css                     # Application styles
│   ├── main.jsx                    # Application entry point
│   └── index.css                   # Global styles
├── index.html                      # HTML template
├── vite.config.js                  # Vite configuration
├── netlify.toml                    # Netlify configuration
└── package.json                    # Dependencies and scripts
```

## Version

This tool is designed for Site Directory Template **v5.1.1**

## Organization

Ontario Health - Central Wait Time Management Program

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License
