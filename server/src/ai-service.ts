import { Task, AIInsight, insightsQueries } from './database.js';

interface AnalysisResult {
  patterns: string[];
  completionInsights: string[];
  failureReasons: string[];
  recommendations: string[];
}

export class AIService {
  private groqApiKey: string;
  private groqEndpoint = 'https://api.groq.com/openai/v1/chat/completions';

  constructor(apiKey?: string) {
    this.groqApiKey = apiKey || process.env.GROQ_API_KEY || '';
  }

  async analyzeTasks(tasks: Task[]): Promise<AnalysisResult> {
    const completedTasks = tasks.filter(t => t.status === 'done');
    const incompleteTasks = tasks.filter(t => t.status !== 'done');
    const totalTasks = tasks.length;

    if (totalTasks === 0) {
      return {
        patterns: ['No tasks to analyze yet'],
        completionInsights: ['Start adding tasks to get insights'],
        failureReasons: [],
        recommendations: ['Create your first task to begin tracking your productivity'],
      };
    }

    const prompt = `Analyze these task patterns and provide insights:

Total tasks: ${totalTasks}
Completed: ${completedTasks.length}
In progress/Todo: ${incompleteTasks.length}

Completed tasks:
${completedTasks.map(t => `- ${t.title} (Priority: ${t.priority})`).join('\n')}

Incomplete tasks:
${incompleteTasks.map(t => `- ${t.title} (Status: ${t.status}, Priority: ${t.priority})`).join('\n')}

Provide a JSON response with:
1. "patterns": Array of 2-3 patterns you notice in task types or priorities
2. "completionInsights": Array of 2-3 insights about what gets completed
3. "failureReasons": Array of 2-3 possible reasons tasks aren't completed
4. "recommendations": Array of 2-3 actionable recommendations

Keep each point concise (1 sentence). Focus on actionable insights.`;

    try {
      if (!this.groqApiKey) {
        // Fallback to basic analysis if no API key
        return this.basicAnalysis(tasks, completedTasks, incompleteTasks);
      }

      const response = await fetch(this.groqEndpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.groqApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: 'You are a productivity analyst. Analyze task patterns and provide brief, actionable insights in JSON format.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1000,
        }),
      });

      if (!response.ok) {
        console.error('Groq API error:', await response.text());
        return this.basicAnalysis(tasks, completedTasks, incompleteTasks);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content || '';

      // Extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const analysis = JSON.parse(jsonMatch[0]);
        return analysis;
      }

      return this.basicAnalysis(tasks, completedTasks, incompleteTasks);
    } catch (error) {
      console.error('AI analysis error:', error);
      return this.basicAnalysis(tasks, completedTasks, incompleteTasks);
    }
  }

  private basicAnalysis(tasks: Task[], completedTasks: Task[], incompleteTasks: Task[]): AnalysisResult {
    const completionRate = tasks.length > 0 ? (completedTasks.length / tasks.length * 100).toFixed(0) : 0;

    const highPriorityCompleted = completedTasks.filter(t => t.priority === 'high').length;
    const highPriorityIncomplete = incompleteTasks.filter(t => t.priority === 'high').length;

    const patterns = [];
    const completionInsights = [];
    const failureReasons = [];
    const recommendations = [];

    // Patterns
    if (tasks.length > 0) {
      const avgTasksPerDay = tasks.length / 7;
      patterns.push(`You create an average of ${avgTasksPerDay.toFixed(1)} tasks per week`);

      const priorityDist = {
        high: tasks.filter(t => t.priority === 'high').length,
        medium: tasks.filter(t => t.priority === 'medium').length,
        low: tasks.filter(t => t.priority === 'low').length,
      };
      const mostCommon = Object.entries(priorityDist).sort((a, b) => b[1] - a[1])[0];
      patterns.push(`Most tasks are ${mostCommon[0]} priority (${mostCommon[1]} tasks)`);
    }

    // Completion insights
    if (completedTasks.length > 0) {
      completionInsights.push(`You have a ${completionRate}% completion rate`);
      if (highPriorityCompleted > 0) {
        completionInsights.push(`You've completed ${highPriorityCompleted} high-priority tasks`);
      }
    } else {
      completionInsights.push('No tasks completed yet - start checking items off your list!');
    }

    // Failure reasons
    if (incompleteTasks.length > 0) {
      if (highPriorityIncomplete > 0) {
        failureReasons.push(`${highPriorityIncomplete} high-priority tasks are still pending`);
      }
      if (incompleteTasks.length > completedTasks.length) {
        failureReasons.push('More incomplete tasks than completed - consider breaking down large tasks');
      }
    }

    // Recommendations
    if (parseInt(completionRate as string) < 50 && tasks.length > 3) {
      recommendations.push('Focus on completing existing tasks before adding new ones');
    }
    if (highPriorityIncomplete > 0) {
      recommendations.push('Prioritize high-priority tasks first for better productivity');
    }
    if (incompleteTasks.length > 10) {
      recommendations.push('Consider archiving or deleting tasks that are no longer relevant');
    } else {
      recommendations.push('Great job managing your task list! Keep up the momentum');
    }

    return { patterns, completionInsights, failureReasons, recommendations };
  }

  async saveInsight(insight: Omit<AIInsight, 'id' | 'created_at'>): Promise<void> {
    insightsQueries.create.run(
      insight.insight_type,
      insight.content,
      insight.related_tasks || null,
      insight.confidence_score || 0.8
    );
  }

  async getRecentInsights(): Promise<AIInsight[]> {
    return insightsQueries.getAll.all() as AIInsight[];
  }
}

export const aiService = new AIService();
