// Validation rules for MRI/CT Site Directory v5.1.1
// Based on Ontario Health - Central Wait Time Management Program template

// Valid regions and their corresponding sub-regions
export const VALID_REGIONS = ['Central', 'East', 'North East', 'North West', 'Toronto', 'West'];

export const VALID_SUBREGIONS = {
  'Central': ['Central West', 'Central', 'North Simcoe Muskoka', 'Mississauga Halton'],
  'East': ['South East', 'Champlain', 'Central East'],
  'Toronto': ['Toronto Central', 'Toronto North', 'Toronto South'],
  'West': ['Erie St. Clair', 'South West', 'Waterloo Wellington', 'Hamilton Niagara Haldimand Brant'],
  'North East': ['North East'],
  'North West': ['North West']
};

// Template schema definition - headers at row 3 (index 2), data starts at row 4 (index 3)
export const TEMPLATE_SCHEMA = {
  'Site Information': {
    headerRow: 2,
    dataStartRow: 3,
    requiredFields: [
      { col: 0, name: 'Facility ID*', type: 'text', required: true },
      { col: 1, name: 'Site ID*', type: 'text', required: true },
      { col: 2, name: 'Facility Name*', type: 'text', required: true },
      { col: 3, name: 'Site Name*', type: 'text', required: true },
      { col: 4, name: 'Street Address*', type: 'text', required: true },
      { col: 5, name: 'City*', type: 'text', required: true },
      { col: 6, name: 'Postal Code*', type: 'postal', required: true },
      { col: 7, name: 'Ontario Health Region*', type: 'region', required: true },
      { col: 8, name: 'Sub-region*', type: 'subregion', required: true },
      { col: 9, name: 'Performs CT?*', type: 'yesno', required: true },
      { col: 10, name: 'Performs MRI?*', type: 'yesno', required: true },
      { col: 11, name: 'Site Phone CT**', type: 'phone', required: false, conditionalOn: { col: 9, value: 'Yes' } },
      { col: 12, name: 'Site Fax CT**', type: 'phone', required: false, conditionalOn: { col: 9, value: 'Yes' } },
      { col: 13, name: 'Site Phone MRI**', type: 'phone', required: false, conditionalOn: { col: 10, value: 'Yes' } },
      { col: 14, name: 'Site Fax MRI**', type: 'phone', required: false, conditionalOn: { col: 10, value: 'Yes' } },
      { col: 15, name: 'Booking Contact Email CT', type: 'email', required: false },
      { col: 16, name: 'Booking Contact Email MRI', type: 'email', required: false },
      { col: 17, name: 'Multi-site facility that processes referrals at a single site', type: 'yesno', required: false },
      { col: 18, name: 'Name of Site, if answered Yes to, Multi-site facility that processes referrals at a single site', type: 'text', required: false, conditionalOn: { col: 17, value: 'Yes' } },
      { col: 19, name: 'OHIP*', type: 'yesno', required: true },
      { col: 20, name: 'WSIB*', type: 'yesno', required: true },
      { col: 21, name: 'DND*', type: 'yesno', required: true },
      { col: 22, name: 'IFH*', type: 'yesno', required: true },
      { col: 23, name: 'RAMQ*', type: 'yesno', required: true },
      { col: 24, name: 'Other (specify)', type: 'text', required: false },
      { col: 25, name: 'Wheelchair accessible*', type: 'yesno', required: true },
      { col: 26, name: 'Stretcher accessible*', type: 'yesno', required: true },
      { col: 27, name: 'Hoyer lift available*', type: 'yesno', required: true },
      { col: 28, name: 'Hearing Impaired*', type: 'yesno', required: true },
      { col: 29, name: 'Accessible parking*', type: 'yesno', required: true },
      { col: 30, name: 'Bariatric patients*', type: 'yesno', required: true },
      { col: 31, name: 'Interpreter Services (e.g., phone, online)*', type: 'yesno', required: true },
      { col: 32, name: 'Can manage PICC line or Port-a-Cath for vascular access?*', type: 'yesno', required: true },
      { col: 33, name: 'Last Updated Date*', type: 'date', required: true },
      { col: 34, name: 'Completed By*', type: 'text', required: true }
    ]
  },
  'CT Capabilities': {
    headerRow: 2,
    dataStartRow: 3,
    requiredFields: [
      { col: 0, name: 'Facility ID', type: 'text', required: false },
      { col: 1, name: 'Site ID', type: 'text', required: false },
      { col: 2, name: 'Facility Name', type: 'text', required: false },
      { col: 3, name: 'Site Name', type: 'text', required: false },
      { col: 4, name: 'Perform CT (including Head, Neck, Spine, Thorax, Abdomen Pelvis, and MSK)*', type: 'yesno', required: true },
      { col: 5, name: 'Cardiac CT*', type: 'yesno', required: true },
      { col: 6, name: 'Cardiac CT Exams (multiselect)**', type: 'multiselect', required: false, conditionalOn: { col: 5, value: 'Yes' } },
      { col: 7, name: 'CT Myeloma Scan*', type: 'yesno', required: true },
      { col: 8, name: 'CT Colonography*', type: 'yesno', required: true },
      { col: 9, name: 'CT Guided Biopsy*', type: 'yesno', required: true },
      { col: 10, name: 'CT Guided Biopsy Area (multiselect)**', type: 'multiselect', required: false, conditionalOn: { col: 9, value: 'Yes' } },
      { col: 11, name: 'Vascular CT*', type: 'yesno', required: true },
      { col: 12, name: 'Vascular CT area (multiselect)**', type: 'multiselect', required: false, conditionalOn: { col: 11, value: 'Yes' } },
      { col: 13, name: 'Other exams performed not listed: specify (Please refer to SRF)', type: 'text', required: false },
      { col: 14, name: 'Adult CT*', type: 'yesno', required: true },
      { col: 15, name: 'General anesthesia (non-paediatric)*', type: 'yesno', required: true },
      { col: 16, name: 'Paediatric CT*', type: 'yesno', required: true },
      { col: 17, name: 'Minimum age for Paed exam non-sedate (NA if service is not offered)*', type: 'age', required: true },
      { col: 18, name: 'Minimum age for Paed exam with general anesthesia (NA if service is not offered)*', type: 'age', required: true },
      { col: 19, name: 'Maximum patient weight for CT (kg)*', type: 'number', required: true }
    ]
  },
  'MRI Capabilities': {
    headerRow: 2,
    dataStartRow: 3,
    requiredFields: [
      { col: 0, name: 'Facility ID', type: 'text', required: false },
      { col: 1, name: 'Site ID', type: 'text', required: false },
      { col: 2, name: 'Facility Name', type: 'text', required: false },
      { col: 3, name: 'Site Name', type: 'text', required: false },
      { col: 4, name: 'Perform MRI (including Head, Neck, Spine, Thorax, Abdomen, Pelvis, and MSK)*', type: 'yesno', required: true },
      { col: 5, name: 'Cardiac MRI*', type: 'yesno', required: true },
      { col: 6, name: 'Breast MRI*', type: 'yesno', required: true },
      { col: 7, name: 'Vascular MRI*', type: 'yesno', required: true },
      { col: 8, name: 'Vascular MRI area (multiselect)**', type: 'multiselect', required: false, conditionalOn: { col: 7, value: 'Yes' } },
      { col: 9, name: 'Other exams performed not listed: specify (Please refer to SRF)', type: 'text', required: false },
      { col: 10, name: 'Cardiac Implantable Electronic Device (e.g., Pacemaker, ICD)*', type: 'yesno', required: true },
      { col: 11, name: 'Aneurysm clips*', type: 'yesno', required: true },
      { col: 12, name: 'Aneurysm coils*', type: 'yesno', required: true },
      { col: 13, name: 'Neurostimulator*', type: 'yesno', required: true },
      { col: 14, name: 'Cochlear implant*', type: 'yesno', required: true },
      { col: 15, name: 'Programmable shunts*', type: 'yesno', required: true },
      { col: 16, name: 'Adult MRI*', type: 'yesno', required: true },
      { col: 17, name: 'General anesthesia (non-paediatric)*', type: 'yesno', required: true },
      { col: 18, name: 'Paediatric MRI*', type: 'yesno', required: true },
      { col: 19, name: 'Minimum age for Paed exam non-sedate (NA if service is not offered)*', type: 'age', required: true },
      { col: 20, name: 'Minimum age for Paed exam with general anesthesia (NA if service is not offered)*', type: 'age', required: true },
      { col: 21, name: 'Maximum patient weight for MRI (kg)*', type: 'number', required: true },
      { col: 22, name: '1.5T available*', type: 'yesno', required: true },
      { col: 23, name: '3T available*', type: 'yesno', required: true },
      { col: 24, name: 'Max bore diameter (cm)*', type: 'number', required: true }
    ]
  }
};

/**
 * Validate a single value based on its type
 * @param {*} value - The value to validate
 * @param {string} type - The validation type
 * @param {string} fieldName - The field name (for error messages)
 * @param {Array} rowData - The entire row data (for conditional validation)
 * @param {Object} fieldDef - The field definition
 * @returns {Object} - { valid: boolean, message: string }
 */
export function validateValue(value, type, fieldName, rowData, fieldDef) {
  const strValue = value !== undefined && value !== null ? String(value).trim() : '';

  // Check conditional requirements
  if (fieldDef.conditionalOn) {
    const conditionValue = rowData[fieldDef.conditionalOn.col];
    const conditionMet = String(conditionValue).trim().toLowerCase() === fieldDef.conditionalOn.value.toLowerCase();

    if (conditionMet && !strValue) {
      return { valid: false, message: `Required when ${findFieldNameByCol(rowData, fieldDef.conditionalOn.col)} is "${fieldDef.conditionalOn.value}"` };
    }

    // If condition not met, field is optional
    if (!conditionMet) {
      return { valid: true };
    }
  }

  // Check required fields
  if (fieldDef.required && !strValue) {
    return { valid: false, message: 'Required field is empty' };
  }

  // If not required and empty, it's valid
  if (!strValue) return { valid: true };

  // Type-specific validation
  switch (type) {
    case 'yesno':
      if (!['yes', 'no'].includes(strValue.toLowerCase())) {
        return { valid: false, message: `Must be "Yes" or "No", got "${strValue}"` };
      }
      break;

    case 'region':
      if (!VALID_REGIONS.includes(strValue)) {
        return { valid: false, message: `Invalid region "${strValue}". Must be one of: ${VALID_REGIONS.join(', ')}` };
      }
      break;

    case 'postal':
      const postalRegex = /^[A-Za-z]\d[A-Za-z][ ]?\d[A-Za-z]\d$/;
      if (!postalRegex.test(strValue)) {
        return { valid: false, message: `Invalid postal code format "${strValue}". Expected format: A1A 1A1` };
      }
      break;

    case 'email':
      if (strValue && !strValue.includes('@')) {
        return { valid: false, message: `Invalid email format "${strValue}"` };
      }
      break;

    case 'phone':
      const digits = strValue.replace(/\D/g, '');
      if (digits.length < 10) {
        return { valid: false, message: `Phone number should have at least 10 digits, got ${digits.length}` };
      }
      break;

    case 'number':
      if (isNaN(Number(strValue))) {
        return { valid: false, message: `Must be a number, got "${strValue}"` };
      }
      break;

    case 'age':
      if (strValue.toLowerCase() !== 'na') {
        const age = Number(strValue);
        if (isNaN(age) || age < 0 || age > 18) {
          return { valid: false, message: `Must be 0-18 or "NA", got "${strValue}"` };
        }
      }
      break;

    case 'date':
      const dateVal = new Date(strValue);
      if (isNaN(dateVal.getTime())) {
        return { valid: false, message: `Invalid date format "${strValue}"` };
      }
      break;

    case 'multiselect':
      // Multiselect fields can contain comma-separated values - just validate not empty if required
      // No specific validation needed beyond required check
      break;

    case 'text':
    default:
      // Text fields - no specific validation beyond required check
      break;
  }

  return { valid: true };
}

/**
 * Validate sub-region against its region
 * @param {string} region - The region value
 * @param {string} subregion - The sub-region value
 * @returns {Object} - { valid: boolean, message: string }
 */
export function validateSubregion(region, subregion) {
  if (!region || !subregion) return { valid: true };

  const validSubs = VALID_SUBREGIONS[region];
  if (!validSubs) return { valid: true };

  if (!validSubs.includes(subregion)) {
    return {
      valid: false,
      message: `Sub-region "${subregion}" is not valid for region "${region}". Valid options: ${validSubs.join(', ')}`
    };
  }

  return { valid: true };
}

/**
 * Helper function to find field name by column index
 * @param {Array} rowData - The row data
 * @param {number} col - The column index
 * @returns {string} - The field name
 */
function findFieldNameByCol(rowData, col) {
  // This is a helper for error messages - in practice we'd need to pass schema
  return `column ${col}`;
}
