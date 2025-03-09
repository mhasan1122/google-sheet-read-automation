import React from "react";
import logo from "../assets/logo.png";

const Navbar = ({ searchTerm, setSearchTerm, toggleTheme, theme }) => {
  return (
    <nav
      className={`fixed top-0 w-full z-10 ${
        theme === "light"
          ? "bg-white border-b border-gray-200"
          : "bg-[#1C263E] border-b border-gray-700"
      } p-4 flex justify-between items-center`}
    >
      <div className="flex items-center space-x-2 mr-10">
        <img src={logo} alt="Logo" className="w-44 h-14" />
        <h1
          className={`text-xl font-bold ${
            theme === "light" ? "text-black" : "text-white"
          }`}
        >
          {/* Add a title if needed */}
        </h1>
      </div>

      <div className="relative flex items-center">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search Employees"
          className={`p-2 rounded-lg border-2 focus:outline-none ${
            theme === "light"
              ? "border-black focus:ring-black"
              : "border-white focus:ring-white"
          }`}
        />
        <span
          className={`absolute right-2 ${
            theme === "light" ? "text-black" : "text-white"
          }`}
        >
          <i className="fas fa-search"></i>
        </span>
      </div>

      <button
        onClick={toggleTheme}
        className={`px-4 py-2 rounded-lg transition duration-300 ${
          theme === "light"
            ? "bg-white text-black hover:bg-black hover:text-white"
            : "bg-[#1C263E] text-white hover:bg-white hover:text-black"
        }`}
      >
        {theme === "light" ? "Dark Mode" : "Light Mode"}
      </button>
    </nav>
  );
};

export default Navbar;