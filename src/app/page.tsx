'use client';
import Navbar from '@/components/shared/navbar';
import { WidgetGrid } from '@/components/layout/widget-grid';
import { WidgetConfigModal } from '@/components/dashboard/widget-config-modal';
import { useWidgetStore } from '@/store';
import { useMobile } from '@/hooks/use-mobile';

export default function Home() {
  const isMobile = useMobile();
  const { isAddingWidget, isEditingWidget, setIsAddingWidget, setIsEditingWidget } =
    useWidgetStore();

  return (
    <main className="min-h-screen bg-slate-950">
      <Navbar />
      <WidgetGrid />

      <WidgetConfigModal
        isOpen={isAddingWidget || !!isEditingWidget}
        onClose={() => {
          setIsAddingWidget(false);
          setIsEditingWidget(null);
        }}
        editingWidgetId={isEditingWidget || undefined}
      />
    </main>
  );
}
