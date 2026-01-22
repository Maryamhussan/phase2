import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  title: string;
  description?: string;
  actionText?: string;
  onActionClick?: () => void;
  icon?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  actionText,
  onActionClick,
  icon,
  className
}: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-12 px-4 text-center", className)}>
      {icon && <div className="mb-4 text-gray-400">{icon}</div>}

      <h3 className="text-lg font-medium text-foreground mb-1">{title}</h3>

      {description && (
        <p className="text-sm text-muted-foreground mb-6 max-w-md">
          {description}
        </p>
      )}

      {actionText && onActionClick && (
        <Button onClick={onActionClick}>
          {actionText}
        </Button>
      )}
    </div>
  );
}