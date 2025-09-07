'use client';

import { useState } from 'react';
import { DragAndDropProvider } from '@/lib/drag-and-drop';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { DashboardSidebar } from '@/components/dashboard/dashboard-sidebar';
import { WidgetGrid } from '@/components/dashboard/widget-grid';
import { AddWidgetDialog } from '@/components/dashboard/add-widget-dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [addWidgetOpen, setAddWidgetOpen] = useState(false);

  return (
    <DragAndDropProvider>
      <div className="min-h-screen bg-background">
        {/* Dashboard Header */}
        <DashboardHeader
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          onAddWidget={() => setAddWidgetOpen(true)}
        />

        <div className="flex">
          {/* Sidebar */}
          <DashboardSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

          {/* Main Content */}
          <main className="flex-1 p-6">
            <div className="max-w-7xl mx-auto">
              {/* Dashboard Title */}
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-foreground mb-2">My Dashboard</h1>
                <p className="text-muted-foreground">
                  Customize your finance monitoring dashboard with real-time widgets
                </p>
              </div>

              {/* Widget Grid */}
              <WidgetGrid />

              {/* Floating Add Widget Button */}
              <Button
                onClick={() => setAddWidgetOpen(true)}
                className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg"
                size="icon"
              >
                <Plus className="h-6 w-6" />
              </Button>
            </div>
          </main>
        </div>

        {/* Add Widget Dialog */}
        <AddWidgetDialog open={addWidgetOpen} onOpenChange={setAddWidgetOpen} />
      </div>
    </DragAndDropProvider>
  );
}
