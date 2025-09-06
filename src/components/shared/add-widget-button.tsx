import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useWidgetStore } from '@/store';

export function AddWidgetButton() {
  const { setIsAddingWidget } = useWidgetStore();

  const handleClick = () => {
    setIsAddingWidget(true);
  };

  return (
    <Button variant="default" onClick={handleClick}>
      <Plus />
      Add Widget
    </Button>
  );
}
