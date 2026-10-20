import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import LanguageSwitcher from "../i18n/LanguageSwitcher.jsx";
import { useLanguage } from "../i18n/context.js";

function AdminLayout() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const userData = localStorage.getItem("adminUser");

  let user;

  try {
    user = userData ? JSON.parse(userData) : null;
  } catch {
    user = null;
  }

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");

    navigate("/login", { replace: true });
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar user={user} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-white/80 md:px-6">
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="mr-3 rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
              aria-label={t("nav.aria.openNavigation")}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div>
              <p className="text-sm font-medium text-slate-900">
                {t("layout.adminTitle")}
              </p>

              <p className="hidden text-xs text-slate-500 sm:block">
                {t("layout.subtitle")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <LanguageSwitcher />

            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-slate-900">
                {user?.username}
              </p>

              <p className="text-xs capitalize text-slate-500">
                {t(`auth.role.${user?.role}`)}
              </p>
            </div>

            <button
              onClick={handleLogout}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              {t("auth.logout")}
            </button>
          </div>
        </header>

        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;