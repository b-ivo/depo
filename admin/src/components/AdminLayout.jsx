import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import LanguageSwitcher from "../i18n/LanguageSwitcher.jsx";
import { useLanguage } from "../i18n/context.js";

function AdminLayout() {
  const navigate = useNavigate();
  const { t } = useLanguage();

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
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar user={user} />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 md:px-6">
          <div>
            <p className="text-sm font-medium text-slate-900">
              {t("layout.adminTitle")}
            </p>

            <p className="hidden text-xs text-slate-500 sm:block">
              {t("layout.subtitle")}
            </p>
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