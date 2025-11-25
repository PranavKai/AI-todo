import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Task } from './types';
import { api } from './api';
import TaskItem from './components/TaskItem';
import TaskForm from './components/TaskForm';
import Analytics from './components/Analytics';
import AIInsights from './components/AIInsights';
import { Sparkles, BarChart3, ListTodo } from 'lucide-react';

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'tasks' | 'analytics' | 'ai'>('tasks');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const data = await api.getTasks();
      setTasks(data);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async (task: Omit<Task, 'id' | 'created_at' | 'completed_at'>) => {
    try {
      const newTask = await api.createTask(task);
      setTasks([newTask, ...tasks]);
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const handleUpdateTask = async (id: number, updates: Partial<Task>) => {
    try {
      const updatedTask = await api.updateTask(id, updates);
      setTasks(tasks.map(t => (t.id === id ? updatedTask : t)));
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const handleDeleteTask = async (id: number) => {
    try {
      await api.deleteTask(id);
      setTasks(tasks.filter(t => t.id !== id));
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = tasks.findIndex(t => t.id === active.id);
      const newIndex = tasks.findIndex(t => t.id === over.id);

      const newTasks = arrayMove(tasks, oldIndex, newIndex);
      setTasks(newTasks);

      // Update positions in backend
      const updates = newTasks.map((task, index) => ({
        id: task.id!,
        position: index,
      }));

      try {
        await api.reorderTasks(updates);
      } catch (error) {
        console.error('Failed to reorder tasks:', error);
        // Revert on error
        loadTasks();
      }
    }
  };

  const todoTasks = tasks.filter(t => t.status === 'todo');
  const inProgressTasks = tasks.filter(t => t.status === 'in-progress');
  const doneTasks = tasks.filter(t => t.status === 'done');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            AI-Powered Todo
          </h1>
          <p className="text-gray-600">Track, analyze, and optimize your productivity</p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex gap-2 mb-6 justify-center"
        >
          <button
            onClick={() => setActiveTab('tasks')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'tasks'
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                : 'bg-white/50 text-gray-700 hover:bg-white/70'
            }`}
          >
            <ListTodo size={20} />
            Tasks
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'analytics'
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                : 'bg-white/50 text-gray-700 hover:bg-white/70'
            }`}
          >
            <BarChart3 size={20} />
            Analytics
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'ai'
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                : 'bg-white/50 text-gray-700 hover:bg-white/70'
            }`}
          >
            <Sparkles size={20} />
            AI Insights
          </button>
        </motion.div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'tasks' && (
            <motion.div
              key="tasks"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <TaskForm onSubmit={handleAddTask} />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                {/* Todo Column */}
                <div className="glass rounded-2xl p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    Todo ({todoTasks.length})
                  </h2>
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={todoTasks.map(t => t.id!)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-3">
                        <AnimatePresence>
                          {todoTasks.map(task => (
                            <TaskItem
                              key={task.id}
                              task={task}
                              onUpdate={handleUpdateTask}
                              onDelete={handleDeleteTask}
                            />
                          ))}
                        </AnimatePresence>
                      </div>
                    </SortableContext>
                  </DndContext>
                </div>

                {/* In Progress Column */}
                <div className="glass rounded-2xl p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                    In Progress ({inProgressTasks.length})
                  </h2>
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={inProgressTasks.map(t => t.id!)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-3">
                        <AnimatePresence>
                          {inProgressTasks.map(task => (
                            <TaskItem
                              key={task.id}
                              task={task}
                              onUpdate={handleUpdateTask}
                              onDelete={handleDeleteTask}
                            />
                          ))}
                        </AnimatePresence>
                      </div>
                    </SortableContext>
                  </DndContext>
                </div>

                {/* Done Column */}
                <div className="glass rounded-2xl p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    Done ({doneTasks.length})
                  </h2>
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={doneTasks.map(t => t.id!)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-3">
                        <AnimatePresence>
                          {doneTasks.map(task => (
                            <TaskItem
                              key={task.id}
                              task={task}
                              onUpdate={handleUpdateTask}
                              onDelete={handleDeleteTask}
                            />
                          ))}
                        </AnimatePresence>
                      </div>
                    </SortableContext>
                  </DndContext>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Analytics />
            </motion.div>
          )}

          {activeTab === 'ai' && (
            <motion.div
              key="ai"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <AIInsights />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default App;
