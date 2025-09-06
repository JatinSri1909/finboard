import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import { ADD_WIDGET_FORM_FIELDS } from '@/constants';

export function AddWidgetButton() {
  return (
    <Dialog>
      <form>
        <DialogTrigger asChild>
          <Button variant="default">
            <Plus />
            Add Widget
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px] bg-slate-950 border-none text-white">
          <DialogHeader>
            <DialogTitle>Add New Widget</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            {Object.entries(ADD_WIDGET_FORM_FIELDS)
              .sort(([, a], [, b]) => a.index - b.index)
              .map(([key, field]) => (
                <div key={key} className="grid gap-3">
                  <Label htmlFor={key}>{field.label}</Label>
                  <Input
                    id={key}
                    name={key}
                    type={field.type}
                    placeholder={field.placeholder}
                    className="bg-slate-700 border-none"
                  />
                </div>
              ))}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant={'ghost'}>Cancel</Button>
            </DialogClose>
            <Button type="submit">Add Widget</Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
