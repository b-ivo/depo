function Header({ title, description, onMenuClick }) {
  return (
    <header className="flex min-h-20 items-center justify-between border-b border-slate-200 bg-white px-6">
      <div className="flex items-center gap-4">
        {/* Mobile menu */}
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
          aria-label="Open navigation"
        >
          ☰
        </button>

        <div>
          <h2 className="text-xl font-semibold text-slate-900">{title}</h2>

          {description && (
            <p className="mt-1 text-sm text-slate-500">{description}</p>
          )}
        </div>
      </div>

      {/* User/admin area */}
      <div className="flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium text-slate-900">Administrator</p>

          <p className="text-xs text-slate-500">Admin</p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
          A
        </div>
      </div>
    </header>
  );
}

export default Header;
