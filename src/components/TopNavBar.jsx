import { useState } from "react";
import { Link } from "react-router-dom";
import { LogIn, LogOut, Search, Menu, X } from "lucide-react";

const TopNavBar = ({ isLoggedIn, onLogout }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-gray-100 px-4 py-2 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left: Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <img src="/stockastic-logo.png" alt="Logo" className="h-8 w-8" />
            <span className="text-2xl font-[Nokora] font-semibold tracking-wide">stockastic</span>
          </div>
        </Link>
        {/* Center: Menu + Search */}
        <div className="hidden md:flex bg-white shadow-md rounded-full px-4 py-1 items-center gap-4 max-w-xl w-full justify-center">
          <Link to="/" className="text-gray-700 hover:text-blue-600 font-medium">
            Dashboard
          </Link>
          <Link to="/journal" className="text-gray-700 hover:text-blue-600 font-medium">
            Journal
          </Link>
          <Link to="/strategy" className="text-gray-700 hover:text-blue-600 font-medium">
            Strategy
          </Link>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-8 pr-3 py-1 text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </div>

        {/* Right: Auth + Mobile Menu Toggle */}
        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <button onClick={onLogout} className="hover:text-red-500 transition">
              <LogOut />
            </button>
          ) : (
            <Link to="/login" className="hover:text-green-600 transition">
              <LogIn />
            </Link>
          )}
          <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-2 bg-white rounded-lg shadow-md px-4 py-3 space-y-2">
          <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block text-gray-700 hover:text-blue-600">
            Dashboard
          </Link>
          <Link to="/journal" onClick={() => setMobileMenuOpen(false)} className="block text-gray-700 hover:text-blue-600">
            Journal
          </Link>
          <Link to="/trades" onClick={() => setMobileMenuOpen(false)} className="block text-gray-700 hover:text-blue-600">
            Trades
          </Link>
        </div>
      )}
    </header>
  );
};

export default TopNavBar;