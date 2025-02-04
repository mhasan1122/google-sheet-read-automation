// SalesData.js
import React from "react";
import PropTypes from "prop-types";
import { useSpring, animated } from "@react-spring/web";

const SalesData = ({ employees, theme }) => {
  const fadeIn = useSpring({
    opacity: 1,
    from: { opacity: 0 },
    config: { duration: 1000 },
  });

  // Determine table styles based on theme
  const tableStyle = {
    backgroundColor: theme === "light" ? "#FFFFFF" : "#0A0A0A",
    color: theme === "light" ? "#000000" : "#FFFFFF",
  };

  // Determine header row styles based on theme
  const headerRowStyle = {
    backgroundColor: theme === "light" ? "#F3F4F6" : "#1C263E", // Darker background in dark mode
    color: theme === "light" ? "#000000" : "#FFFFFF", // White text in dark mode
  };

  return (
    <animated.div style={fadeIn}>
      <h2 className="text-xl font-bold mb-4">Sales Data</h2>
      <table style={tableStyle} className="w-full rounded-lg overflow-hidden">
        {/* Table Header */}
        <thead>
          <tr style={headerRowStyle} className="font-bold">
            <th className="p-2 text-left">Employee ID</th>
            <th className="p-2 text-left">Employee Name</th>
            <th className="p-2 text-left">Total Amount</th>
          </tr>
        </thead>

        {/* Table Body */}
        <tbody>
          {employees.map((employee, index) => (
            <tr key={index} className="border-b border-[#0A7F77] hover:bg-[#DFDFDF]">
              <td className="p-2">{employee.id}</td>
              <td className="p-2">{employee.name}</td>
              <td className="p-2">${employee.totalSales.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </animated.div>
  );
};

SalesData.propTypes = {
  employees: PropTypes.array.isRequired,
  theme: PropTypes.string.isRequired,
};

export default SalesData;