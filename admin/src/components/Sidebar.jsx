import { NavLink } from "react-router-dom";

function Sidebar({ user }) {
  const isSuperAdmin = user?.role === "superadmin";
  const isAdmin = user?.role === "admin";

  const superAdminLinks = [
    {
      name: "Dashboard",
      path: "/superadmin",
    },
    {
      name: "Businesses",
      path: "/superadmin/businesses",
    },
    {
      name: "Users",
      path: "/superadmin/users",
    },
    {
      name: "Profile",
      path: "/superadmin/profile",
    },
  ];

  const adminLinks = [
    {
      name: "Dashboard",
      path: "/admin",
    },
    {
      name: "Daily Overview",
      path: "/admin/dashboard",
    },
    {
      name: "Daily Record",
      path: "/admin/daily",
    },
    {
      name: "History",
      path: "/admin/history",
    },
    {
      name: "Beers",
      path: "/admin/beers",
    },
    {
      name: "Inventory",
      path: "/admin/inventory",
    },
    {
      name: "Users",
      path: "/admin/users",
    },
    {
      name: "Profile",
      path: "/admin/profile",
    },
  ];

  const links = isSuperAdmin
    ? superAdminLinks
    : isAdmin
      ? adminLinks
      : [];

  return (
    <aside className="hidden h-screen w-64 shrink-0 flex-col bg-slate-950 text-white md:flex">
      {/* =========================
          LOGO
      ========================= */}
      <div className="border-b border-slate-800 px-6 py-5">
        <h1 className="text-xl font-bold">
          Mini DEPO
        </h1>

        <p className="mt-1 text-xs text-slate-400">
          Administration Portal
        </p>
      </div>

      {/* =========================
          USER INFO
      ========================= */}
      <div className="border-b border-slate-800 px-5 py-4">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-800 text-sm font-semibold">
            {user?.username?.charAt(0).toUpperCase()}
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-medium">
              {user?.username}
            </p>

            <p className="mt-1 text-xs capitalize text-slate-400">
              {user?.role}
            </p>
          </div>
        </div>
      </div>

      {/* =========================
          NAVIGATION
      ========================= */}
      <nav className="flex-1 overflow-y-auto px-3 py-5">
        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Menu
        </p>

        <div className="space-y-1">
          {links.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              end={
                link.path === "/admin" ||
                link.path === "/superadmin"
              }
              className={({ isActive }) =>
                `block rounded-lg px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-slate-800 text-white"
                    : "text-slate-400 hover:bg-slate-900 hover:text-white"
                }`
              }
            >
              {link.name}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* =========================
          FOOTER
      ========================= */}
      <div className="border-t border-slate-800 px-5 py-4">
        <p className="text-xs text-slate-500">
          Mini DEPO © 2026
        </p>
      </div>
    </aside>
  );
}

export default Sidebar;