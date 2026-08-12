function Header({ title, description, onMenuClick }) {
  return (
    <header className="flex min-h-16 items-center border-b border-slate-200 bg-white px-4 sm:px-6">
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
        <h1 className="text-lg font-semibold text-slate-900">{title}</h1>

        {description && <p className="text-sm text-slate-500">{description}</p>}
      </div>
    </header>
  );
}

export default Header;
