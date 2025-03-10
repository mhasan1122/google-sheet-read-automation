const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { Server } = require("socket.io");
const http = require("http");
const path = require("path");
const { google } = require("googleapis");
const moment = require("moment");
const sheetRoutes = require("./routes/sheetRoutes");

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.use(cors());
app.use(express.json());
app.use("/api", sheetRoutes);

let previousData = null;

const pollSheetData = async () => {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: path.join(__dirname, "../bacalling-f4d1bef32c65.json"),
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

    const client = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: client });
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    const range = "Sheet1";

    // console.log("Polling Google Sheet...");
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      console.log("No data found in Google Sheet (poll).");
      const newData = {
        employees: [],
        todaysSales: 0,
        monthlySales: 0,
        devSales: 0,
        dmSales: 0,
      };
      io.emit("sheet-data-update", newData);
      previousData = newData;
      return;
    }

    // console.log("Raw data (poll, all rows):", rows);
    const headers = rows[0].map((header) => header.trim());
    // console.log("Headers (poll):", headers);
    const rawData = rows.slice(1);

    const filteredData = rawData.filter((row) => {
      const status = row[headers.indexOf("Order Status")];
      const isDelivered = status === "Delivered";
      if (!isDelivered) {
        console.log(`Row filtered out (not Delivered): ${row}`);
      }
      return isDelivered;
    });
    console.log("Delivered orders (poll):", filteredData);

    // Group Employee Sales (all data: past, present, future)
    const groupedByEmployee = {};
    filteredData.forEach((row) => {
      const id = row[headers.indexOf("Employee ID")] || "Unknown";
      const name = row[headers.indexOf("Employee Name")] || "Unnamed";
      const amount = parseFloat(
        (row[headers.indexOf("Deli _amount")] || "0").replace(/[$,]/g, "")
      );
      const deliDate = row[headers.indexOf("Date")] || "No Date";

      if (!groupedByEmployee[id]) {
        groupedByEmployee[id] = {
          id,
          name,
          totalSales: 0,
        };
      }
      groupedByEmployee[id].totalSales += amount;
      console.log(`Added ${amount} to totalSales for ${id} (${name}) on ${deliDate}`);
    });

    const employees = Object.values(groupedByEmployee).sort(
      (a, b) => b.totalSales - a.totalSales
    );
    console.log("Employees with totalSales:", employees);

    // Today's Sales (only March 9, 2025)
    const today = moment().startOf("day").format("YYYY-MM-DD"); // "2025-03-09"
    console.log("Today’s date for comparison:", today);
    const todaysSales = filteredData
      .filter((row) => {
        const deliDate = row[headers.indexOf("Date")];
        if (!deliDate) {
          console.log(`Row skipped (no Date): ${row}`);
          return false;
        }

        const formattedDeliDate = moment(
          deliDate,
          ["MMMM D, YYYY", "MM/DD/YYYY", "YYYY-MM-DD", "MMM DD, YYYY"],
          true
        );

        if (!formattedDeliDate.isValid()) {
          console.log(`Invalid date format for Date: ${deliDate}`);
          return false;
        }

        const formattedDateStr = formattedDeliDate.startOf("day").format("YYYY-MM-DD");
        console.log(`Comparing Date: ${deliDate} -> ${formattedDateStr} vs Today: ${today}`);
        const isToday = formattedDateStr === today;
        if (isToday) {
          console.log(`Match found for today: ${row}`);
        }
        return isToday;
      })
      .reduce(
        (sum, row) => {
          const amount = parseFloat(
            (row[headers.indexOf("Deli _amount")] || "0").replace(/[$,]/g, "")
          );
          console.log(`Adding to todaysSales: ${amount} from row: ${row}`);
          return sum + amount;
        },
        0
      );
    console.log("Today’s Sales calculated:", todaysSales);

    // Monthly Sales (March 2025 only)
    const currentMonthStart = moment().startOf("month").format("YYYY-MM-DD");
    const currentMonthEnd = moment().endOf("month").format("YYYY-MM-DD");
    console.log("Current month range:", currentMonthStart, "to", currentMonthEnd);
    const monthlySales = filteredData
      .filter((row) => {
        const deliDate = row[headers.indexOf("Date")];
        if (!deliDate) return false;

        const formattedDeliDate = moment(
          deliDate,
          ["MMMM D, YYYY", "MM/DD/YYYY", "YYYY-MM-DD", "MMM DD, YYYY"],
          true
        );

        if (!formattedDeliDate.isValid()) return false;

        const formattedDateStr = formattedDeliDate.startOf("day").format("YYYY-MM-DD");
        return (
          formattedDateStr >= currentMonthStart &&
          formattedDateStr <= currentMonthEnd
        );
      })
      .reduce(
        (sum, row) =>
          sum +
          parseFloat((row[headers.indexOf("Deli _amount")] || "0").replace(/[$,]/g, "")),
        0
      );
    console.log("Monthly Sales calculated:", monthlySales);

    // Dev Sales (all data: past, present, future)
    const devSales = filteredData
      .filter((row) => {
        const serviceLine = row[headers.indexOf("Service Line")] || "";
        const isDev = serviceLine.toLowerCase().includes("website development");
        if (isDev) {
          console.log(`Counting for devSales: ${row}`);
        }
        return isDev;
      })
      .reduce(
        (sum, row) => {
          const amount = parseFloat(
            (row[headers.indexOf("Deli _amount")] || "0").replace(/[$,]/g, "")
          );
          console.log(`Adding to devSales: ${amount} from row: ${row}`);
          return sum + amount;
        },
        0
      );
    console.log("Dev Sales calculated:", devSales);

    // DM Sales (all data: past, present, future)
    const dmSales = filteredData
      .filter((row) => {
        const serviceLine = row[headers.indexOf("Service Line")] || "";
        const isDM = !serviceLine.toLowerCase().includes("website development");
        if (isDM) {
          // console.log(`Counting for dmSales: ${row}`);
        }
        return isDM;
      })
      .reduce(
        (sum, row) => {
          const amount = parseFloat(
            (row[headers.indexOf("Deli _amount")] || "0").replace(/[$,]/g, "")
          );
          console.log(`Adding to dmSales: ${amount} from row: ${row}`);
          return sum + amount;
        },
        0
      );
    // console.log("DM Sales calculated:", dmSales);

    const currentData = {
      employees: employees.length > 0 ? employees : [],
      todaysSales,
      monthlySales,
      devSales,
      dmSales,
    };

    const currentDataString = JSON.stringify(currentData);
    const previousDataString = JSON.stringify(previousData);
    if (currentDataString !== previousDataString) {
      console.log("Sheet data updated, emitting:", currentData);
      previousData = JSON.parse(currentDataString);
      io.emit("sheet-data-update", currentData);
    } else {
      console.log("No changes detected in sheet data.");
    }
  } catch (error) {
    console.error("Error polling sheet data:", error.message);
    io.emit("sheet-data-update", {
      employees: [],
      todaysSales: 0,
      monthlySales: 0,
      devSales: 0,
      dmSales: 0,
    });
  }
};

setInterval(pollSheetData, 10000);

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  if (previousData) {
    socket.emit("sheet-data-update", previousData);
    console.log("Sent initial data to client:", previousData);
  }

  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});