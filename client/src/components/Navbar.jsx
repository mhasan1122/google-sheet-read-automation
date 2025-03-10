import React from "react";
import logo from "../assets/logo2.png";
import { Button } from "./button";

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
        <div className=" h-10  flex justify-center items-center"><img src={logo} alt="Logo" className="w-[250px] h-[200px]" /></div>
        <h1
          className={`text-xl font-bold ${
            theme === "light" ? "text-black" : "text-white"
          }`}
        >
          {/* Add a title if needed */}
        </h1>
      </div>

      <div className="flex items-center space-x-4">
      <div className="relative flex items-center">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search Employees"
          className={`p-2 h-10 rounded-[8px] border-[1px] border-gray-600 focus:outline-none ${
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

      {/* <button
        onClick={toggleTheme}
        className={`px-4 py-2 rounded-lg transition duration-300 ${
          theme === "light"
            ? "bg-white text-black hover:bg-black hover:text-white"
            : "bg-[#1C263E] text-white hover:bg-white hover:text-black"
        }`}
      >
        {theme === "light" ? "Dark Mode" : "Light Mode"}
      </button> */}

      <Button variant="outline" onClick={toggleTheme}>
      {theme === "light" ? "Dark Mode" : "Light Mode"}
      </Button>
      </div>
    </nav>
  );
};

export default Navbar;