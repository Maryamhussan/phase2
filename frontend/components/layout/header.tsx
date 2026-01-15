'use client';

import { useAuth } from '@/lib/auth';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { UserProfile } from '@/components/layout/user-profile';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function Header() {
  const { user, isAuthenticated, signOut } = useAuth();

  return (
    <header className="border-b">
      <div className="container flex h-14 sm:h-16 items-center justify-between px-2 sm:px-4">
        <div className="flex items-center space-x-2">
          <Link href="/">
            <span className="text-lg sm:text-xl font-bold">Todo App</span>
          </Link>
        </div>

        <div className="flex items-center space-x-1 sm:space-x-2">
          <ThemeToggle />

          {isAuthenticated ? (
            <UserProfile />
          ) : (
            <Button variant="outline" size="sm" asChild>
              <Link href="/signin">Sign in</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}