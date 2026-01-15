'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if the screen is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Close mobile menu when screen becomes larger
  useEffect(() => {
    if (isMobile === false) {
      setIsMobileMenuOpen(false);
    }
  }, [isMobile]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={toggleMobileMenu}
        />
      )}

      {/* Mobile menu */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 border-r bg-background transform transition-transform duration-300 ease-in-out md:hidden',
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full',
          className
        )}
      >
        <div className="flex h-full flex-col gap-2 p-4">
          <nav className="flex flex-col gap-2">
            <Button
              variant="ghost"
              className="justify-start"
              asChild
              onClick={toggleMobileMenu}
            >
              <Link href="/dashboard">Dashboard</Link>
            </Button>

            <Button
              variant="ghost"
              className="justify-start"
              asChild
              onClick={toggleMobileMenu}
            >
              <Link href="/dashboard/tasks">Tasks</Link>
            </Button>

            <Button
              variant="ghost"
              className="justify-start"
              asChild
              onClick={toggleMobileMenu}
            >
              <Link href="/dashboard/profile">Profile</Link>
            </Button>
          </nav>
        </div>
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-10 hidden w-64 border-r bg-background md:block',
          className
        )}
      >
        <div className="flex h-full flex-col gap-2 p-4">
          <nav className="flex flex-col gap-2">
            <Button
              variant="ghost"
              className="justify-start"
              asChild
            >
              <Link href="/dashboard">Dashboard</Link>
            </Button>

            <Button
              variant="ghost"
              className="justify-start"
              asChild
            >
              <Link href="/dashboard/tasks">Tasks</Link>
            </Button>

            <Button
              variant="ghost"
              className="justify-start"
              asChild
            >
              <Link href="/dashboard/profile">Profile</Link>
            </Button>
          </nav>
        </div>
      </aside>

      {/* Mobile menu toggle button - to be used in header */}
      <div className="fixed top-4 left-4 z-40 md:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleMobileMenu}
          aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {isMobileMenuOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" y1="12" x2="20" y2="12"></line>
              <line x1="4" y1="6" x2="20" y2="6"></line>
              <line x1="4" y1="18" x2="20" y2="18"></line>
            </svg>
          )}
        </Button>
      </div>
    </>
  );
}