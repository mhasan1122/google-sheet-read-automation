import React, { useEffect, useState, useCallback } from "react";
import io from "socket.io-client";
import Navbar from "./components/Navbar";
import Dashboard from "./components/Dashboard";
import SalesData from "./components/SalesData";
import WaveSpinner from "./components/WaveSpinner";
import Calendar from "./components/Calendar";
import DigitalWatch from "./components/DigitalWatch";
import party from "party-js"; // Import party-js

const App = () => {
  const [data, setData] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [theme, setTheme] = useState("light");
  const [showImagePopup, setShowImagePopup] = useState(false);
  const [showSalesPopup, setShowSalesPopup] = useState(false);
  const [audio, setAudio] = useState(null);
  const [prevEmployees, setPrevEmployees] = useState([]);

  // List of MP3 URLs
  const mp3Urls = [
    "https://res.cloudinary.com/dnk7d03vr/video/upload/v1741593847/mp3/work2.mp3",
    "https://res.cloudinary.com/dnk7d03vr/video/upload/v1741593908/mp3/screenshot.mp3",
    "https://res.cloudinary.com/dnk7d03vr/video/upload/v1741593794/mp3/for%20work.mp3",
  ];

  const handleSocketData = useCallback((newData) => {
    console.log("Received sheet data update:", newData);
    setData((prevData) => {
      const currentEmployees = newData.employees || [];
      const prevEmployeeIds = (prevData?.employees || []).map((emp) => emp.id);
      const newEmployeeIds = currentEmployees.map((emp) => emp.id);

      if (
        prevEmployeeIds.length < newEmployeeIds.length ||
        prevEmployeeIds.some((id, index) => id !== newEmployeeIds[index])
      ) {
        setShowSalesPopup(true);
        setTimeout(() => setShowSalesPopup(false), 1000); // Show for 2 seconds
      }

      setPrevEmployees(currentEmployees);
      return newData;
    });
  }, []);

  useEffect(() => {
    const socket = io(import.meta.env.VITE_BACKEND_URL.replace("/api", ""), {
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 300,
      timeout: 1000,
    });

    socket.on("sheet-data-update", handleSocketData);

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    socket.on("connect", () => {
      console.log("Socket connected successfully");
    });

    // Image popup and audio logic: Show every 15 seconds, hide after 4 seconds
    const popupInterval = setInterval(() => {
      const randomMp3 = mp3Urls[Math.floor(Math.random() * mp3Urls.length)];
      const newAudio = new Audio(randomMp3);
      setAudio(newAudio);

      setShowImagePopup(true);
      newAudio.play().catch((error) => {
        console.error("Error playing audio:", error);
      });

      setTimeout(() => {
        setShowImagePopup(false);
        newAudio.pause();
        newAudio.currentTime = 0;
        setAudio(null);
      }, 2000); // 4 seconds
    }, 15000); // Every 15 seconds

    return () => {
      socket.disconnect();
      clearInterval(popupInterval);
      if (audio) {
        audio.pause();
        setAudio(null);
      }
      console.log("Socket disconnected");
    };
  }, [handleSocketData]);

  // Effect to trigger confetti when sales popup shows
  useEffect(() => {
    if (showSalesPopup) {
      // Trigger confetti from the center of the screen
      party.confetti(document.body, {
        count: party.variation.range(50, 100), // Number of confetti particles
        size: party.variation.range(0.8, 1.2), // Size variation
        spread: 70, // Spread of confetti
        speed: 500, // Speed of falling
      });
    }
  }, [showSalesPopup]);

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

        <div className={`${filteredEmployees.length > 5 ? "" : ""} w-full`}>
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

        <div className="grid grid-cols-1 md:grid-cols-8 gap-8 mt-8">
          <div className="md:col-span-5">
            <SalesData employees={filteredEmployees} theme={theme} />
          </div>

          <div className={`${filteredEmployees.length > 5 ? "" : ""} md:col-span-3`}>
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

      {/* Image Popup with Audio (Every 15 seconds) */}
      {showImagePopup && (
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
            style={{ width: "600px", height: "400px" }}
          />
        </div>
      )}

      {/* Sales Popup Modal with Happy Emoji and Confetti */}
      {showSalesPopup && (
        <div
          style={{
            position: "fixed",
            top: "0",
            left: "0",
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent overlay
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 30,
          }}
        >
          <div
            style={{
              backgroundColor: theme === "light" ? "#FFFFFF" : "#1C263E",
              padding: "30px",
              borderRadius: "12px",
              boxShadow: "0 6px 12px rgba(0, 0, 0, 0.3)",
              animation: "fadeInScale 0.5s ease-in-out",
              textAlign: "center",
              height: "200px",
              width: "400px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <p
              style={{
                fontSize: "28px",
                fontWeight: "bold",
                color: theme === "light" ? "#000000" : "#FFFFFF",
                margin: "0",
              }}
            >
              WOW! Keep it UP 😊
            </p>
          </div>
        </div>
      )}

      {/* Inline CSS for Animation */}
      <style>
        {`
          @keyframes fadeInScale {
            0% {
              opacity: 0;
              transform: scale(0.8);
            }
            100% {
              opacity: 1;
              transform: scale(1);
            }
          }
        `}
      </style>
    </div>
  );
};

export default App;