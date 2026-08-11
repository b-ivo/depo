function PageContainer({ children, className = "" }) {
  return (
    <main className={`flex-1 overflow-y-auto bg-slate-50 p-6 ${className}`}>
      <div className="mx-auto w-full max-w-7xl">{children}</div>
    </main>
  );
}

export default PageContainer;
