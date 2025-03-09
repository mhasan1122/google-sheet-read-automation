const { google } = require("googleapis");
const path = require("path");
const moment = require("moment");

const getSheetData = async (req, res) => {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: path.join(__dirname, "../bacalling-f4d1bef32c65.json"),
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

    const client = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: client });
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    const range = "Sheet1";

    console.log("Fetching data from Google Sheet (API)...");
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      console.log("No data found in Google Sheet (API).");
      return res.json({
        employees: [],
        todaysSales: 0,
        monthlySales: 0,
        devSales: 0,
        dmSales: 0,
      });
    }

    console.log("Raw data (API, all rows):", rows);
    const headers = rows[0].map((header) => header.trim());
    console.log("Headers (API):", headers);
    const rawData = rows.slice(1);

    const filteredData = rawData.filter((row) => {
      const status = row[headers.indexOf("Order Status")];
      const isDelivered = status === "Delivered";
      if (!isDelivered) {
        console.log(`API Row filtered out (not Delivered): ${row}`);
      }
      return isDelivered;
    });
    console.log("Delivered orders (API):", filteredData);

    const groupedByEmployee = {};
    filteredData.forEach((row) => {
      const id = row[headers.indexOf("Employee ID")] || "Unknown";
      const name = row[headers.indexOf("Employee Name")] || "Unnamed";
      const amount = parseFloat(
        (row[headers.indexOf("Deli _amount")] || "0").replace(/[$,]/g, "")
      );

      if (!groupedByEmployee[id]) {
        groupedByEmployee[id] = {
          id,
          name,
          totalSales: 0,
        };
      }
      groupedByEmployee[id].totalSales += amount;
      console.log(`API Added ${amount} to totalSales for ${id} (${name}) from row: ${row}`);
    });

    const employees = Object.values(groupedByEmployee).sort(
      (a, b) => b.totalSales - a.totalSales
    );

    const today = moment().startOf("day").format("YYYY-MM-DD");
    console.log("Today’s date for API comparison:", today);
    const todaysSales = filteredData
      .filter((row) => {
        const deliDate = row[headers.indexOf("Deli_Date")];
        if (!deliDate) {
          console.log(`API Row skipped (no Deli_Date): ${row}`);
          return false;
        }

        const formattedDeliDate = moment(
          deliDate,
          ["MMMM D, YYYY", "MM/DD/YYYY", "YYYY-MM-DD", "MMM DD, YYYY"],
          true
        );

        if (!formattedDeliDate.isValid()) {
          console.log(`API Invalid date format for Deli_Date: ${deliDate}`);
          return false;
        }

        const formattedDateStr = formattedDeliDate.startOf("day").format("YYYY-MM-DD");
        console.log(`API Comparing Deli_Date: ${deliDate} -> ${formattedDateStr} vs Today: ${today}`);
        const isToday = formattedDateStr === today;
        if (isToday) {
          console.log(`API Match found for today: ${row}`);
        }
        return isToday;
      })
      .reduce(
        (sum, row) => {
          const amount = parseFloat(
            (row[headers.indexOf("Deli _amount")] || "0").replace(/[$,]/g, "")
          );
          console.log(`API Adding to todaysSales: ${amount} from row: ${row}`);
          return sum + amount;
        },
        0
      );

    const currentMonthStart = moment().startOf("month").format("YYYY-MM-DD");
    const currentMonthEnd = moment().endOf("month").format("YYYY-MM-DD");
    const monthlySales = filteredData
      .filter((row) => {
        const deliDate = row[headers.indexOf("Deli_Date")];
        if (!deliDate) return false; // Fixed syntax here

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

    const devSales = filteredData
      .filter((row) => {
        const serviceLine = row[headers.indexOf("Service Line")] || "";
        const isDev = serviceLine.toLowerCase().includes("website development");
        if (isDev) {
          console.log(`API Counting for devSales: ${row}`);
        }
        return isDev;
      })
      .reduce(
        (sum, row) => {
          const amount = parseFloat(
            (row[headers.indexOf("Deli _amount")] || "0").replace(/[$,]/g, "")
          );
          console.log(`API Adding to devSales: ${amount} from row: ${row}`);
          return sum + amount;
        },
        0
      );

    const dmSales = filteredData
      .filter((row) => {
        const serviceLine = row[headers.indexOf("Service Line")] || "";
        const isDM = !serviceLine.toLowerCase().includes("website development");
        if (isDM) {
          console.log(`API Counting for dmSales: ${row}`);
        }
        return isDM;
      })
      .reduce(
        (sum, row) => {
          const amount = parseFloat(
            (row[headers.indexOf("Deli _amount")] || "0").replace(/[$,]/g, "")
          );
          console.log(`API Adding to dmSales: ${amount} from row: ${row}`);
          return sum + amount;
        },
        0
      );

    const responseData = {
      employees: employees.length > 0 ? employees : [],
      todaysSales,
      monthlySales,
      devSales,
      dmSales,
    };

    console.log("API Response data:", responseData);
    res.json(responseData);
  } catch (error) {
    console.error("Error in getSheetData:", error.message);
    res.status(500).json({
      message: "Internal Server Error",
      employees: [],
      todaysSales: 0,
      monthlySales: 0,
      devSales: 0,
      dmSales: 0,
    });
  }
};

module.exports = { getSheetData };