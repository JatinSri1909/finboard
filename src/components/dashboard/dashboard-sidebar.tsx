'use client';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useWidgetStore } from '@/lib/widget-store';
import { widgetTemplates } from '@/lib/widget-templates';
import { DraggableSidebarItem } from './draggable-sidebar-item';
import { Settings, Download, Upload, Trash2 } from 'lucide-react';

interface DashboardSidebarProps {
  open: boolean;
  onClose: () => void;
}

export function DashboardSidebar({ open, onClose }: DashboardSidebarProps) {
  const { addWidget, clearAllWidgets, exportLayout, importLayout } = useWidgetStore();

  const handleExportLayout = () => {
    const layout = exportLayout();
    const blob = new Blob([layout], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finboard-layout-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportLayout = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          importLayout(content);
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const content = (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b">
        <h2 className="text-lg font-semibold mb-2">Widget Library</h2>
        <p className="text-sm text-muted-foreground">
          Drag widgets to your dashboard or click to add
        </p>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="space-y-6">
          {['Tables', 'Cards', 'Charts'].map((category) => (
            <div key={category}>
              <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">
                {category}
              </h3>
              <div className="space-y-2">
                {widgetTemplates
                  .filter((widget) => widget.category === category)
                  .map((widget) => (
                    <DraggableSidebarItem
                      key={widget.id}
                      template={widget}
                      onClick={() => addWidget(widget)}
                    />
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-6 border-t space-y-2">
        <Button
          variant="outline"
          className="w-full bg-transparent"
          size="sm"
          onClick={handleExportLayout}
        >
          <Download className="h-4 w-4 mr-2" />
          Export Layout
        </Button>
        <Button
          variant="outline"
          className="w-full bg-transparent"
          size="sm"
          onClick={handleImportLayout}
        >
          <Upload className="h-4 w-4 mr-2" />
          Import Layout
        </Button>
        <Button variant="outline" className="w-full bg-transparent" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          Dashboard Settings
        </Button>
        <Button
          variant="outline"
          className="w-full bg-transparent text-destructive hover:bg-destructive hover:text-destructive-foreground"
          size="sm"
          onClick={clearAllWidgets}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Clear All
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Sidebar */}
      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent side="left" className="w-80 p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Dashboard Sidebar</SheetTitle>
          </SheetHeader>
          {content}
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-80 border-r bg-card/50">{content}</aside>
    </>
  );
}
