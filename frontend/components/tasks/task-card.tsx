'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Modal } from '@/components/ui/modal';
import { TaskForm } from '@/components/tasks/task-form';
import { Trash2, Edit } from 'lucide-react';

interface Task {
  id: number;
  title: string;
  description: string | null;
  completed: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
}

interface TaskCardProps {
  task: Task;
  onToggleComplete: (completed: boolean) => void;
  onEdit: (updatedTask: Task) => void;
  onDelete: (taskId: number) => void;
  isUpdating?: boolean;
  isDeleting?: boolean;
}

export function TaskCard({ task, onToggleComplete, onEdit, onDelete, isUpdating, isDeleting }: TaskCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [localTask, setLocalTask] = useState<Task>(task);

  // Handle optimistic update for task completion
  const handleToggleComplete = (completed: boolean) => {
    // Optimistically update the UI
    const updatedTask = { ...localTask, completed };
    setLocalTask(updatedTask);

    // Call the parent function to handle the API call in the background
    onToggleComplete(completed);
  };

  const handleEditSubmit = (updatedTask: Task) => {
    onEdit(updatedTask);
    setIsEditing(false);
    // Update local state to reflect the changes
    setLocalTask(updatedTask);
  };

  const handleDeleteConfirm = () => {
    onDelete(task.id);
    setIsDeleteModalOpen(false);
  };

  return (
    <div className={`p-3 sm:p-4 rounded-lg border border-border ${task.completed ? 'bg-muted/30' : 'bg-background'} shadow-sm`}>
      <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-3">
        <div className="flex items-center">
          <Checkbox
            checked={localTask.completed}
            onCheckedChange={(checked) => handleToggleComplete(!!checked)}
            className="mt-0 sm:mt-1"
          />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className={`font-medium break-words ${localTask.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
            {localTask.title}
          </h3>

          {localTask.description && (
            <p className={`text-sm mt-1 break-words ${localTask.completed ? 'text-muted-foreground/70' : 'text-muted-foreground'}`}>
              {localTask.description}
            </p>
          )}

          <div className="text-xs text-muted-foreground mt-2">
            Created: {new Date(localTask.created_at).toLocaleDateString()}
          </div>
        </div>

        <div className="flex space-x-1 self-start sm:self-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(true)}
            disabled={isUpdating || isDeleting}
          >
            <Edit className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsDeleteModalOpen(true)}
            disabled={isUpdating || isDeleting}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Edit Task Modal */}
      <Modal
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        title="Edit Task"
        size="md"
      >
        <TaskForm
          task={task}
          onSubmit={handleEditSubmit}
          onCancel={() => setIsEditing(false)}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Delete"
        size="sm"
      >
        <div className="space-y-4">
          <p>Are you sure you want to delete this task?</p>
          <p className="font-medium">{task.title}</p>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}