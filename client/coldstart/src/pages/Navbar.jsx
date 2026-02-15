import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { logout } from "../redux/slices/authSlice";
import { IoSearch } from "react-icons/io5"; // Import a search icon
import { BsBriefcaseFill, BsChatDotsFill, BsPeopleFill } from "react-icons/bs"; // Icons for navigation
import { RiHome7Fill } from "react-icons/ri";


const Navbar = () => {
  const { user } = useSelector((state) => state.auth);
  const [query, setQuery] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false); // State for mobile menu

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
    const baseClass = "flex flex-col items-center justify-center p-2 rounded-md transition-colors duration-200";
    const activeClass = "text-linkedin-text-primary border-b-2 border-linkedin-text-primary";
    const inactiveClass = "text-linkedin-text-secondary hover:text-linkedin-text-primary";
    return `${baseClass} ${location.pathname === path ? activeClass : inactiveClass}`;
  };

  return (
    <nav className="sticky top-0 z-50 bg-linkedin-card shadow-md px-4 py-1 flex items-center justify-between border-b border-linkedin-border h-14">
      {/* Brand Logo and Search Bar */}
      <div className="flex items-center space-x-2">
        <Link
          to="/"
          className="text-2xl font-extrabold text-linkedin-blue tracking-tighter"
        >
          ColdStart
        </Link>

        {/* Search Icon for Mobile */}
        <IoSearch
          className="block md:hidden text-2xl text-linkedin-text-secondary cursor-pointer"
          onClick={() => navigate("/search")}
        />

        {/* Search Bar for Desktop */}
        <div className="relative hidden md:block">
          <input
            type="text"
            placeholder="Search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleSearch}
            className="bg-linkedin-background text-linkedin-text-primary placeholder-linkedin-text-secondary rounded-md pl-9 pr-3 py-1.5 w-64 focus:outline-none focus:ring-1 focus:ring-linkedin-blue text-sm"
          />
          <IoSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-linkedin-text-secondary" />
        </div>
      </div>

      {/* Hamburger Icon for Mobile */}
      <div className="md:hidden flex items-center">
        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-linkedin-text-secondary focus:outline-none">
          {isMenuOpen ? (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Desktop Navigation Links */}
      <div className="hidden md:flex items-center justify-center flex-wrap gap-x-4 sm:gap-x-6 text-xs font-medium h-full">
        <Link to="/" className={getLinkClass("/")}>
          <RiHome7Fill className="text-xl" />
          <span className="hidden sm:block">Feed</span>
        </Link>
        <Link to="/network" className={getLinkClass("/network")}>
          <BsPeopleFill className="text-xl" />
          <span className="hidden sm:block">Network</span>
        </Link>
        <Link to="/jobs" className={getLinkClass("/jobs")}>
          <BsBriefcaseFill className="text-xl" />
          <span className="hidden sm:block">Jobs</span>
        </Link>
        <Link to="/chat" className={getLinkClass("/chat")}>
          <BsChatDotsFill className="text-xl" />
          <span className="hidden sm:block">Chat</span>
        </Link>
        {user?.role === "company" && (
          <Link to="/applicants" className={getLinkClass("/applicants")}>
            <BsPeopleFill className="text-xl" />
            <span className="hidden sm:block">Applicants</span>
          </Link>
        )}
      </div>

      {/* Desktop User Actions */}
      <div className="hidden md:flex items-center space-x-4">
        {user ? (
          <>
            <div className="flex items-center space-x-2 cursor-pointer group">
              <div className="w-8 h-8 bg-linkedin-blue text-white rounded-full flex items-center justify-center text-sm font-semibold">
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium text-linkedin-text-primary hidden md:block">
                {user.name}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="text-sm font-semibold text-linkedin-text-secondary hover:text-linkedin-blue transition-colors duration-200"
            >
              Logout
            </button>
          </>
        ) : (
          <div className="flex gap-2 flex-wrap justify-end">
            <Link
              to="/login"
              className="px-3 py-1.5 text-sm font-medium text-linkedin-text-secondary hover:text-linkedin-text-primary transition-colors duration-200 rounded-md"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="bg-linkedin-blue text-white px-4 py-1.5 text-sm font-semibold rounded-full hover:bg-opacity-90 transition-opacity duration-200"
            >
              Join Now
            </Link>
          </div>
        )}
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-linkedin-card p-6 z-40 flex flex-col items-center justify-center space-y-8">
          <div className="flex flex-col space-y-6 text-center">
            <Link to="/" className="text-xl font-bold text-linkedin-text-primary hover:text-linkedin-blue" onClick={() => setIsMenuOpen(false)}>
              <RiHome7Fill className="inline-block mr-3 text-2xl" /> Feed
            </Link>
            <Link to="/network" className="text-xl font-bold text-linkedin-text-primary hover:text-linkedin-blue" onClick={() => setIsMenuOpen(false)}>
              <BsPeopleFill className="inline-block mr-3 text-2xl" /> Network
            </Link>
            <Link to="/jobs" className="text-xl font-bold text-linkedin-text-primary hover:text-linkedin-blue" onClick={() => setIsMenuOpen(false)}>
              <BsBriefcaseFill className="inline-block mr-3 text-2xl" /> Jobs
            </Link>
            <Link to="/chat" className="text-xl font-bold text-linkedin-text-primary hover:text-linkedin-blue" onClick={() => setIsMenuOpen(false)}>
              <BsChatDotsFill className="inline-block mr-3 text-2xl" /> Chat
            </Link>
            {user?.role === "company" && (
              <Link to="/applicants" className="text-xl font-bold text-linkedin-text-primary hover:text-linkedin-blue" onClick={() => setIsMenuOpen(false)}>
                <BsPeopleFill className="inline-block mr-3 text-2xl" /> Applicants
              </Link>
            )}
          </div>

          {/* Mobile User Actions inside menu */}
          <div className="flex flex-col space-y-4">
            {user ? (
              <>
                <div className="flex items-center space-x-2 justify-center cursor-pointer group">
                  <div className="w-10 h-10 bg-linkedin-blue text-white rounded-full flex items-center justify-center text-lg font-semibold">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-lg font-medium text-linkedin-text-primary">
                    {user.name}
                  </span>
                </div>
                <button
                  onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                  className="text-lg font-semibold text-linkedin-text-secondary hover:text-linkedin-blue transition-colors duration-200"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-4 text-center">
                <Link
                  to="/login"
                  className="px-6 py-3 text-lg font-medium text-linkedin-text-primary hover:text-linkedin-blue transition-colors duration-200 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-linkedin-blue text-white px-8 py-3 text-lg font-semibold rounded-full hover:bg-opacity-90 transition-opacity duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Join Now
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );

};

export default Navbar;
