function AppLayout({ children, title, description }) {
  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
          {title}
        </h1>

        {description && (
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        )}
      </div>

      <div className="mt-8">{children}</div>
    </div>
  );
}

export default AppLayout;