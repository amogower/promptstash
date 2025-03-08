import React from 'react';
import { BookMarked } from 'lucide-react';
import { buttonVariants } from './ui/button';
import { getNextIconColor, cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import posthog from 'posthog-js';

export function ShareHeader() {
  const iconColor = React.useMemo(getNextIconColor, []);

  return (
    <header className="border-b border-border bg-background/80 backdrop-blur-sm fixed top-0 left-0 right-0 z-50">
      <div className="flex h-[4.5rem] items-center px-4 md:px-6" style={{ paddingTop: 'max(env(safe-area-inset-top), 0.75rem)', paddingBottom: '0.75rem' }}>
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
          <Link 
            to="/login"
            className={cn(buttonVariants({ variant: 'secondary', size: 'sm' }))}
            onClick={() => posthog.capture('auth:login_button_click', { 
              from_share: true 
            })}
          >
            Log In
          </Link>
          <Link 
            to="/signup"
            className={cn(buttonVariants({ size: 'sm' }))}
            onClick={() => posthog.capture('auth:signup_button_click', { 
              from_share: true 
            })}
          >
            Sign Up
          </Link>
        </div>
      </div>
    </header>
  );
}
