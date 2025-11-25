import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { api } from '../api';
import { AnalysisResult } from '../types';
import { Sparkles, TrendingUp, XCircle, Lightbulb, RefreshCw } from 'lucide-react';

export default function AIInsights() {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAnalysis();
  }, []);

  const loadAnalysis = async () => {
    setLoading(true);
    try {
      const data = await api.analyzeTask();
      setAnalysis(data);
    } catch (error) {
      console.error('Failed to load AI analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full"
        />
        <p className="text-gray-600">Analyzing your tasks with AI...</p>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-gray-600">No analysis available</p>
        <button onClick={loadAnalysis} className="btn-primary">
          Generate Insights
        </button>
      </div>
    );
  }

  const InsightCard = ({
    title,
    icon: Icon,
    items,
    color,
    delay,
  }: {
    title: string;
    icon: any;
    items: string[];
    color: string;
    delay: number;
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="glass rounded-xl p-6"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-3 ${color} rounded-lg`}>
          <Icon className="text-white" size={24} />
        </div>
        <h3 className="text-xl font-bold text-gray-800">{title}</h3>
      </div>
      <ul className="space-y-3">
        {items.map((item, index) => (
          <motion.li
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: delay + 0.1 * index }}
            className="flex items-start gap-3 text-gray-700"
          >
            <span className="text-blue-500 mt-1">•</span>
            <span>{item}</span>
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-xl p-6 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
            <Sparkles className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">AI-Powered Insights</h2>
            <p className="text-gray-600">Understanding your productivity patterns</p>
          </div>
        </div>
        <button
          onClick={loadAnalysis}
          disabled={loading}
          className="btn-primary flex items-center gap-2"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </motion.div>

      {/* Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InsightCard
          title="Patterns Detected"
          icon={TrendingUp}
          items={analysis.patterns}
          color="bg-gradient-to-br from-blue-500 to-blue-600"
          delay={0.1}
        />

        <InsightCard
          title="Completion Insights"
          icon={Sparkles}
          items={analysis.completionInsights}
          color="bg-gradient-to-br from-green-500 to-green-600"
          delay={0.2}
        />

        {analysis.failureReasons.length > 0 && (
          <InsightCard
            title="Blockers Identified"
            icon={XCircle}
            items={analysis.failureReasons}
            color="bg-gradient-to-br from-red-500 to-red-600"
            delay={0.3}
          />
        )}

        <InsightCard
          title="Recommendations"
          icon={Lightbulb}
          items={analysis.recommendations}
          color="bg-gradient-to-br from-purple-500 to-purple-600"
          delay={0.4}
        />
      </div>

      {/* Info Box */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="glass rounded-xl p-6 bg-gradient-to-r from-purple-50 to-pink-50"
      >
        <div className="flex items-start gap-3">
          <Sparkles className="text-purple-600 mt-1" size={20} />
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">How it works</h4>
            <p className="text-gray-600 text-sm">
              Our AI analyzes your task completion patterns, priorities, and behaviors to provide
              personalized insights. The analysis uses advanced machine learning to identify what
              you're doing well and where you can improve your productivity. Click "Refresh" to get
              updated insights based on your latest tasks.
            </p>
            <p className="text-gray-500 text-xs mt-2">
              Powered by Groq API with Llama 3.3 70B
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
