import { NavLink } from "react-router-dom";
import { getCurrentUser } from "../../services/api";
import { useLanguage } from "../../i18n/context.js";
import LanguageSwitcher from "../../i18n/LanguageSwitcher.jsx";

function Sidebar({ open, onClose }) {
  const { t } = useLanguage();
  const user = getCurrentUser();

  const navigation = [
    { label: t("nav.dashboard"), path: "/" },
    { label: t("nav.dailyRecord"), path: "/daily" },
    { label: t("nav.history"), path: "/history" },
    { label: t("nav.beerManagement"), path: "/beers" },
    { label: t("nav.inventory"), path: "/inventory" },
    { label: t("nav.crateLoans"), path: "/loans" },
    { label: t("nav.profile"), path: "/profile" },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <button
          type="button"
          aria-label={t("nav.aria.closeNavigation")}
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}

      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-slate-950 text-white transition-transform duration-200",
          open ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0",
        ].join(" ")}
      >
        {/* Brand */}
        <div className="flex h-16 items-center justify-between border-b border-slate-800 px-6">
          <div className="min-w-0">
            <h1 className="text-lg font-bold text-white">{t("app.title")}</h1>
            {user?.business ? (
              <p className="truncate text-xs font-medium text-slate-400">
                🏢 {user.business.name}
              </p>
            ) : (
              <p className="text-xs text-slate-400">{t("app.tagline")}</p>
            )}
          </div>

          {/* Mobile close button */}
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-900 hover:text-white lg:hidden"
            aria-label={t("nav.aria.closeSidebar")}
          >
            ✕
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {navigation.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              onClick={onClose}
              className={({ isActive }) =>
                [
                  "flex items-center rounded-lg px-4 py-3 text-sm font-medium transition",
                  isActive
                    ? "bg-slate-800 text-white"
                    : "text-slate-400 hover:bg-slate-900 hover:text-white",
                ].join(" ")
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-slate-800 p-4">
          <LanguageSwitcher className="mb-3 w-full" dark />
          {user?.business?.location && (
            <p className="mb-1 truncate text-xs text-slate-500">
              📍 {user.business.location}
            </p>
          )}
          <p className="text-xs text-slate-500">{t("app.title")}</p>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
