'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../lib/auth';
import { TaskCard } from '../../components/tasks/task-card';
import { TaskSearch } from '../../components/tasks/task-search';
import { EmptyState } from '../../components/ui/empty-state';
import { LoadingSpinner } from '../../components/ui/loading-spinner';
import { Alert } from '../../components/ui/alert';
import { Button } from '../../components/ui/button';
import { TaskForm } from '../../components/tasks/task-form';
import { proxyApiClient, Task } from '../../lib/proxy-api';

interface TaskListProps {
  initialFilter?: 'all' | 'active' | 'completed';
  onTaskChange?: () => void;
}

export function TaskList({ initialFilter = 'all', onTaskChange }: TaskListProps) {
  const { user } = useAuth(); // Add auth hook to track user changes
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>(initialFilter);
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingTaskIds, setUpdatingTaskIds] = useState<number[]>([]);
  const [deletingTaskIds, setDeletingTaskIds] = useState<number[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, [user?.id]); // Use user.id specifically to avoid reference changes

  const fetchTasks = async () => {
    try {
      // Don't fetch tasks if user is not authenticated
      if (!user?.id) {
        setTasks([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      const tasksData = await proxyApiClient.getTasks();

      console.log(`Received ${tasksData.length} tasks from API:`,
        tasksData.map(t => ({id: t.id, title: t.title, completed: t.completed, createdAt: t.created_at}))
      );

      // Remove duplicates by using unique IDs
      const seenIds = new Set<number>();
      const uniqueTasks = tasksData.filter(task => {
        if (seenIds.has(task.id)) {
          console.log(`Found duplicate task with ID: ${task.id}`, task);
          return false; // Skip duplicate
        }
        seenIds.add(task.id);
        return true; // Keep first occurrence
      });

      console.log(`After deduplication: ${uniqueTasks.length} tasks`,
        uniqueTasks.map(t => ({id: t.id, title: t.title, completed: t.completed, createdAt: t.created_at}))
      );
      setTasks(uniqueTasks);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleTaskUpdate = (updatedTask: Task) => {
    setTasks(prevTasks => prevTasks.map(task =>
      task.id === updatedTask.id ? updatedTask : task
    ));
    setUpdatingTaskIds(prev => prev.filter(id => id !== updatedTask.id));

    // Notify parent component that tasks have changed
    if (onTaskChange) {
      onTaskChange();
    }
  };

  const handleTaskToggleComplete = async (taskId: number, completed: boolean) => {
    // Don't update if user is not authenticated
    if (!user?.id) {
      setError('Not authenticated');
      return;
    }

    setUpdatingTaskIds(prev => [...prev, taskId]);

    // Optimistic update: immediately update the UI
    setTasks(prevTasks => prevTasks.map(task =>
      task.id === taskId ? { ...task, completed } : task
    ));

    try {
      // Update the task on the server
      const response = await proxyApiClient.updateTaskCompletion(taskId, completed);

      // Update with server response in case anything changed
      setTasks(prevTasks => prevTasks.map(task =>
        task.id === taskId ? response : task
      ));
    } catch (err: any) {
      setError(err.message || 'Failed to update task completion');
      // Revert the optimistic update by refetching tasks
      fetchTasks();
    } finally {
      setUpdatingTaskIds(prev => prev.filter(id => id !== taskId));

      // Notify parent component that tasks have changed
      if (onTaskChange) {
        onTaskChange();
      }
    }
  };

  const handleTaskDelete = async (taskId: number) => {
    // Don't delete if user is not authenticated
    if (!user?.id) {
      setError('Not authenticated');
      return;
    }

    setDeletingTaskIds(prev => [...prev, taskId]);

    try {
      await proxyApiClient.deleteTask(taskId);
      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
    } catch (err: any) {
      setError(err.message || 'Failed to delete task');
    } finally {
      setDeletingTaskIds(prev => prev.filter(id => id !== taskId));

      // Notify parent component that tasks have changed
      if (onTaskChange) {
        onTaskChange();
      }
    }
  };

  const handleCreateTask = (taskData: Task) => {
    console.log('handleCreateTask called with:', taskData);

    // The task was already created by the form, just add it to the local state
    setTasks(prev => [taskData, ...prev]);
    setShowCreateForm(false);

    // Notify parent component that tasks have changed
    if (onTaskChange) {
      onTaskChange();
    }
  };

  const handleCancelCreate = () => {
    setShowCreateForm(false);
  };

  // Filter and search tasks
  const filteredTasks = tasks.filter(task => {
    // Apply filter (all, active, completed)
    if (filter === 'active' && task.completed) return false;
    if (filter === 'completed' && !task.completed) return false;

    // Apply search term if exists
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        task.title.toLowerCase().includes(searchLower) ||
        (task.description && task.description.toLowerCase().includes(searchLower))
      );
    }

    return true;
  });

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        {error}
      </Alert>
    );
  }

  if (filteredTasks.length === 0) {
    return (
      <div className="space-y-6">
        <TaskSearch
          onSearch={setSearchTerm}
          onFilterChange={setFilter}
          currentFilter={filter}
        />
        {!showCreateForm ? (
          <EmptyState
            title="No tasks found"
            description={
              searchTerm
                ? "No tasks match your search. Try a different query."
                : filter === 'all'
                  ? "You don't have any tasks yet. Create your first task to get started."
                  : `You don't have any ${filter} tasks.`
            }
            actionText="Create a task"
            onActionClick={() => setShowCreateForm(true)}
          />
        ) : (
          <div className="bg-card p-4 sm:p-6 rounded-lg shadow">
            <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-foreground">Create New Task</h3>
            <TaskForm
              onSubmit={handleCreateTask}
              onCancel={handleCancelCreate}
              onError={(errorMsg) => setError(errorMsg)}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
        <TaskSearch
          onSearch={setSearchTerm}
          onFilterChange={setFilter}
          currentFilter={filter}
        />
        <Button type="button" variant="default" onClick={() => setShowCreateForm(true)} className="w-full sm:w-auto">
          Create Task
        </Button>
      </div>

      {showCreateForm && (
        <div className="bg-card p-4 sm:p-6 rounded-lg shadow">
          <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-foreground">Create New Task</h3>
          <TaskForm
            key="create-task-form"
            onSubmit={handleCreateTask}
            onCancel={handleCancelCreate}
            onError={(errorMsg) => setError(errorMsg)}
          />
        </div>
      )}

      <div className="space-y-4">
        {filteredTasks.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            onToggleComplete={async (completed) => {
              await handleTaskToggleComplete(task.id, completed);
            }}
            onEdit={async (updatedTask) => {
              await handleTaskUpdate(updatedTask);
            }}
            onDelete={async () => {
              await handleTaskDelete(task.id);
            }}
            isUpdating={updatingTaskIds.includes(task.id)}
            isDeleting={deletingTaskIds.includes(task.id)}
          />
        ))}
      </div>
    </div>
  );
}