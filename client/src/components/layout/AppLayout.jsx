import { useState } from "react";

import Sidebar from "./Sidebar";
import Header from "./Header";
import PageContainer from "./PageContainer";

function AppLayout({ children, title, description, activePath }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex min-h-screen">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="flex min-w-0 flex-1 flex-col">
          <Header
            title={title}
            description={description}
            onMenuClick={() => setSidebarOpen(true)}
          />

          <main className="flex-1">
            <PageContainer>{children}</PageContainer>
          </main>
        </div>
      </div>
    </div>
  );
}

export default AppLayout;
