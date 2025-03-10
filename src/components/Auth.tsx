import React from 'react';
import { useStore } from '@/lib/store';
import { Button } from './ui/button';
import { LogIn, BookMarked, Github, Gitlab } from 'lucide-react';
import posthog from 'posthog-js';

export function Auth() {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [isSignUp, setIsSignUp] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const { signIn, signUp, signInWithGitHub, signInWithGitLab } = useStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    try {
      if (isSignUp) {
        await signUp(email, password);
        posthog.capture('auth:signup_complete', {
          email_domain: email.split('@')[1],
          method: 'email'
        });
        setIsSignUp(false);
      } else {
        await signIn(email, password);
        posthog.capture('auth:login_complete', {
          email_domain: email.split('@')[1],
          method: 'email'
        });
      }
    } catch (err) {
      const errorMessage = (err as Error).message;
      setError(errorMessage);
      posthog.capture('auth:login_fail', {
        error: errorMessage,
        type: isSignUp ? 'signup' : 'login',
        method: 'email'
      });
    }
  };

  const handleGitHubSignIn = async () => {
    try {
      setError(null);
      posthog.capture('auth:social_login_start', { provider: 'github' });
      await signInWithGitHub();
    } catch (err) {
      const errorMessage = (err as Error).message;
      setError(errorMessage);
      posthog.capture('auth:login_fail', {
        error: errorMessage,
        method: 'github'
      });
    }
  };

  const handleGitLabSignIn = async () => {
    try {
      setError(null);
      posthog.capture('auth:social_login_start', { provider: 'gitlab' });
      await signInWithGitLab();
    } catch (err) {
      const errorMessage = (err as Error).message;
      setError(errorMessage);
      posthog.capture('auth:login_fail', {
        error: errorMessage,
        method: 'gitlab'
      });
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-background px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <BookMarked className="h-12 w-12 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">
            {isSignUp ? 'Create your account' : 'Sign in to your account'}
          </h2>
          <p className="mt-2 text-sm text-foreground/60">
            {isSignUp
              ? 'Create an account to start using PromptStash'
              : 'Welcome back! Please sign in to your account'}
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-destructive/10 p-4">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-input bg-background text-foreground placeholder-foreground/50 rounded-t-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-input bg-background text-foreground placeholder-foreground/50 rounded-b-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                placeholder="Password"
              />
            </div>
          </div>

          <div>
            <Button type="submit" className="w-full group">
              <LogIn className="h-4 w-4 mr-2" />
              {isSignUp ? 'Sign up' : 'Sign in'}
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-input"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-background text-foreground/60">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleGitHubSignIn}
              className="w-full dark:border-foreground/20 dark:text-foreground"
            >
              <Github className="h-4 w-4 mr-2" />
              GitHub
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleGitLabSignIn}
              className="w-full dark:border-foreground/20 dark:text-foreground"
            >
              <Gitlab className="h-4 w-4 mr-2" />
              GitLab
            </Button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                posthog.capture('auth:mode_switch', {
                  to: !isSignUp ? 'signup' : 'login'
                });
              }}
              className="text-sm text-primary hover:text-primary/80"
            >
              {isSignUp
                ? 'Already have an account? Sign in'
                : "Don't have an account? Sign up"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}