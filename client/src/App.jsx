import React, { useEffect, useState, useCallback } from "react";
import io from "socket.io-client";
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
  const [showPopup, setShowPopup] = useState(false);

  const handleSocketData = useCallback((newData) => {
    console.log("Received sheet data update:", newData);
    setData(newData);
  }, []);

  useEffect(() => {
    const socket = io(import.meta.env.VITE_BACKEND_URL.replace("/api", ""), {
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 500,
      timeout: 2000,
    });

    socket.on("sheet-data-update", handleSocketData);

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    socket.on("connect", () => {
      console.log("Socket connected successfully");
    });

    // Popup logic: Show every 5 seconds, hide after 2 seconds
    const popupInterval = setInterval(() => {
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 2000); // Hide after 2 seconds
    }, 5000); // Show every 5 seconds (5000ms)

    return () => {
      socket.disconnect();
      clearInterval(popupInterval);
      console.log("Socket disconnected");
    };
  }, [handleSocketData]);

  const toggleTheme = useCallback(() => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  }, []);

  if (!data) {
    return <WaveSpinner />;
  }

  const filteredEmployees = (data.employees || []).filter((employee) =>
    (employee.name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div
      className={`flex flex-col min-h-screen ${
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
      {/* Fixed Navbar */}
      <Navbar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        toggleTheme={toggleTheme}
        theme={theme}
      />

      {/* Main Content */}
      <div className="flex-1 container mx-auto p-4 pt-20 pb-20">
        <h1 className="text-3xl font-bold mb-6 text-center mt-8">
          Dashboard for Sales
        </h1>

        <div className="flex justify-between items-center space-x-4 mb-8">
          <div className="text-xl font-bold">
            <Calendar />
          </div>
          <div className="text-xl font-bold">
            <DigitalWatch />
          </div>
        </div>

        <div className={`${filteredEmployees.length > 5 ? "md:scale-90" : ""}`}>
          <Dashboard
            totalSales={
              data?.employees?.reduce(
                (sum, emp) => sum + (emp.totalSales || 0),
                0
              ) || 0
            }
            topPerformer={data?.employees?.[0] || null}
            todaysSales={data?.todaysSales || 0}
            theme={theme}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          {/* Removed max-h and overflow from SalesData */}
          <div>
            <SalesData employees={filteredEmployees} theme={theme} />
          </div>

          <div className={`${filteredEmployees.length > 5 ? "md:scale-90" : ""}`}>
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
                <p className="text-2xl">${(data.devSales || 0).toFixed(2)}</p>
              </div>
              <div
                style={{
                  backgroundColor: theme === "light" ? "#FFFFFF" : "#0A0A0A",
                  color: theme === "light" ? "#000000" : "#FFFFFF",
                }}
                className="p-6 rounded-lg shadow-md font-bold"
              >
                <h3 className="text-xl font-semibold">DM Sales</h3>
                <p className="text-2xl">${(data.dmSales || 0).toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Footer */}
      <footer
        className={`fixed bottom-0 w-full text-center py-4 font-bold z-10 ${
          theme === "dark" ? "bg-[#0A0A0A] text-blue-400" : "bg-[#b6e8f2] text-black"
        }`}
      >
        Made by FSD TEAM
      </footer>

      {/* Popup with Image (No Animation) */}
      {showPopup && (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 20,
            backgroundColor: theme === "light" ? "rgba(255, 255, 255, 0.9)" : "rgba(0, 0, 0, 0.9)",
            padding: "20px",
            borderRadius: "8px",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
          }}
        >
          <img
            src="https://res.cloudinary.com/dnk7d03vr/image/upload/v1741536446/amirul%20bhai.jpg"
            alt="Popup Image"
            style={{ width: "600px", height: "400px" }} // Consider 200px for visibility
          />
        </div>
      )}
    </div>
  );
};

export default App;