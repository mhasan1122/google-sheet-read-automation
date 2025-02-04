// App.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "./components/Navbar";
import Dashboard from "./components/Dashboard";
import SalesData from "./components/SalesData";
import WaveSpinner from "./components/WaveSpinner";
import Calendar from "./components/Calendar";
import DigitalWatch from "./components/DigitalWatch";

const App = () => {
  const [data, setData] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/sheet-data`
        );
        console.log("API Response:", response.data); // Log the API response
        setData(response.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  if (!data) {
    return <WaveSpinner />;
  }

  const filteredEmployees = data.employees.filter((employee) =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div
      className={`min-h-screen ${
        theme === "dark" ? "bg-[#1C263E] text-white" : "bg_gradient text-black"
      }`}
      style={{
        backgroundImage:
          theme === "light" &&
          `
          radial-gradient(
            circle,
            rgba(63, 94, 251, 0.2049194677871149) 0%,
            rgba(67, 162, 252, 0.16290266106442575) 100%,
            rgba(70, 230, 252, 0.008841036414565795) 100%
          )
        `,
      }}
    >
      {/* Navbar */}
      <Navbar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        toggleTheme={toggleTheme}
        theme={theme}
      />

      {/* Main Content */}
      <div className="container mx-auto p-4">
        {/* Title */}
        <h1 className="text-3xl font-bold mb-6 text-center mt-8">
          Dashboard for Sales
        </h1>

        {/* Calendar and Time */}
        <div className="flex justify-between items-center space-x-4 mb-8">
          <div className="text-xl font-bold">
            <Calendar />
          </div>
          <div className="text-xl font-bold">
            <DigitalWatch />
          </div>
        </div>

        {/* Dashboard Cards */}
        <div className="">
          <Dashboard
            totalSales={
              data?.employees?.reduce(
                (sum, emp) => sum + (emp.totalSales || 0),
                0
              ) || 0
            }
            topPerformer={data?.employees?.[0] || null}
            todaysSales={data?.todaysSales || 0}
            theme={theme} // Pass theme here
          />
        </div>

        {/* Left: Sales Data | Right: Team Sales */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          {/* Left: Sales Data */}
          <div>
            <SalesData employees={filteredEmployees} theme={theme} /> {/* Pass theme here */}
          </div>

          {/* Right: Team Sales */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Team Sales</h2>
            <div className="grid grid-cols-1 gap-4">
              <div
                style={{
                  backgroundColor: theme === "light" ? "#FFFFFF" : "#0A0A0A",
                  color: theme === "light" ? "#000000" : "#FFFFFF",
                }}
                className="p-6 rounded-lg shadow-md font-bold"
              >
                <h3 className="text-xl font-semibold">Dev Sales</h3>
                <p className="text-2xl">${data.devSales.toFixed(2)}</p>
              </div>
              <div
                style={{
                  backgroundColor: theme === "light" ? "#FFFFFF" : "#0A0A0A",
                  color: theme === "light" ? "#000000" : "#FFFFFF",
                }}
                className="p-6 rounded-lg shadow-md font-bold"
              >
                <h3 className="text-xl font-semibold">DM Sales</h3>
                <p className="text-2xl">${data.dmSales.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;