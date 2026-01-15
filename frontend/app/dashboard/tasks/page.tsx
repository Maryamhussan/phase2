'use client';

import { Header } from '@/components/layout/header';
import { Sidebar } from '@/components/layout/sidebar';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { TaskList } from '@/components/tasks/task-list';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Circle, Clock, Flag } from 'lucide-react';

export default function TasksPage() {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen">
        <Sidebar />

        <main className="flex-1 md:ml-64 transition-all duration-300">
          <Header />

          <div className="container py-4 sm:py-6 px-2 sm:px-4">
            <div className="max-w-4xl mx-auto">
              <div className="mb-6 sm:mb-8">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">Tasks</h1>
                <p className="text-muted-foreground mt-2">Organize and manage your daily activities</p>
              </div>

              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <CardTitle>Your Tasks</CardTitle>
                      <CardDescription>Manage your daily activities and stay organized</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Flag className="h-3 w-3" />
                        Priority
                      </Badge>
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Due Soon
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <TaskList />
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}