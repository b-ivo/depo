import { NavLink } from "react-router-dom";
import { useLanguage } from "../i18n/context.js";

function Sidebar({ user }) {
  const { t } = useLanguage();
  const isSuperAdmin = user?.role === "superadmin";
  const isAdmin = user?.role === "admin";

  const superAdminLinks = [
    {
      name: t("nav.dashboard"),
      path: "/superadmin",
    },
    {
      name: t("nav.businesses"),
      path: "/superadmin/businesses",
    },
    {
      name: t("nav.users"),
      path: "/superadmin/users",
    },
    {
      name: t("nav.profile"),
      path: "/superadmin/profile",
    },
  ];

  const adminLinks = [
    {
      name: t("nav.dashboard"),
      path: "/admin",
    },
    {
      name: t("nav.dailyOverview"),
      path: "/admin/dashboard",
    },
    {
      name: t("nav.dailyRecord"),
      path: "/admin/daily",
    },
    {
      name: t("nav.history"),
      path: "/admin/history",
    },
    {
      name: t("nav.beers"),
      path: "/admin/beers",
    },
    {
      name: t("nav.inventory"),
      path: "/admin/inventory",
    },
    {
      name: t("nav.users"),
      path: "/admin/users",
    },
    {
      name: t("nav.profile"),
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
      <div className="border-b border-slate-800 px-6 py-5">
        <h1 className="text-xl font-bold">
          Mini DEPO
        </h1>

        <p className="mt-1 text-xs text-slate-400">
          {t("portal.logoSubtitle")}
        </p>
      </div>

      <div className="border-b border-slate-800 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-800 text-sm font-semibold">
            {user?.username?.charAt(0).toUpperCase()}
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-medium">
              {user?.username}
            </p>

            <p className="mt-1 text-xs capitalize text-slate-400">
              {t(`auth.role.${user?.role}`)}
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-5">
        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
          {t("nav.menu")}
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

      <div className="border-t border-slate-800 px-5 py-4">
        <p className="text-xs text-slate-500">
          {t("portal.footer")}
        </p>
      </div>
    </aside>
  );
}

export default Sidebar;