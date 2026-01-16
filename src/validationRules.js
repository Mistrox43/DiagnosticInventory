// Validation rules for each tab
// Each rule has: field, description, validate function that returns true if valid

export const STANDARD_COLUMNS = {
  'Site Information': [
    'Site ID',
    'Site Name',
    'Country',
    'City',
    'Address',
    'Contact Name',
    'Contact Email',
    'Contact Phone',
    'Status'
  ],
  'CT Capabilities': [
    'Site ID',
    'CT Manufacturer',
    'CT Model',
    'Number of Slices',
    'Installation Date',
    'Last Service Date',
    'Status',
    'Contrast Injection Available'
  ],
  'MRI Capabilities': [
    'Site ID',
    'MRI Manufacturer',
    'MRI Model',
    'Field Strength',
    'Installation Date',
    'Last Service Date',
    'Status',
    'Coils Available'
  ]
};

export const VALIDATION_RULES = {
  'Site Information': [
    {
      field: 'Site ID',
      description: 'Site ID is required and must not be empty',
      validate: (value) => value !== undefined && value !== null && String(value).trim() !== ''
    },
    {
      field: 'Site ID',
      description: 'Site ID must be unique across all files',
      validate: (value, row, allData) => {
        if (!value) return true; // Skip if empty (caught by required check)
        const siteIds = allData.map(r => r['Site ID']).filter(id => id);
        const count = siteIds.filter(id => String(id).trim() === String(value).trim()).length;
        return count === 1;
      },
      crossFile: true
    },
    {
      field: 'Site Name',
      description: 'Site Name is required and must not be empty',
      validate: (value) => value !== undefined && value !== null && String(value).trim() !== ''
    },
    {
      field: 'Country',
      description: 'Country is required and must not be empty',
      validate: (value) => value !== undefined && value !== null && String(value).trim() !== ''
    },
    {
      field: 'Contact Email',
      description: 'Contact Email must be a valid email format if provided',
      validate: (value) => {
        if (!value || String(value).trim() === '') return true;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(String(value).trim());
      }
    },
    {
      field: 'Contact Phone',
      description: 'Contact Phone must contain only numbers, spaces, dashes, and parentheses if provided',
      validate: (value) => {
        if (!value || String(value).trim() === '') return true;
        const phoneRegex = /^[\d\s\-\(\)\+]+$/;
        return phoneRegex.test(String(value).trim());
      }
    },
    {
      field: 'Status',
      description: 'Status must be one of: Active, Inactive, Pending',
      validate: (value) => {
        if (!value) return false;
        const validStatuses = ['Active', 'Inactive', 'Pending'];
        return validStatuses.includes(String(value).trim());
      }
    }
  ],
  'CT Capabilities': [
    {
      field: 'Site ID',
      description: 'Site ID is required and must not be empty',
      validate: (value) => value !== undefined && value !== null && String(value).trim() !== ''
    },
    {
      field: 'Site ID',
      description: 'Site ID must exist in Site Information tab',
      validate: (value, row, allData, context) => {
        if (!value || !context?.siteInformation) return true;
        const siteIds = context.siteInformation.map(r => r['Site ID']).filter(id => id);
        return siteIds.some(id => String(id).trim() === String(value).trim());
      },
      crossTab: true
    },
    {
      field: 'CT Manufacturer',
      description: 'CT Manufacturer is required and must not be empty',
      validate: (value) => value !== undefined && value !== null && String(value).trim() !== ''
    },
    {
      field: 'CT Model',
      description: 'CT Model is required and must not be empty',
      validate: (value) => value !== undefined && value !== null && String(value).trim() !== ''
    },
    {
      field: 'Number of Slices',
      description: 'Number of Slices must be a positive number',
      validate: (value) => {
        if (!value) return false;
        const num = Number(value);
        return !isNaN(num) && num > 0 && Number.isInteger(num);
      }
    },
    {
      field: 'Installation Date',
      description: 'Installation Date must be a valid date',
      validate: (value) => {
        if (!value || String(value).trim() === '') return true;
        const date = new Date(value);
        return !isNaN(date.getTime());
      }
    },
    {
      field: 'Last Service Date',
      description: 'Last Service Date must be a valid date and not before Installation Date',
      validate: (value, row) => {
        if (!value || String(value).trim() === '') return true;
        const serviceDate = new Date(value);
        if (isNaN(serviceDate.getTime())) return false;

        if (row['Installation Date']) {
          const installDate = new Date(row['Installation Date']);
          if (!isNaN(installDate.getTime()) && serviceDate < installDate) {
            return false;
          }
        }
        return true;
      }
    },
    {
      field: 'Status',
      description: 'Status must be one of: Operational, Under Maintenance, Decommissioned',
      validate: (value) => {
        if (!value) return false;
        const validStatuses = ['Operational', 'Under Maintenance', 'Decommissioned'];
        return validStatuses.includes(String(value).trim());
      }
    },
    {
      field: 'Contrast Injection Available',
      description: 'Contrast Injection Available must be Yes or No',
      validate: (value) => {
        if (!value) return false;
        const valid = ['Yes', 'No', 'YES', 'NO', 'yes', 'no'];
        return valid.includes(String(value).trim());
      }
    }
  ],
  'MRI Capabilities': [
    {
      field: 'Site ID',
      description: 'Site ID is required and must not be empty',
      validate: (value) => value !== undefined && value !== null && String(value).trim() !== ''
    },
    {
      field: 'Site ID',
      description: 'Site ID must exist in Site Information tab',
      validate: (value, row, allData, context) => {
        if (!value || !context?.siteInformation) return true;
        const siteIds = context.siteInformation.map(r => r['Site ID']).filter(id => id);
        return siteIds.some(id => String(id).trim() === String(value).trim());
      },
      crossTab: true
    },
    {
      field: 'MRI Manufacturer',
      description: 'MRI Manufacturer is required and must not be empty',
      validate: (value) => value !== undefined && value !== null && String(value).trim() !== ''
    },
    {
      field: 'MRI Model',
      description: 'MRI Model is required and must not be empty',
      validate: (value) => value !== undefined && value !== null && String(value).trim() !== ''
    },
    {
      field: 'Field Strength',
      description: 'Field Strength must be a positive number (e.g., 1.5, 3.0, 7.0)',
      validate: (value) => {
        if (!value) return false;
        const num = Number(value);
        return !isNaN(num) && num > 0;
      }
    },
    {
      field: 'Installation Date',
      description: 'Installation Date must be a valid date',
      validate: (value) => {
        if (!value || String(value).trim() === '') return true;
        const date = new Date(value);
        return !isNaN(date.getTime());
      }
    },
    {
      field: 'Last Service Date',
      description: 'Last Service Date must be a valid date and not before Installation Date',
      validate: (value, row) => {
        if (!value || String(value).trim() === '') return true;
        const serviceDate = new Date(value);
        if (isNaN(serviceDate.getTime())) return false;

        if (row['Installation Date']) {
          const installDate = new Date(row['Installation Date']);
          if (!isNaN(installDate.getTime()) && serviceDate < installDate) {
            return false;
          }
        }
        return true;
      }
    },
    {
      field: 'Status',
      description: 'Status must be one of: Operational, Under Maintenance, Decommissioned',
      validate: (value) => {
        if (!value) return false;
        const validStatuses = ['Operational', 'Under Maintenance', 'Decommissioned'];
        return validStatuses.includes(String(value).trim());
      }
    },
    {
      field: 'Coils Available',
      description: 'Coils Available should list available coils if provided',
      validate: (value) => {
        // This is a text field, just check it's not empty if required
        return true; // Optional field
      }
    }
  ]
};
