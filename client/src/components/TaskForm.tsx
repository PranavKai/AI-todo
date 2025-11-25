import { useState } from 'react';
import { motion } from 'framer-motion';
import { Task } from '../types';
import { Plus } from 'lucide-react';

interface TaskFormProps {
  onSubmit: (task: Omit<Task, 'id' | 'created_at' | 'completed_at'>) => void;
}

export default function TaskForm({ onSubmit }: TaskFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Task['priority']>('medium');
  const [status, setStatus] = useState<Task['status']>('todo');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) return;

    onSubmit({
      title: title.trim(),
      description: description.trim() || undefined,
      status,
      priority,
      position: 0,
    });

    // Reset form
    setTitle('');
    setDescription('');
    setPriority('medium');
    setStatus('todo');
    setIsOpen(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-6"
    >
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="w-full flex items-center justify-center gap-2 btn-primary py-4"
        >
          <Plus size={20} />
          Add New Task
        </button>
      ) : (
        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Task Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              className="input-field"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add more details..."
              className="input-field min-h-[100px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Task['priority'])}
                className="input-field"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Task['status'])}
                className="input-field"
              >
                <option value="todo">Todo</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3">
            <button type="submit" className="flex-1 btn-primary">
              Create Task
            </button>
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setTitle('');
                setDescription('');
              }}
              className="flex-1 btn-secondary"
            >
              Cancel
            </button>
          </div>
        </motion.form>
      )}
    </motion.div>
  );
}
