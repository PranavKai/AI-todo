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

export interface AIInsight {
  id?: number;
  created_at?: string;
  insight_type: 'pattern' | 'completion' | 'failure' | 'recommendation';
  content: string;
  related_tasks?: string;
  confidence_score?: number;
}

export interface AnalysisResult {
  patterns: string[];
  completionInsights: string[];
  failureReasons: string[];
  recommendations: string[];
}

export interface DailyStats {
  date: string;
  total_tasks: number;
  completed_tasks: number;
  completion_rate: number;
}
