const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Server } = require('socket.io');
const http = require('http');
const path = require('path');
const { google } = require('googleapis');
const moment = require('moment');
const sheetRoutes = require('./routes/sheetRoutes'); // Import routes

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // Allow all origins
  },
});

app.use(cors());
app.use(express.json());

// Routes
app.use('/api', sheetRoutes);

// Polling mechanism to check for updates in Google Sheets
let previousData = null;

const pollSheetData = async () => {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: path.join(__dirname, 'bacalling-2e87e4c1d1f6.json'),
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
      return;
    }

    const headers = rows[0].map(header => header.trim());
    const rawData = rows.slice(1);

    // Filter and process data here...

    // Store the processed data for comparison
    const currentData = rawData; // Replace with actual processed data

    // If data has changed, emit the update
    if (JSON.stringify(currentData) !== JSON.stringify(previousData)) {
      previousData = currentData;
      // Emit updated data to all connected clients
      io.emit('sheet-data-update', { employees: currentData });
    }
  } catch (error) {
    console.error('Error polling sheet data:', error);
  }
};

// Poll every minute
setInterval(pollSheetData, 60000);

// Socket.io logic to handle connections
io.on('connection', (socket) => {
  console.log('A user connected');
  
  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
