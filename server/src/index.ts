import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { taskQueries, analyticsQueries, Task } from './database.js';
import { aiService } from './ai-service.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 50001;

app.use(cors());
app.use(express.json());

// Serve static files from the client build
app.use(express.static(join(__dirname, '../../client/dist')));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Todo API is running' });
});

// Get all tasks
app.get('/api/tasks', (req, res) => {
  try {
    const tasks = taskQueries.getAll.all();
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Get single task
app.get('/api/tasks/:id', (req, res) => {
  try {
    const task = taskQueries.getById.get(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch task' });
  }
});

// Create task
app.post('/api/tasks', (req, res) => {
  try {
    const { title, description, status = 'todo', priority = 'medium', position = 0 } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const result = taskQueries.create.run(title, description, status, priority, position);
    const newTask = taskQueries.getById.get(result.lastInsertRowid);

    res.status(201).json(newTask);
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// Update task
app.put('/api/tasks/:id', (req, res) => {
  try {
    const { title, description, status, priority } = req.body;
    const existingTask = taskQueries.getById.get(req.params.id) as Task;

    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const completed_at = status === 'done' && existingTask.status !== 'done'
      ? new Date().toISOString()
      : existingTask.completed_at;

    taskQueries.update.run(
      title || existingTask.title,
      description !== undefined ? description : existingTask.description,
      status || existingTask.status,
      priority || existingTask.priority,
      completed_at,
      req.params.id
    );

    const updatedTask = taskQueries.getById.get(req.params.id);
    res.json(updatedTask);
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// Update task positions (for drag and drop)
app.patch('/api/tasks/reorder', (req, res) => {
  try {
    const { tasks } = req.body; // Array of { id, position }

    if (!Array.isArray(tasks)) {
      return res.status(400).json({ error: 'Tasks array is required' });
    }

    tasks.forEach(({ id, position }) => {
      taskQueries.updatePosition.run(position, id);
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Reorder tasks error:', error);
    res.status(500).json({ error: 'Failed to reorder tasks' });
  }
});

// Delete task
app.delete('/api/tasks/:id', (req, res) => {
  try {
    const task = taskQueries.getById.get(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    taskQueries.delete.run(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// Analytics endpoints
app.get('/api/analytics/daily', (req, res) => {
  try {
    const date = req.query.date as string || new Date().toISOString().split('T')[0];
    const stats = analyticsQueries.getDailyStats.get(date);
    res.json(stats || { date, total_tasks: 0, completed_tasks: 0, completion_rate: 0 });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch daily stats' });
  }
});

app.get('/api/analytics/weekly', (req, res) => {
  try {
    const stats = analyticsQueries.getWeeklyStats.all();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch weekly stats' });
  }
});

// AI Analysis endpoint
app.get('/api/ai/analyze', async (req, res) => {
  try {
    const tasks = analyticsQueries.getAllTasks.all() as Task[];
    const analysis = await aiService.analyzeTasks(tasks);

    // Save insights to database
    for (const pattern of analysis.patterns) {
      await aiService.saveInsight({
        insight_type: 'pattern',
        content: pattern,
        related_tasks: JSON.stringify(tasks.map(t => t.id)),
      });
    }

    for (const insight of analysis.completionInsights) {
      await aiService.saveInsight({
        insight_type: 'completion',
        content: insight,
      });
    }

    for (const reason of analysis.failureReasons) {
      await aiService.saveInsight({
        insight_type: 'failure',
        content: reason,
      });
    }

    for (const recommendation of analysis.recommendations) {
      await aiService.saveInsight({
        insight_type: 'recommendation',
        content: recommendation,
      });
    }

    res.json(analysis);
  } catch (error) {
    console.error('AI analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze tasks' });
  }
});

// Get recent AI insights
app.get('/api/ai/insights', async (req, res) => {
  try {
    const insights = await aiService.getRecentInsights();
    res.json(insights);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch insights' });
  }
});

// Serve client app for all non-API routes (SPA fallback)
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, '../../client/dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
