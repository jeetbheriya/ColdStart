import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { logout } from "../redux/slices/authSlice";

const Navbar = () => {
  const { user } = useSelector((state) => state.auth);
  const [query, setQuery] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const handleSearch = (e) => {
    if (e.key === "Enter" && query.trim()) {
      navigate(`/search?q=${query}`);
    }
  };

  // Helper function to style active links
  const getLinkClass = (path) => {
    const baseClass = "transition-colors pb-1";
    const activeClass = "text-indigo-400 border-b-2 border-indigo-500";
    const inactiveClass = "text-slate-400 hover:text-white";
    return `${baseClass} ${location.pathname === path ? activeClass : inactiveClass}`;
  };

  return (
    <nav className="sticky top-0 z-50 glass-card px-6 py-3 mb-6 flex items-center justify-between border-b border-slate-800">
      {/* Brand Logo */}
      <div className="flex items-center gap-4">
        <Link
          to="/"
          className="text-2xl font-black bg-gradient-to-r from-indigo-500 to-violet-400 bg-clip-text text-transparent tracking-tighter"
        >
          COLDSTART
        </Link>
        <div className="h-6 w-[1px] bg-slate-800 hidden md:block"></div>

        {/* Search Bar */}
        <div className="hidden lg:block relative group">
          <input
            type="text"
            placeholder="Search skills, people..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleSearch}
            className="bg-slate-800/50 border border-slate-700/50 rounded-xl px-10 py-2 text-sm w-80 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all placeholder:text-slate-500"
          />
          <span className="absolute left-3 top-2.5 text-slate-500">🔍</span>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex items-center gap-8 text-xs font-bold uppercase tracking-widest">
        <Link to="/" className={getLinkClass("/")}>
          Feed
        </Link>
        <Link to="/network" className={getLinkClass("/network")}>
          Network
        </Link>
        <Link to="/jobs" className={getLinkClass("/jobs")}>
          Jobs
        </Link>
        <Link to="/chat" className={getLinkClass("/chat")}>
          Chat
        </Link>
        {user?.role === "company" && <Link to="/applicants" >APPLICANTS</Link>}
      </div>

      {/* User Actions */}
      <div className="flex items-center gap-6">
        {user ? (
          <>
            {/* Profile & Logout */}
            <div className="flex items-center gap-3 bg-slate-800/30 p-1 pr-4 rounded-full border border-slate-700/50">
              <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-lg shadow-indigo-500/20">
                {user.name?.charAt(0)}
              </div>
              <span className="text-xs font-semibold text-slate-300 hidden sm:block">
                {user.name}
              </span>
              <button
                onClick={handleLogout}
                className="ml-2 p-1 text-slate-500 hover:text-red-400 transition-colors text-lg"
                title="Logout"
              >
                🚪
              </button>
            </div>
          </>
        ) : (
          <div className="flex gap-4">
            <Link
              to="/login"
              className="text-sm font-bold text-slate-400 hover:text-white pt-2"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-600/20"
            >
              Join Now
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
