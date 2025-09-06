'use client';

import { CardWidget, TableWidget, ChartWidget } from '@/components/widgets';
import { useWidgetStore } from '@/store';
import { WidgetData } from '@/types';

interface WidgetContainerProps {
  widget: WidgetData;
}

export function WidgetContainer({ widget }: WidgetContainerProps) {
  const { removeWidget, setIsEditingWidget } = useWidgetStore();

  const handleRefresh = () => {
    // Refresh is handled by the useWidget hook
  };

  const handleEdit = () => {
    setIsEditingWidget(widget.id);
  };

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete "${widget.config.name}"?`)) {
      removeWidget(widget.id);
    }
  };

  const renderWidget = () => {
    switch (widget.config.displayMode) {
      case 'card':
        return (
          <CardWidget
            widget={widget}
            onRefresh={handleRefresh}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        );
      case 'table':
        return (
          <TableWidget
            widget={widget}
            onRefresh={handleRefresh}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        );
      case 'chart':
        return (
          <ChartWidget
            widget={widget}
            onRefresh={handleRefresh}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        );
      default:
        return (
          <CardWidget
            widget={widget}
            onRefresh={handleRefresh}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        );
    }
  };

  return <div className="w-full h-full">{renderWidget()}</div>;
}
