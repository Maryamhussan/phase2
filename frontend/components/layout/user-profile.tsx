'use client';

import { useAuth } from '@/lib/auth';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { User, LogOut } from 'lucide-react';

export function UserProfile() {
  const { user, signOut } = useAuth();

  if (!user) {
    return null;
  }

  // Format full name
  const fullName = user.firstName && user.lastName
    ? `${user.firstName} ${user.lastName}`
    : user.firstName || user.lastName || user.email.split('@')[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center gap-2">
          <User className="h-4 w-4" />
          <span className="hidden sm:inline-block truncate max-w-30">
            {fullName}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem disabled className="cursor-default">
          <div className="flex flex-col">
            <span className="font-medium">{fullName}</span>
            <span className="text-xs text-muted-foreground">
              {user.email}
            </span>
            <span className="text-xs text-muted-foreground mt-1">
              Member since {new Date(user.createdAt).toLocaleDateString()}
            </span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={signOut} className="flex items-center gap-2">
          <LogOut className="h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}