import {
    ChevronDownIcon,
    ChevronRightIcon,
    LightBulbIcon,
    QuestionMarkCircleIcon
} from '@heroicons/react/24/outline';
import React, { useState } from 'react';

interface GuideStep {
  id: string;
  title: string;
  description: string;
  tips?: string[];
  example?: string;
  bestPractices?: string[];
}

interface UserGuideProps {
  title: string;
  description: string;
  steps: GuideStep[];
  className?: string;
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

const UserGuide: React.FC<UserGuideProps> = ({
  title,
  description,
  steps,
  className = '',
  collapsible = true,
  defaultExpanded = false
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());

  const toggleStep = (stepId: string) => {
    const newExpanded = new Set(expandedSteps);
    if (newExpanded.has(stepId)) {
      newExpanded.delete(stepId);
    } else {
      newExpanded.add(stepId);
    }
    setExpandedSteps(newExpanded);
  };

  const expandAllSteps = () => {
    setExpandedSteps(new Set(steps.map(step => step.id)));
  };

  const collapseAllSteps = () => {
    setExpandedSteps(new Set());
  };

  if (collapsible && !isExpanded) {
    return (
      <div className={`bg-blue-50 border border-blue-200 rounded-lg p-4 ${className}`}>
        <button
          onClick={() => setIsExpanded(true)}
          className="flex items-center space-x-2 text-blue-700 hover:text-blue-800 font-medium"
        >
          <QuestionMarkCircleIcon className="h-5 w-5" />
          <span>{title}</span>
          <ChevronRightIcon className="h-4 w-4" />
        </button>
        <p className="text-sm text-blue-600 mt-1">{description}</p>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <QuestionMarkCircleIcon className="h-6 w-6 text-blue-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              <p className="text-sm text-gray-600">{description}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {steps.length > 1 && (
              <>
                <button
                  onClick={expandAllSteps}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  Expand All
                </button>
                <span className="text-gray-300">|</span>
                <button
                  onClick={collapseAllSteps}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  Collapse All
                </button>
              </>
            )}
            
            {collapsible && (
              <button
                onClick={() => setIsExpanded(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <ChevronDownIcon className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className="divide-y divide-gray-200">
        {steps.map((step, index) => {
          const isStepExpanded = expandedSteps.has(step.id);
          
          return (
            <div key={step.id} className="p-4">
              <button
                onClick={() => toggleStep(step.id)}
                className="flex items-center justify-between w-full text-left"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-semibold">
                    {index + 1}
                  </div>
                  <h4 className="font-medium text-gray-900">{step.title}</h4>
                </div>
                
                {isStepExpanded ? (
                  <ChevronDownIcon className="h-4 w-4 text-gray-400" />
                ) : (
                  <ChevronRightIcon className="h-4 w-4 text-gray-400" />
                )}
              </button>

              {isStepExpanded && (
                <div className="mt-4 ml-9 space-y-4">
                  {/* Description */}
                  <p className="text-gray-700">{step.description}</p>

                  {/* Example */}
                  {step.example && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <h5 className="text-sm font-semibold text-gray-900 mb-2">Example:</h5>
                      <p className="text-sm text-gray-700 italic">"{step.example}"</p>
                    </div>
                  )}

                  {/* Tips */}
                  {step.tips && step.tips.length > 0 && (
                    <div className="bg-yellow-50 p-3 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <LightBulbIcon className="h-4 w-4 text-yellow-600" />
                        <h5 className="text-sm font-semibold text-yellow-900">Tips:</h5>
                      </div>
                      <ul className="list-disc list-inside space-y-1">
                        {step.tips.map((tip, tipIndex) => (
                          <li key={tipIndex} className="text-sm text-yellow-800">{tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Best Practices */}
                  {step.bestPractices && step.bestPractices.length > 0 && (
                    <div className="bg-green-50 p-3 rounded-lg">
                      <h5 className="text-sm font-semibold text-green-900 mb-2">Best Practices:</h5>
                      <ul className="list-disc list-inside space-y-1">
                        {step.bestPractices.map((practice, practiceIndex) => (
                          <li key={practiceIndex} className="text-sm text-green-800">{practice}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Specialized guide components for different analysis types
export const GeographicAnalysisGuide: React.FC<{ className?: string }> = ({ className }) => {
  const steps: GuideStep[] = [
    {
      id: 'overview',
      title: 'Start with National Overview',
      description: 'Begin your analysis by examining the Nigeria-wide sentiment choropleth map to identify regional patterns and hotspots.',
      tips: [
        'Look for color intensity patterns across regions',
        'Identify states with extreme positive or negative sentiment',
        'Note data coverage gaps (gray areas)'
      ],
      example: 'Lagos shows strong positive sentiment (green), while some northern states show mixed patterns',
      bestPractices: [
        'Always check data point counts for statistical significance',
        'Compare similar population sizes when making regional comparisons',
        'Consider cultural and economic contexts when interpreting results'
      ]
    },
    {
      id: 'drill-down',
      title: 'Drill Down to State Level',
      description: 'Click on states of interest to explore LGA-level sentiment distribution and identify local variations.',
      tips: [
        'Use the state selector to focus on specific regions',
        'Compare urban vs rural LGA patterns',
        'Look for administrative boundary effects'
      ],
      example: 'In Lagos State, mainland LGAs may show different sentiment patterns than island LGAs',
      bestPractices: [
        'Validate findings across multiple administrative levels',
        'Consider population density when interpreting LGA data',
        'Cross-reference with demographic data for deeper insights'
      ]
    },
    {
      id: 'temporal',
      title: 'Analyze Temporal Patterns',
      description: 'Use the timeline view to understand how geographic sentiment changes over time and identify trend patterns.',
      tips: [
        'Look for seasonal variations in different regions',
        'Identify event-driven sentiment spikes',
        'Compare regional response timing to national events'
      ],
      example: 'Southern regions may show faster response to economic policy announcements',
      bestPractices: [
        'Align temporal analysis with known political events',
        'Consider time zone differences for real-time analysis',
        'Look for leading and lagging regional indicators'
      ]
    },
    {
      id: 'comparison',
      title: 'Regional Comparison Analysis',
      description: 'Use the comparison charts to systematically compare sentiment metrics across Nigeria\'s six geopolitical zones.',
      tips: [
        'Focus on relative differences rather than absolute values',
        'Consider population weighting for fair comparisons',
        'Look for consistent patterns across similar regions'
      ],
      example: 'South West consistently shows higher positive sentiment than North East across multiple time periods',
      bestPractices: [
        'Account for cultural and linguistic differences',
        'Consider economic development levels in interpretation',
        'Validate patterns with demographic cross-analysis'
      ]
    }
  ];

  return (
    <UserGuide
      title="Geographic Analysis Guide"
      description="Learn how to effectively analyze political sentiment across Nigeria's administrative hierarchy"
      steps={steps}
      className={className}
      defaultExpanded={false}
    />
  );
};

export const DemographicAnalysisGuide: React.FC<{ className?: string }> = ({ className }) => {
  const steps: GuideStep[] = [
    {
      id: 'segments',
      title: 'Identify Key Demographic Segments',
      description: 'Start by examining the demographic matrix to identify which population segments show distinct sentiment patterns.',
      tips: [
        'Focus on segments with sufficient sample sizes',
        'Look for unexpected demographic-sentiment correlations',
        'Pay attention to confidence scores for each classification'
      ],
      example: 'University-educated youth (18-25) in technology sector may show different patterns than rural farmers',
      bestPractices: [
        'Always validate demographic inferences with confidence thresholds',
        'Consider intersectional analysis (age + education + occupation)',
        'Respect privacy settings and consent preferences'
      ]
    },
    {
      id: 'education',
      title: 'Analyze Education Impact',
      description: 'Examine how educational attainment correlates with political sentiment and engagement patterns.',
      tips: [
        'Compare sentiment intensity across education levels',
        'Look for topic preferences by education group',
        'Consider regional education distribution effects'
      ],
      example: 'Postgraduate degree holders may show more nuanced sentiment on economic policies',
      bestPractices: [
        'Account for regional education access disparities',
        'Consider age cohort effects on education levels',
        'Cross-reference with occupation data for validation'
      ]
    },
    {
      id: 'occupation',
      title: 'Examine Occupational Patterns',
      description: 'Analyze how different professional sectors respond to political messages and policy announcements.',
      tips: [
        'Group related occupations for stronger statistical power',
        'Look for sector-specific policy responses',
        'Consider economic cycle impacts on occupational sentiment'
      ],
      example: 'Public sector workers may respond differently to civil service reform discussions',
      bestPractices: [
        'Validate occupational classifications with confidence scores',
        'Consider informal economy representation',
        'Account for regional economic variations'
      ]
    },
    {
      id: 'generational',
      title: 'Generational Analysis',
      description: 'Compare sentiment patterns across age groups to understand generational political differences.',
      tips: [
        'Look for consistent generational patterns across topics',
        'Consider life stage effects vs. generational effects',
        'Examine social media usage patterns by age group'
      ],
      example: 'Gen Z (18-25) may show higher engagement on climate and technology policies',
      bestPractices: [
        'Account for digital divide effects on data representation',
        'Consider cultural factors affecting age-based political views',
        'Validate findings across multiple time periods'
      ]
    }
  ];

  return (
    <UserGuide
      title="Demographic Analysis Guide"
      description="Master demographic sentiment analysis while respecting privacy and data quality standards"
      steps={steps}
      className={className}
      defaultExpanded={false}
    />
  );
};

export const SentimentAnalysisGuide: React.FC<{ className?: string }> = ({ className }) => {
  const steps: GuideStep[] = [
    {
      id: 'polarity',
      title: 'Understand Polarity Classification',
      description: 'Start with basic positive/negative/neutral classification before diving into emotional nuances.',
      tips: [
        'Check model agreement scores for reliability',
        'Look for temporal polarity shifts',
        'Consider context when interpreting neutral sentiment'
      ],
      example: 'High negative sentiment with low model agreement may indicate sarcasm or complex emotions',
      bestPractices: [
        'Always consider confidence scores in interpretation',
        'Cross-validate with human annotation samples',
        'Account for cultural context in sentiment expression'
      ]
    },
    {
      id: 'emotions',
      title: 'Analyze Emotional Layers',
      description: 'Examine the emotional composition beyond simple polarity to understand the full sentiment spectrum.',
      tips: [
        'Look for dominant emotion patterns by topic',
        'Identify mixed emotional responses',
        'Track emotional intensity over time'
      ],
      example: 'Economic policy discussions may show fear + anger combination rather than simple negative sentiment',
      bestPractices: [
        'Consider cultural expressions of emotions',
        'Validate emotion detection with context',
        'Account for linguistic variations in emotional expression'
      ]
    },
    {
      id: 'intensity',
      title: 'Measure Sentiment Intensity',
      description: 'Analyze not just the direction but the strength of sentiment to understand engagement depth.',
      tips: [
        'Compare intensity across different topics',
        'Look for intensity spikes during events',
        'Consider intensity vs. volume relationships'
      ],
      example: 'Mild positive sentiment with high volume may indicate broad but shallow support',
      bestPractices: [
        'Normalize intensity scores across different content types',
        'Consider platform-specific intensity expressions',
        'Account for cultural communication styles'
      ]
    },
    {
      id: 'complexity',
      title: 'Handle Complex Sentiment',
      description: 'Identify and properly interpret sarcasm, mixed sentiments, and conditional statements.',
      tips: [
        'Flag low model agreement for manual review',
        'Look for complexity patterns by demographic',
        'Consider context clues for sarcasm detection'
      ],
      example: '"Great job on the economy!" with high sarcasm probability indicates negative sentiment',
      bestPractices: [
        'Maintain separate analysis tracks for complex sentiment',
        'Use human validation for ambiguous cases',
        'Document complexity handling methodology'
      ]
    }
  ];

  return (
    <UserGuide
      title="Advanced Sentiment Analysis Guide"
      description="Navigate multi-layered sentiment analysis with confidence and accuracy"
      steps={steps}
      className={className}
      defaultExpanded={false}
    />
  );
};

export default UserGuide;