'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useWidgetStore } from '@/lib/widget-store';
import { widgetTemplates } from '@/lib/widget-templates';
import { Search } from 'lucide-react';

interface AddWidgetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddWidgetDialog({ open, onOpenChange }: AddWidgetDialogProps) {
  const { addWidget } = useWidgetStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredWidgets = widgetTemplates.filter((widget) => {
    const matchesSearch =
      widget.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      widget.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || widget.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['All', ...Array.from(new Set(widgetTemplates.map((w) => w.category)))];

  const handleAddWidget = (template: any) => {
    addWidget(template);
    onOpenChange(false);
    setSearchQuery('');
    setSelectedCategory(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Add New Widget</DialogTitle>
          <DialogDescription>Choose a widget type to add to your dashboard</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search widgets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 flex-wrap">
            {categories.map((category) => (
              <Button
                key={category}
                variant={
                  selectedCategory === category || (category === 'All' && !selectedCategory)
                    ? 'default'
                    : 'outline'
                }
                size="sm"
                onClick={() => setSelectedCategory(category === 'All' ? null : category)}
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Widget Grid */}
          <div className="flex-1 overflow-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredWidgets.map((widget) => (
                <div
                  key={widget.id}
                  className="p-4 rounded-lg border bg-card hover:bg-accent/50 cursor-pointer transition-colors group"
                  onClick={() => handleAddWidget(widget)}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-md bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <widget.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-card-foreground">{widget.name}</h4>
                        {widget.popular && (
                          <Badge variant="secondary" className="text-xs">
                            Popular
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{widget.description}</p>
                      <Badge variant="outline" className="text-xs mt-2">
                        {widget.category}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
