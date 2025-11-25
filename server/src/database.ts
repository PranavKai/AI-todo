import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Use Railway volume path if available, otherwise local path
const dbPath = process.env.RAILWAY_VOLUME_MOUNT_PATH
  ? join(process.env.RAILWAY_VOLUME_MOUNT_PATH, 'todo.db')
  : join(__dirname, '../todo.db');

const db = new Database(dbPath);

// Initialize database schema
db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'todo',
    priority TEXT DEFAULT 'medium',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME,
    position INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS task_analytics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL UNIQUE,
    total_tasks INTEGER DEFAULT 0,
    completed_tasks INTEGER DEFAULT 0,
    completion_rate REAL DEFAULT 0,
    categories TEXT
  );

  CREATE TABLE IF NOT EXISTS ai_insights (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    insight_type TEXT NOT NULL,
    content TEXT NOT NULL,
    related_tasks TEXT,
    confidence_score REAL
  );

  CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
  CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at);
  CREATE INDEX IF NOT EXISTS idx_analytics_date ON task_analytics(date);
  CREATE INDEX IF NOT EXISTS idx_insights_created_at ON ai_insights(created_at);
`);

export interface Task {
  id?: number;
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'done';
  priority?: 'low' | 'medium' | 'high';
  created_at?: string;
  completed_at?: string;
  position: number;
}

export interface DailyAnalytics {
  date: string;
  total_tasks: number;
  completed_tasks: number;
  completion_rate: number;
  categories?: string;
}

export interface AIInsight {
  id?: number;
  created_at?: string;
  insight_type: 'pattern' | 'completion' | 'failure' | 'recommendation';
  content: string;
  related_tasks?: string;
  confidence_score?: number;
}

// Task operations
export const taskQueries = {
  getAll: db.prepare('SELECT * FROM tasks ORDER BY position ASC, created_at DESC'),

  getById: db.prepare('SELECT * FROM tasks WHERE id = ?'),

  create: db.prepare(`
    INSERT INTO tasks (title, description, status, priority, position)
    VALUES (?, ?, ?, ?, ?)
  `),

  update: db.prepare(`
    UPDATE tasks
    SET title = ?, description = ?, status = ?, priority = ?, completed_at = ?
    WHERE id = ?
  `),

  updatePosition: db.prepare('UPDATE tasks SET position = ? WHERE id = ?'),

  delete: db.prepare('DELETE FROM tasks WHERE id = ?'),

  getByDateRange: db.prepare(`
    SELECT * FROM tasks
    WHERE date(created_at) BETWEEN date(?) AND date(?)
    ORDER BY created_at DESC
  `),
};

// Analytics operations
export const analyticsQueries = {
  getDailyStats: db.prepare(`
    SELECT
      date(created_at) as date,
      COUNT(*) as total_tasks,
      SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END) as completed_tasks,
      CAST(SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END) AS REAL) / COUNT(*) * 100 as completion_rate
    FROM tasks
    WHERE date(created_at) = date(?)
    GROUP BY date(created_at)
  `),

  getWeeklyStats: db.prepare(`
    SELECT
      date(created_at) as date,
      COUNT(*) as total_tasks,
      SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END) as completed_tasks,
      CAST(SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END) AS REAL) / COUNT(*) * 100 as completion_rate
    FROM tasks
    WHERE date(created_at) >= date('now', '-7 days')
    GROUP BY date(created_at)
    ORDER BY date DESC
  `),

  getAllTasks: db.prepare('SELECT * FROM tasks ORDER BY created_at DESC'),
};

// AI Insights operations
export const insightsQueries = {
  getAll: db.prepare('SELECT * FROM ai_insights ORDER BY created_at DESC LIMIT 10'),

  create: db.prepare(`
    INSERT INTO ai_insights (insight_type, content, related_tasks, confidence_score)
    VALUES (?, ?, ?, ?)
  `),

  getByType: db.prepare(`
    SELECT * FROM ai_insights
    WHERE insight_type = ?
    ORDER BY created_at DESC
    LIMIT 5
  `),
};

export default db;
