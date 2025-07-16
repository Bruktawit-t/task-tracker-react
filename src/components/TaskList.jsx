import TaskCard from './TaskCard';
import EmptyState from './EmptyState';

export default function TaskList({ tasks, onDelete, onToggleComplete, onEdit }) {
  if (tasks.length === 0) return <EmptyState />;

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onDelete={onDelete}
          onToggleComplete={onToggleComplete}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
}
