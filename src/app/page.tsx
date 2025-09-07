'use client';

import { AddWidgetModal } from '@/components/dashboard/add-widget-modal';
import { DashboardGrid } from '@/components/dashboard/dashboard-grid';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <DashboardHeader />
      <DashboardGrid />
      <AddWidgetModal />
    </div>
  );
}
