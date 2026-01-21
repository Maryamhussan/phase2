'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert } from '@/components/ui/alert';
import { proxyApiClient } from '../lib/proxy-api';

interface Task {
  id?: number;
  title: string;
  description: string | null;
  completed: boolean;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

interface TaskFormProps {
  task?: Task;
  onSubmit: (task: Task) => void;
  onCancel: () => void;
  onError?: (error: string) => void;
}

export function TaskForm({ task, onSubmit, onCancel, onError }: TaskFormProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState<Omit<Task, 'id'>>({
    title: task?.title || '',
    description: task?.description || '',
    completed: task?.completed || false,
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const isSubmitting = useRef(false); // Track if a submission is in progress

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || '',
        completed: task.completed,
      });
    } else {
      setFormData({
        title: '',
        description: '',
        completed: false,
      });
    }
  }, [task]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

    setFormData(prev => ({
      ...prev,
      [name]: val
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent duplicate submissions
    if (isSubmitting.current) {
      console.log('Submission prevented - already submitting');
      return;
    }

    // Don't submit if user is not authenticated
    if (!user?.id) {
      setError('Not authenticated');
      return;
    }

    console.log('handleSubmit called with task:', task, 'formData:', formData);

    isSubmitting.current = true;
    setError(null);
    setIsLoading(true);

    try {
      if (task?.id) {
        console.log('Updating existing task with ID:', task.id);
        // Update existing task
        const response = await proxyApiClient.updateTask(task.id, formData);
        onSubmit(response);
      } else {
        console.log('Creating new task');
        // Create new task
        const response = await proxyApiClient.createTask(formData);
        onSubmit(response);
      }
    } catch (err: any) {
      console.error('Error in handleSubmit:', err);
      const errorMsg = err.message || 'Failed to save task';
      setError(errorMsg);
      if (onError) {
        onError(errorMsg);
      }
    } finally {
      setIsLoading(false);
      isSubmitting.current = false;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-background p-4 rounded-lg border">
      {error && (
        <Alert variant="destructive">
          {error}
        </Alert>
      )}

      <div>
        <Label htmlFor="title" className="text-sm font-medium">Title *</Label>
        <Input
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          placeholder="Task title"
          className="mt-1 bg-card"
        />
      </div>

      <div>
        <Label htmlFor="description" className="text-sm font-medium">Description</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description || ''}
          onChange={handleChange}
          placeholder="Task description"
          className="mt-1 bg-card"
        />
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="completed"
          name="completed"
          checked={formData.completed}
          onChange={handleChange}
          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
        />
        <Label htmlFor="completed" className="text-sm font-medium">Completed</Label>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : task?.id ? 'Update Task' : 'Create Task'}
        </Button>
      </div>
    </form>
  );
}