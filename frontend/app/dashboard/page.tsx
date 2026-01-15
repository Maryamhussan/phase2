'use client';

import { Header } from '@/components/layout/header';
import { Sidebar } from '@/components/layout/sidebar';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { TaskList } from '@/components/tasks/task-list';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, CheckCircle, Clock, Star } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const { token } = useAuth();
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    overdue: 0
  });
  const [loading, setLoading] = useState(true);

  // Define fetchStats function so it can be called from the callback
  const fetchStats = async () => {
    if (!token) return;

    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tasks`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const tasks = await response.json();
        const total = tasks.length;
        const completed = tasks.filter((task: any) => task.completed).length;
        const pending = tasks.filter((task: any) => !task.completed).length;

        // Calculate overdue (tasks that are not completed and past due date)
        // For now, we'll just show pending as non-overdue since we don't have due dates
        const overdue = 0; // Placeholder - would calculate based on due dates if available

        setStats({
          total,
          completed,
          pending,
          overdue
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchStats();
    }
  }, [token]);

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen">
        <Sidebar />

        <main className="flex-1 md:ml-64 transition-all duration-300">
          <Header />

          <div className="container py-4 sm:py-6 px-2 sm:px-4">
            <div className="max-w-6xl mx-auto">
              <div className="mb-8">
                <h1 className="text-3xl sm:text-4xl font-bold text-foreground">Dashboard</h1>
                <p className="text-muted-foreground mt-2">Manage your tasks and boost your productivity</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Welcome Back!
                    </CardTitle>
                    <CardDescription>Your personalized workspace</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-foreground mb-3 sm:mb-4">
                      Get started by organizing your tasks and setting priorities for maximum productivity.
                    </p>
                    <div className="flex flex-wrap gap-1 sm:gap-2">
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        Productivity
                      </Badge>
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Organization
                      </Badge>
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Efficiency
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Quick Stats</CardTitle>
                    <CardDescription>Your productivity overview</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Total Tasks</span>
                        <span className="font-semibold text-foreground">{loading ? '...' : stats.total}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Completed</span>
                        <span className="font-semibold text-green-500">{loading ? '...' : stats.completed}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Pending</span>
                        <span className="font-semibold text-yellow-500">{loading ? '...' : stats.pending}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Overdue</span>
                        <span className="font-semibold text-red-500">{loading ? '...' : stats.overdue}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Your Tasks</span>
                  </CardTitle>
                  <CardDescription>Manage and organize your daily activities</CardDescription>
                </CardHeader>
                <CardContent>
                  <TaskList onTaskChange={() => fetchStats()} />
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}