'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { SettingsDialog } from './settings-dialog';
import { Menu, Plus, Settings } from 'lucide-react';

interface DashboardHeaderProps {
  onMenuClick: () => void;
  onAddWidget: () => void;
}

export function DashboardHeader({ onMenuClick, onAddWidget }: DashboardHeaderProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onMenuClick} className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>

            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">FB</span>
              </div>
              <h1 className="text-xl font-bold text-foreground">FinBoard</h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onAddWidget}
              className="hidden sm:flex bg-transparent"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Widget
            </Button>

            <Button variant="ghost" size="icon" onClick={() => setSettingsOpen(true)}>
              <Settings className="h-5 w-5" />
            </Button>

            <ThemeToggle />
          </div>
        </div>
      </header>

      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </>
  );
}
