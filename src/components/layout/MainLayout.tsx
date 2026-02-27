import React, { useState } from 'react';
import Sidebar from '@/src/features/chat/components/Sidebar';
import { cn } from '@/src/lib/utils';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-tg-bg text-tg-text">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-[300px] transform border-r border-tg-border bg-tg-sidebar transition-transform duration-300 ease-in-out md:relative md:translate-x-0",
          !isSidebarOpen && "-translate-x-full md:hidden"
        )}
      >
        <Sidebar />
      </aside>

      {/* Main Content */}
      <main className="relative flex flex-1 flex-col overflow-hidden">
        {children}
      </main>

      {/* Mobile Overlay */}
      {!isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setIsSidebarOpen(true)}
        />
      )}
    </div>
  );
}
