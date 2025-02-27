const { google } = require('googleapis');
const path = require('path');
const moment = require('moment');

const getSheetData = async (req, res) => {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: path.join(__dirname, '../../bacalling-2e87e4c1d1f6.json'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const client = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: client });
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    const range = 'Sheet1'; // Update if necessary

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: 'No data found' });
    }

    const headers = rows[0].map(header => header.trim());
    const rawData = rows.slice(1);

    // Filter only Delivered orders
    const filteredData = rawData.filter(row => row[headers.indexOf('Order Status')] === 'Delivered');

    // Group Employee Sales
    const groupedByEmployee = {};
    filteredData.forEach(row => {
      const id = row[headers.indexOf('Employee ID')];
      const name = row[headers.indexOf('Employee Name')];
      const amount = parseFloat((row[headers.indexOf('Amount')] || '0').replace(/[$,]/g, ''));

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

    // Calculate Dev Sales
    const devSales = filteredData
      .filter(row => {
        const serviceLine = row[headers.indexOf('Service Line')];
        return serviceLine && serviceLine.toLowerCase().includes('website development');
      })
      .reduce((sum, row) => sum + parseFloat((row[headers.indexOf('Amount')] || '0').replace(/[$,]/g, '')), 0);

    // Calculate DM Sales
    const dmSales = filteredData
      .filter(row => {
        const serviceLine = row[headers.indexOf('Service Line')];
        return serviceLine && !serviceLine.toLowerCase().includes('website development');
      })
      .reduce((sum, row) => sum + parseFloat((row[headers.indexOf('Amount')] || '0').replace(/[$,]/g, '')), 0);

    // Fix Today's Sales Calculation
    const today = moment().startOf('day').format('YYYY-MM-DD');
    console.log('Today (Expected Format):', today);

    const todaysSales = filteredData
      .filter(row => {
        const rowDate = row[headers.indexOf('Date')];

        if (!rowDate) {
          console.log('Skipping row - No date found:', row);
          return false;
        }

        // Normalize date using moment.js (strict parsing)
        const formattedRowDate = moment(rowDate, ['MMMM D, YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'], true)
          .startOf('day')
          .format('YYYY-MM-DD');

        console.log(`Row Date: ${rowDate} | Formatted: ${formattedRowDate} | Match: ${formattedRowDate === today}`);
        return formattedRowDate === today;
      })
      .reduce((sum, row) => sum + parseFloat((row[headers.indexOf('Amount')] || '0').replace(/[$,]/g, '')), 0);

    console.log("Final Calculated Today's Sales:", todaysSales);

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

