import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { apiRequest, logout } from "../../services/api";
import { useLanguage } from "../../i18n/context.js";
import LanguageSwitcher from "../../i18n/LanguageSwitcher.jsx";

function Header({ title, description, onMenuClick }) {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const menuRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    const loadUser = async () => {
      try {
        const data = await apiRequest("/auth/me");
        if (!cancelled) setUser(data.data);
      } catch (error) {
        console.error("Failed to load user:", error);
      }
    };

    loadUser();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleProfile = () => {
    setMenuOpen(false);
    navigate("/profile");
  };

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
  };

  const initials = user?.username ? user.username.charAt(0).toUpperCase() : "?";

  return (
    <header className="sticky top-0 z-20 flex min-h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-white/80 sm:px-6">

      {/* Left side */}
      <div className="flex items-center">
        {/* Mobile menu button */}
        <button
          type="button"
          onClick={onMenuClick}
          className="mr-3 rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
          aria-label={t("nav.aria.openNavigation")}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-6 w-6"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div>
          <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
          {description && (
            <p className="text-sm text-slate-500">{description}</p>
          )}
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Language Switcher */}
        <LanguageSwitcher className="hidden md:flex" />

        {/* Active Business Badge */}
        {user?.business && (
          <div className="hidden items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700 md:flex">
            <span>🏢</span>
            <span className="font-semibold text-slate-800">{user.business.name}</span>
            {user.business.location && (
              <span className="font-normal text-slate-500">({user.business.location})</span>
            )}
          </div>
        )}

        {/* User Menu */}
        <div ref={menuRef} className="relative">
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
                {user?.username || t("auth.user")}
              </p>
              <p className="text-xs text-slate-500">
                {user?.business ? user.business.name : (user?.email || "")}
              </p>
            </div>

            {/* Arrow */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className={`h-4 w-4 text-slate-500 transition ${menuOpen ? "rotate-180" : ""}`}
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
              {/* User info */}
              <div className="border-b border-slate-200 px-4 py-3">
                <p className="font-medium text-slate-900">{user?.username}</p>
                <p className="truncate text-sm text-slate-500">{user?.email}</p>

                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <span className="inline-flex rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium capitalize text-blue-700">
                    {t(`auth.role.${user?.role}`)}
                  </span>
                  {user?.business && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                      🏢 {user.business.name}
                    </span>
                  )}
                </div>
              </div>

              {/* Profile */}
              <button
                type="button"
                onClick={handleProfile}
                className="flex w-full items-center px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50"
              >
                <span className="mr-3">👤</span>
                {t("auth.myProfile")}
              </button>

              {/* Logout */}
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center border-t border-slate-100 px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50"
              >
                <span className="mr-3">🚪</span>
                {t("auth.logout")}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;