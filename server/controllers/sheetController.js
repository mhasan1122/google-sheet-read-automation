const { google } = require('googleapis');
const path = require('path');

const getSheetData = async (req, res) => {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: path.join(__dirname, '../../seraphic-lock-449704-c2-df3830160cec.json'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });
    const client = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: client });
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    const range = 'Sheet1'; // Adjust if your data is in a different sheet

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    console.log('Raw Data from Google Sheets:', response.data.values); // Log raw data

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: 'No data found' });
    }

    const headers = rows[0].map(header => header.trim());
    const rawData = rows.slice(1);

    // Filter only "Delivered" rows
    const filteredData = rawData.filter(row => row[headers.indexOf('Order Status')] === 'Delivered');

    console.log('Filtered Data:', filteredData); // Log filtered data

    // Group by Employee ID and calculate total sales
    const groupedByEmployee = {};
    filteredData.forEach(row => {
      const id = row[headers.indexOf('Employee ID')];
      const name = row[headers.indexOf('Employee Name')];
      const amount = parseFloat((row[headers.indexOf('Amount')] || '0').replace('$', ''));

      if (!groupedByEmployee[id]) {
        groupedByEmployee[id] = {
          id,
          name,
          totalSales: 0,
          projects: [],
        };
      }
      groupedByEmployee[id].totalSales += amount;
      groupedByEmployee[id].projects.push(amount);
    });

    const employees = Object.values(groupedByEmployee).sort((a, b) => b.totalSales - a.totalSales);

    // Calculate team sales
    const devSales = filteredData
      .filter(row => {
        const serviceLine = row[headers.indexOf('Service Line')];
        return serviceLine && serviceLine.includes('Website Development'); // Include "Website Development"
      })
      .reduce((sum, row) => sum + parseFloat((row[headers.indexOf('Amount')] || '0').replace('$', '')), 0);

    const dmSales = filteredData
      .filter(row => {
        const serviceLine = row[headers.indexOf('Service Line')];
        return (
          serviceLine &&
          !serviceLine.includes('Website Development') // Exclude "Website Development"
        );
      })
      .reduce((sum, row) => sum + parseFloat((row[headers.indexOf('Amount')] || '0').replace('$', '')), 0);

    // Calculate Today's Sales
    const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const todaysSales = filteredData
      .filter(row => {
        const rowDate = row[headers.indexOf('Date')]; // Assuming the Date column exists
        return rowDate && rowDate.trim() === today; // Match today's date
      })
      .reduce((sum, row) => sum + parseFloat((row[headers.indexOf('Amount')] || '0').replace('$', '')), 0);

    res.json({
      employees: employees.length > 0 ? employees : [],
      devSales,
      dmSales,
      todaysSales,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = { getSheetData };