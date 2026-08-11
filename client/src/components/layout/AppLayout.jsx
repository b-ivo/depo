import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import PageContainer from "./PageContainer";

function AppLayout({ children, title, description, activePath, onNavigate }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleNavigate = (path) => {
    setSidebarOpen(false);
    onNavigate?.(path);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <Sidebar activePath={activePath} onNavigate={handleNavigate} />
      </div>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />

          <div className="fixed inset-y-0 left-0 z-50 lg:hidden">
            <Sidebar activePath={activePath} onNavigate={handleNavigate} />
          </div>
        </>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          title={title}
          description={description}
          onMenuClick={() => setSidebarOpen(true)}
        />

        <PageContainer>{children}</PageContainer>
      </div>
    </div>
  );
}

export default AppLayout;
