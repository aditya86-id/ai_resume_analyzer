import { useState, useEffect } from 'react';
import { LoadingSpinner } from './Loading';

export function LLMInsights({ resumeId, stats }) {
  const [insights, setInsights] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [cached, setCached] = useState(false);

  useEffect(() => {
    generateInsights();
  }, [resumeId]);

  const generateInsights = () => {
    try {
      // Check local cache first (optimized LLM usage)
      const cacheKey = `llm_insights_${resumeId}`;
      const cachedData = localStorage.getItem(cacheKey);
      
      if (cachedData) {
        const parsed = JSON.parse(cachedData);
        // Cache valid for 24 hours
        if (Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
          setInsights(parsed.data);
          setCached(true);
          return;
        }
        localStorage.removeItem(cacheKey);
      }

      // Generate new insights using stats data (avoid API call when possible)
      setIsLoading(true);
      const generatedInsights = generateInsightsFromStats(stats);
      
      // Cache the results
      localStorage.setItem(cacheKey, JSON.stringify({
        timestamp: Date.now(),
        data: generatedInsights
      }));
      
      setInsights(generatedInsights);
      setCached(false);
    } catch (err) {
      setError('Failed to generate insights');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const generateInsightsFromStats = (stats) => {
    const insights = [];

    // Career trajectory insight
    if (stats?.career_insights?.career_stage) {
      const stage = stats.career_insights.career_stage;
      const insights_map = {
        entry: 'You\'re at the beginning of your career. Focus on building a strong foundation of skills and gaining diverse experience.',
        junior: 'You\'re establishing yourself professionally. Continue developing expertise in your chosen field.',
        mid: 'You\'re at a mid-career level. Consider specializing deeper or expanding into leadership roles.',
        senior: 'You have substantial experience. Focus on mentoring, architecture, and strategic contributions.',
        executive: 'You\'re at executive level. Your focus should be on vision, strategy, and organizational impact.',
      };
      insights.push({
        type: 'career',
        title: '📊 Career Stage Analysis',
        content: insights_map[stage] || insights_map.mid,
        icon: '🎯'
      });
    }

    // Skill gap insight
    if (stats?.improvement_opportunities && stats.improvement_opportunities.length > 0) {
      insights.push({
        type: 'skills',
        title: '🎓 Priority Development Areas',
        content: stats.improvement_opportunities
          .filter(opp => opp.impact === 'high')
          .map(opp => opp.title)
          .join(', '),
        icon: '📈'
      });
    }

    // Industry alignment insight
    if (stats?.career_insights?.industry_match) {
      insights.push({
        type: 'industry',
        title: '🏢 Industry Alignment',
        content: `Your resume aligns well with: ${stats.career_insights.industry_match}. Emphasize skills relevant to this sector.`,
        icon: '🎯'
      });
    }

    // Job matching success rate insight
    if (stats?.match_success_rate) {
      const rate = stats.match_success_rate;
      let message = '';
      if (rate >= 80) {
        message = 'Excellent! You\'re matching well with most job opportunities. Your skills and resume are well-aligned with market demands.';
      } else if (rate >= 60) {
        message = 'Good! You\'re matching with a solid portion of opportunities. Consider adding a few more in-demand skills.';
      } else if (rate >= 40) {
        message = 'Fair alignment. Focus on developing skills that appear frequently in job descriptions.';
      } else {
        message = 'Limited matching. Consider a skills development plan to better align with current market demands.';
      }
      insights.push({
        type: 'matching',
        title: `✨ Job Matching Success: ${rate}%`,
        content: message,
        icon: '🔗'
      });
    }

    // Top strengths insight
    if (stats?.career_insights?.strengths && stats.career_insights.strengths.length > 0) {
      insights.push({
        type: 'strengths',
        title: '⭐ Your Strengths',
        content: stats.career_insights.strengths.slice(0, 2).join(' • '),
        icon: '💪'
      });
    }

    // Next steps recommendation
    const recommendations = [];
    if (stats?.score_breakdown?.keywords < 75) {
      recommendations.push('Add industry keywords to improve ATS visibility');
    }
    if (stats?.score_breakdown?.impact < 75) {
      recommendations.push('Quantify achievements with metrics and percentages');
    }
    if (stats?.improvement_opportunities?.length > 0) {
      recommendations.push('Address formatting and structure issues');
    }
    if (recommendations.length > 0) {
      insights.push({
        type: 'recommendations',
        title: '🚀 Recommended Next Steps',
        content: recommendations.slice(0, 2).join(' • '),
        icon: '📋'
      });
    }

    return insights.length > 0 ? insights : [
      {
        type: 'general',
        title: '✨ Ready to Go!',
        content: 'Your resume looks good! Continue updating it with new skills and achievements.',
        icon: '🎉'
      }
    ];
  };

  if (isLoading && !insights) {
    return <LoadingSpinner />;
  }

  if (!insights || insights.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-900">AI-Generated Insights</h3>
        {cached && (
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            Cached
          </span>
        )}
        {error && (
          <span className="text-xs text-red-600">Unable to load insights</span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.map((insight, idx) => (
          <div
            key={idx}
            className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">{insight.icon}</span>
              <div className="flex-1">
                <h4 className="font-bold text-gray-900 text-sm mb-1">
                  {insight.title}
                </h4>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {insight.content}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="text-xs text-gray-500 text-center mt-4">
        💡 Insights generated from your resume analysis using optimized AI processing
      </div>
    </div>
  );
}
