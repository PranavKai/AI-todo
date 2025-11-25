import { useState } from 'react';
import { motion } from 'framer-motion';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '../types';
import { GripVertical, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

interface TaskItemProps {
  task: Task;
  onUpdate: (id: number, updates: Partial<Task>) => void;
  onDelete: (id: number) => void;
}

const priorityColors = {
  low: 'border-green-400',
  medium: 'border-yellow-400',
  high: 'border-red-400',
};

const statusColors = {
  'todo': 'bg-yellow-50',
  'in-progress': 'bg-blue-50',
  'done': 'bg-green-50',
};

export default function TaskItem({ task, onUpdate, onDelete }: TaskItemProps) {
  const [expanded, setExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id! });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleSave = () => {
    onUpdate(task.id!, { title, description });
    setIsEditing(false);
  };

  const handleStatusChange = (status: Task['status']) => {
    onUpdate(task.id!, { status });
  };

  const handlePriorityChange = (priority: Task['priority']) => {
    onUpdate(task.id!, { priority });
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`task-card ${priorityColors[task.priority || 'medium']} ${
        statusColors[task.status]
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Drag Handle */}
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing mt-1">
          <GripVertical size={20} className="text-gray-400" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="space-y-2">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input-field text-sm"
                autoFocus
              />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input-field text-sm min-h-[60px]"
                placeholder="Description (optional)"
              />
              <div className="flex gap-2">
                <button onClick={handleSave} className="btn-primary text-sm py-1">
                  Save
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setTitle(task.title);
                    setDescription(task.description || '');
                  }}
                  className="btn-secondary text-sm py-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div
                onClick={() => setExpanded(!expanded)}
                className="cursor-pointer select-none"
              >
                <h3 className="font-medium text-gray-800 mb-1">{task.title}</h3>
                {task.description && expanded && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-sm text-gray-600 mb-2"
                  >
                    {task.description}
                  </motion.p>
                )}
              </div>

              <div className="flex flex-wrap gap-2 mt-2">
                {/* Status Select */}
                <select
                  value={task.status}
                  onChange={(e) => handleStatusChange(e.target.value as Task['status'])}
                  className="text-xs px-2 py-1 rounded-md border border-gray-200 bg-white/50 cursor-pointer"
                  onClick={(e) => e.stopPropagation()}
                >
                  <option value="todo">Todo</option>
                  <option value="in-progress">In Progress</option>
                  <option value="done">Done</option>
                </select>

                {/* Priority Select */}
                <select
                  value={task.priority}
                  onChange={(e) => handlePriorityChange(e.target.value as Task['priority'])}
                  className="text-xs px-2 py-1 rounded-md border border-gray-200 bg-white/50 cursor-pointer"
                  onClick={(e) => e.stopPropagation()}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-1">
          {!isEditing && (
            <>
              <button
                onClick={() => setExpanded(!expanded)}
                className="p-1 hover:bg-white/50 rounded transition-colors"
                title={expanded ? 'Collapse' : 'Expand'}
              >
                {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              <button
                onClick={() => setIsEditing(true)}
                className="p-1 hover:bg-white/50 rounded transition-colors text-blue-600"
                title="Edit"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
            </>
          )}
          <button
            onClick={() => onDelete(task.id!)}
            className="p-1 hover:bg-red-50 rounded transition-colors text-red-600"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
