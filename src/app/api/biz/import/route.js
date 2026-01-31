import { NextResponse } from 'next/server';
import { createBusinessAdmin } from '../../../../services/biz';

/**
 * Parse CSV line handling quoted values
 * @param {string} line - CSV line
 * @returns {Array<string>} - Array of field values
 */
function parseCSVLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // End of field
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  // Add last field
  values.push(current.trim());
  
  return values;
}

/**
 * Parse CSV text into array of objects
 * @param {string} csvText - CSV file content as text
 * @returns {Array<Object>} - Array of parsed business objects
 */
function parseCSV(csvText) {
  const lines = csvText.trim().split(/\r?\n/);
  if (lines.length === 0) {
    return [];
  }

  // Get headers from first line
  const headerLine = lines[0];
  const headers = parseCSVLine(headerLine).map(h => h.trim().toLowerCase().replace(/^"|"$/g, ''));
  
  // Validate required headers
  const requiredFields = ['title', 'phone', 'city', 'type'];
  const missingFields = requiredFields.filter(field => !headers.includes(field));
  
  if (missingFields.length > 0) {
    throw new Error(`Missing required columns: ${missingFields.join(', ')}`);
  }

  // Parse data rows
  const businesses = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue; // Skip empty lines

    const values = parseCSVLine(line).map(v => v.replace(/^"|"$/g, '').trim());
    
    // Create business object
    const business = {};
    headers.forEach((header, index) => {
      business[header] = values[index] || '';
    });

    // Only add if title exists (required field)
    if (business.title) {
      businesses.push({
        title: business.title,
        phone: business.phone || '',
        city: business.city || '',
        type: business.type || '',
      });
    }
  }

  return businesses;
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Check file type
    if (!file.name.endsWith('.csv')) {
      return NextResponse.json(
        { error: 'File must be a CSV file' },
        { status: 400 }
      );
    }

    // Read file content
    const text = await file.text();
    
    // Parse CSV
    let businesses;
    try {
      businesses = parseCSV(text);
    } catch (parseError) {
      return NextResponse.json(
        { error: `CSV parsing error: ${parseError.message}` },
        { status: 400 }
      );
    }

    if (businesses.length === 0) {
      return NextResponse.json(
        { error: 'No valid businesses found in CSV file' },
        { status: 400 }
      );
    }

    // Insert businesses into database
    const results = {
      success: [],
      errors: [],
    };

    for (const businessData of businesses) {
      try {
        const newBusiness = await createBusinessAdmin(businessData);
        results.success.push(newBusiness);
      } catch (error) {
        results.errors.push({
          business: businessData,
          error: error.message,
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${results.success.length} businesses`,
      imported: results.success.length,
      failed: results.errors.length,
      errors: results.errors,
    });
  } catch (error) {
    console.error('Error importing businesses from CSV:', error);
    return NextResponse.json(
      { error: 'Failed to import businesses', message: error.message },
      { status: 500 }
    );
  }
}
