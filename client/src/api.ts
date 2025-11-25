import { Task, AnalysisResult, AIInsight, DailyStats } from './types';

const API_BASE = '/api';

export const api = {
  // Tasks
  async getTasks(): Promise<Task[]> {
    const res = await fetch(`${API_BASE}/tasks`);
    return res.json();
  },

  async createTask(task: Omit<Task, 'id' | 'created_at' | 'completed_at'>): Promise<Task> {
    const res = await fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task),
    });
    return res.json();
  },

  async updateTask(id: number, task: Partial<Task>): Promise<Task> {
    const res = await fetch(`${API_BASE}/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task),
    });
    return res.json();
  },

  async reorderTasks(tasks: { id: number; position: number }[]): Promise<void> {
    await fetch(`${API_BASE}/tasks/reorder`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tasks }),
    });
  },

  async deleteTask(id: number): Promise<void> {
    await fetch(`${API_BASE}/tasks/${id}`, { method: 'DELETE' });
  },

  // Analytics
  async getDailyStats(date?: string): Promise<DailyStats> {
    const url = date ? `${API_BASE}/analytics/daily?date=${date}` : `${API_BASE}/analytics/daily`;
    const res = await fetch(url);
    return res.json();
  },

  async getWeeklyStats(): Promise<DailyStats[]> {
    const res = await fetch(`${API_BASE}/analytics/weekly`);
    return res.json();
  },

  // AI
  async analyzeTask(): Promise<AnalysisResult> {
    const res = await fetch(`${API_BASE}/ai/analyze`);
    return res.json();
  },

  async getInsights(): Promise<AIInsight[]> {
    const res = await fetch(`${API_BASE}/ai/insights`);
    return res.json();
  },
};
