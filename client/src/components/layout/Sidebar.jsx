import { NavLink } from "react-router-dom";
import { getCurrentUser, logout } from "../../services/api";

const baseNavigation = [
  { label: "Dashboard", path: "/" },
  { label: "Daily Record", path: "/daily" },
  { label: "History", path: "/history" },
  { label: "Beer Management", path: "/beers" },
  { label: "Inventory", path: "/inventory" },
  { label: "Profile", path: "/profile" },
];

function Sidebar({ open, onClose }) {
  const user = getCurrentUser();
  const isAdmin = user?.role === "admin" || user?.role === "superadmin";

  const navigation = isAdmin
    ? [...baseNavigation, { label: "Admin Hub", path: "/admin" }]
    : baseNavigation;

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}

      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-200",
          open ? "translate-x-0" : "-translate-x-full",
          "lg:static lg:translate-x-0",
        ].join(" ")}
      >
        {/* Brand */}
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-6">
          <div>
            <h1 className="text-lg font-bold text-slate-900">Mini DEPO</h1>
            {user?.business ? (
              <p className="truncate text-xs font-medium text-emerald-600">
                🏢 {user.business.name}
              </p>
            ) : (
              <p className="text-xs text-slate-500">Management System</p>
            )}
          </div>

          {/* Mobile close button */}
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
            aria-label="Close sidebar"
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
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                ].join(" ")
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-slate-200 p-4">
          {user?.business?.location && (
            <p className="mb-1 truncate text-xs text-slate-400">
              📍 {user.business.location}
            </p>
          )}
          <p className="text-xs text-slate-400">Mini DEPO</p>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
