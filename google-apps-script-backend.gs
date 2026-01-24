/**
 * Ridgeline Pest Control - Google Apps Script Backend
 *
 * SETUP INSTRUCTIONS:
 * 1. Go to https://script.google.com and create a new project
 * 2. Copy and paste this entire file into the script editor
 * 3. Update the SPREADSHEET_ID below with your Google Sheet ID
 * 4. Update the EMAIL_RECIPIENT with your email address
 * 5. Click "Deploy" > "New deployment"
 * 6. Select type: "Web app"
 * 7. Set "Execute as": "Me"
 * 8. Set "Who has access": "Anyone"
 * 9. Click "Deploy" and authorize the script
 * 10. Copy the Web App URL and paste it into script.js as GOOGLE_APPS_SCRIPT_URL
 *
 * CREATING THE GOOGLE SHEET:
 * 1. Create a new Google Sheet
 * 2. Add these headers in Row 1: Timestamp | Name | Phone | Email | Address | Zip | Message | Page URL | Page Title
 * 3. Copy the spreadsheet ID from the URL (the long string between /d/ and /edit)
 * 4. Paste the ID below in SPREADSHEET_ID
 */

// =====================================================
// CONFIGURATION - UPDATE THESE VALUES
// =====================================================

// Your Google Sheet ID (find it in the sheet URL)
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';

// Sheet name (tab name at bottom of spreadsheet)
const SHEET_NAME = 'Leads';

// Email address to receive notifications
const EMAIL_RECIPIENT = 'your-email@example.com';

// Company name for email subject
const COMPANY_NAME = 'Ridgeline Pest Control';


// =====================================================
// DO NOT MODIFY BELOW THIS LINE
// =====================================================

/**
 * Handle POST requests from the website form
 */
function doPost(e) {
  try {
    // Parse the incoming JSON data
    const data = JSON.parse(e.postData.contents);

    // Log the submission
    console.log('Form submission received:', data);

    // Save to Google Sheet
    saveToSheet(data);

    // Send email notification
    sendEmailNotification(data);

    // Return success response
    return ContentService
      .createTextOutput(JSON.stringify({ success: true, message: 'Lead saved successfully' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    console.error('Error processing form:', error);

    return ContentService
      .createTextOutput(JSON.stringify({ success: false, message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handle GET requests (for testing)
 */
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({
      status: 'OK',
      message: 'Ridgeline Pest Control Lead Capture is running',
      timestamp: new Date().toISOString()
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Save lead data to Google Sheet
 */
function saveToSheet(data) {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = spreadsheet.getSheetByName(SHEET_NAME);

    // Create sheet if it doesn't exist
    if (!sheet) {
      sheet = spreadsheet.insertSheet(SHEET_NAME);
      // Add headers
      sheet.getRange(1, 1, 1, 9).setValues([[
        'Timestamp',
        'Name',
        'Phone',
        'Email',
        'Address',
        'Zip',
        'Message',
        'Page URL',
        'Page Title'
      ]]);
      // Format headers
      sheet.getRange(1, 1, 1, 9).setFontWeight('bold');
      sheet.setFrozenRows(1);
    }

    // Prepare row data
    const timestamp = data.submitted_at || new Date().toISOString();
    const row = [
      timestamp,
      data.name || '',
      data.phone || '',
      data.email || '',
      data.address || '',
      data.zip || '',
      data.message || '',
      data.page_url || '',
      data.page_title || ''
    ];

    // Append the row
    sheet.appendRow(row);

    console.log('Lead saved to sheet:', row);

  } catch (error) {
    console.error('Error saving to sheet:', error);
    throw error;
  }
}

/**
 * Send email notification for new lead
 */
function sendEmailNotification(data) {
  try {
    // Skip if no email recipient configured
    if (!EMAIL_RECIPIENT || EMAIL_RECIPIENT === 'your-email@example.com') {
      console.log('Email notification skipped - no recipient configured');
      return;
    }

    const subject = `New Lead - ${COMPANY_NAME}`;

    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #3E5A6D; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">New Lead Received!</h1>
        </div>

        <div style="padding: 20px; background-color: #f9f9f9;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold; width: 120px;">Name:</td>
              <td style="padding: 10px; border-bottom: 1px solid #ddd;">${data.name || 'Not provided'}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold;">Phone:</td>
              <td style="padding: 10px; border-bottom: 1px solid #ddd;">
                <a href="tel:${data.phone}" style="color: #3E5A6D;">${data.phone || 'Not provided'}</a>
              </td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold;">Email:</td>
              <td style="padding: 10px; border-bottom: 1px solid #ddd;">
                <a href="mailto:${data.email}" style="color: #3E5A6D;">${data.email || 'Not provided'}</a>
              </td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold;">Address:</td>
              <td style="padding: 10px; border-bottom: 1px solid #ddd;">${data.address || 'Not provided'}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold;">Zip:</td>
              <td style="padding: 10px; border-bottom: 1px solid #ddd;">${data.zip || 'Not provided'}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold; vertical-align: top;">Message:</td>
              <td style="padding: 10px; border-bottom: 1px solid #ddd;">${data.message || 'Not provided'}</td>
            </tr>
          </table>
        </div>

        <div style="padding: 15px; background-color: #e9e9e9; font-size: 12px; color: #666;">
          <p style="margin: 0 0 5px 0;"><strong>Source:</strong> ${data.page_title || 'Website'}</p>
          <p style="margin: 0 0 5px 0;"><strong>URL:</strong> ${data.page_url || 'N/A'}</p>
          <p style="margin: 0;"><strong>Submitted:</strong> ${data.submitted_at || new Date().toISOString()}</p>
        </div>

        <div style="padding: 20px; text-align: center; background-color: #3E5A6D;">
          <a href="tel:${data.phone}" style="display: inline-block; background-color: #E67E42; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Call ${data.name || 'Lead'} Now
          </a>
        </div>
      </div>
    `;

    const plainBody = `
New Lead - ${COMPANY_NAME}

Name: ${data.name || 'Not provided'}
Phone: ${data.phone || 'Not provided'}
Email: ${data.email || 'Not provided'}
Address: ${data.address || 'Not provided'}
Zip: ${data.zip || 'Not provided'}
Message: ${data.message || 'Not provided'}

Source: ${data.page_title || 'Website'}
URL: ${data.page_url || 'N/A'}
Submitted: ${data.submitted_at || new Date().toISOString()}
    `;

    MailApp.sendEmail({
      to: EMAIL_RECIPIENT,
      subject: subject,
      body: plainBody,
      htmlBody: htmlBody
    });

    console.log('Email notification sent to:', EMAIL_RECIPIENT);

  } catch (error) {
    console.error('Error sending email:', error);
    // Don't throw - email failure shouldn't fail the whole submission
  }
}

/**
 * Test function - run this to verify your setup works
 */
function testSubmission() {
  const testData = {
    name: 'Test User',
    phone: '(435) 555-1234',
    email: 'test@example.com',
    address: '123 Test Street',
    zip: '84604',
    message: 'Pest Type: ants | Location: Kitchen | This is a test submission',
    page_url: 'https://ridgelinepest.com/test',
    page_title: 'Test Page',
    submitted_at: new Date().toISOString()
  };

  console.log('Running test submission...');
  saveToSheet(testData);
  sendEmailNotification(testData);
  console.log('Test complete! Check your sheet and email.');
}
