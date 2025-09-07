'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { WidgetTemplateSelector } from '@/components/dashboard/widget-template-selector';

export function AddWidgetButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Button
        variant="default"
        onClick={() => setIsModalOpen(true)}
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Widget
      </Button>
      
      <WidgetTemplateSelector 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
}
