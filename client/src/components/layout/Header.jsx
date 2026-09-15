import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { apiRequest, logout } from "../../services/api";

function Header({ title, description, onMenuClick }) {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const menuRef = useRef(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const data = await apiRequest("/auth/me");

        setUser(data.data);
      } catch (error) {
        console.error("Failed to load user:", error);
      }
    };

    loadUser();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setMenuOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  const handleProfile = () => {
    setMenuOpen(false);
    navigate("/profile");
  };

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
  };

  const initials = user?.username
    ? user.username.charAt(0).toUpperCase()
    : "?";

  return (
    <header className="flex min-h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">

      {/* Left side */}
      <div className="flex items-center">

        {/* Mobile menu */}
        <button
          type="button"
          onClick={onMenuClick}
          className="mr-3 rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
          aria-label="Open navigation"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-6 w-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        <div>
          <h1 className="text-lg font-semibold text-slate-900">
            {title}
          </h1>

          {description && (
            <p className="text-sm text-slate-500">
              {description}
            </p>
          )}
        </div>
      </div>

      {/* User Menu */}
      <div
        ref={menuRef}
        className="relative"
      >
        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex items-center gap-3 rounded-lg px-2 py-1.5 transition hover:bg-slate-100"
        >

          {/* Avatar */}
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
            {initials}
          </div>

          {/* User info */}
          <div className="hidden text-left sm:block">
            <p className="text-sm font-medium text-slate-900">
              {user?.username || "User"}
            </p>

            <p className="text-xs text-slate-500">
              {user?.email || ""}
            </p>
          </div>

          {/* Arrow */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className={`h-4 w-4 text-slate-500 transition ${
              menuOpen ? "rotate-180" : ""
            }`}
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {/* Dropdown */}
        {menuOpen && (
          <div className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">

            {/* User information */}
            <div className="border-b border-slate-200 px-4 py-3">
              <p className="font-medium text-slate-900">
                {user?.username}
              </p>

              <p className="truncate text-sm text-slate-500">
                {user?.email}
              </p>

              <span className="mt-2 inline-flex rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium capitalize text-blue-700">
                {user?.role}
              </span>
            </div>

            {/* Profile */}
            <button
              type="button"
              onClick={handleProfile}
              className="flex w-full items-center px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50"
            >
              <span className="mr-3">👤</span>
              My Profile
            </button>

            {/* Logout */}
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center border-t border-slate-100 px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50"
            >
              <span className="mr-3">🚪</span>
              Logout
            </button>

          </div>
        )}
      </div>
    </header>
  );
}

export default Header;