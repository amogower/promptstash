import React from 'react';
import { BookMarked, LogOut, Upload, Download, Menu } from 'lucide-react';
import { Button } from './ui/button';
import { useStore } from '@/lib/store';
import { getNextIconColor } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { createPrompt, signOut, exportPrompts, importPrompts } = useStore();
  const navigate = useNavigate();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const iconColor = React.useMemo(getNextIconColor, []);

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        await importPrompts(file);
      } catch (error) {
        alert((error as Error).message);
      }
      // Reset the input
      e.target.value = '';
    }
  };

  const handleNewPrompt = async () => {
    const newPrompt = {
      title: 'New Prompt',
      content: '',
      variables: [], 
      category_id: new URLSearchParams(window.location.search).get('category') || null,
    };
    const prompt = await createPrompt(newPrompt);
    if (prompt) {
      navigate(`/prompt/${prompt.id}`);
    } 
  };

  return (
    <header className="border-b border-border bg-background/80 backdrop-blur-sm fixed top-0 left-0 right-0 z-50">
      <div className="flex h-[4.5rem] items-center px-4 md:px-6" style={{ paddingTop: 'max(env(safe-area-inset-top), 0.75rem)', paddingBottom: '0.75rem' }}>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden mr-2"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-4">
          <BookMarked
            className="h-6 w-6" 
            style={{ 
              color: `var(--theme-mode, ${iconColor.light})`,
            }}
          />
          <h1 className="text-lg font-semibold text-foreground">PromptStash</h1>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-4">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImport}
              accept=".json"
              className="hidden"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={exportPrompts}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImport}
            accept=".json"
            className="hidden sm:hidden"
          />
          <Button variant="ghost" size="sm" onClick={signOut}>
            <LogOut className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Sign Out</span>
          </Button>
          <Button size="sm" onClick={handleNewPrompt}>
            <span className="hidden sm:inline">New Prompt</span>
            <span className="sm:hidden">+</span>
          </Button>
        </div>
      </div>
    </header>
  );
}