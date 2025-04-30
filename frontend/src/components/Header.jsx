import React, { useState, useRef, useEffect } from "react";
import { UserCircle } from "lucide-react";
import { Link } from "react-router-dom";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef();

  // Close the menu if you click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="flex w-full items-center justify-between border-b border-gray-200 p-6">
      <div className="flex items-center gap-2">
        <span className="text-[2.5rem] font-bold text-[#2d9a51]">$</span>
        <h1 className="text-[2rem] font-medium text-[#2d9a51]">Finance Friend</h1>
      </div>
      <div className="relative flex items-center gap-4">
        {/* User icon triggers menu */}
        <UserCircle
          className="h-8 w-40 text-gray-700 cursor-pointer"
          onClick={() => setMenuOpen((open) => !open)}
        />

        {menuOpen && (
          <div
            ref={menuRef}
            className="absolute center-0 top-full mt-2 flex flex-col bg-white border border-gray-200 rounded shadow-lg z-50"
          >
            <Link
              to="/" // go to homepage (parent directory localhost:5173)
              className="px-4 py-2 text-sm font-medium hover:bg-gray-100"
              onClick={() => setMenuOpen(false)}
            >
              Home
            </Link>

            <Link
              to="/reports"
              className="px-4 py-2 text-sm font-medium hover:bg-gray-100"
              onClick={() => setMenuOpen(false)}
            >
              Reports
            </Link>

            <Link
              to="/sign-out"
              className="px-4 py-2 text-sm font-medium hover:bg-gray-100"
              onClick={() => setMenuOpen(false)}
            >
              Sign Out
            </Link>

          </div>
        )}
      </div>
    </header>
  );
};

export default Header;

