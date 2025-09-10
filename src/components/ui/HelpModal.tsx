import {
    BookOpenIcon,
    ChartBarIcon,
    GlobeAltIcon,
    InformationCircleIcon,
    MapIcon,
    UserGroupIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import React, { useState } from 'react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  topic?: 'overview' | 'geographic' | 'demographic' | 'sentiment' | 'topics' | 'engagement' | 'temporal' | 'filters';
}

interface HelpSection {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  content: React.ReactNode;
}

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose, topic = 'overview' }) => {
  const [activeSection, setActiveSection] = useState<string>(topic);

  const helpSections: HelpSection[] = [
    {
      id: 'overview',
      title: 'Multi-Dimensional Analysis Overview',
      icon: InformationCircleIcon,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            The Multi-Dimensional Sentiment Categorization System provides comprehensive analysis of political sentiment 
            across multiple dimensions including geography, demographics, topics, and time.
          </p>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Key Features:</h4>
            <ul className="list-disc list-inside space-y-1 text-blue-800">
              <li>Geographic analysis from country to polling unit level</li>
              <li>Demographic insights across education, occupation, age, and gender</li>
              <li>Advanced sentiment analysis with emotion detection</li>
              <li>Topic categorization and trending analysis</li>
              <li>Engagement pattern recognition</li>
              <li>Temporal pattern analysis</li>
            </ul>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <h4 className="font-semibold text-yellow-900 mb-2">Understanding Confidence Scores:</h4>
            <p className="text-yellow-800">
              All classifications include confidence scores (0-1) indicating data reliability. 
              Lower confidence scores suggest uncertain classifications that should be interpreted carefully.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'geographic',
      title: 'Geographic Analysis',
      icon: MapIcon,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            Analyze political sentiment across Nigeria's administrative hierarchy from national to local levels.
          </p>

          <div className="space-y-3">
            <div className="border-l-4 border-green-500 pl-4">
              <h4 className="font-semibold text-gray-900">Administrative Levels</h4>
              <ul className="list-disc list-inside text-gray-700 mt-2">
                <li><strong>Country:</strong> National-level sentiment overview</li>
                <li><strong>State:</strong> 36 states + FCT analysis</li>
                <li><strong>LGA:</strong> Local Government Area breakdown</li>
                <li><strong>Ward:</strong> Electoral ward-level insights</li>
                <li><strong>Polling Unit:</strong> Most granular analysis level</li>
              </ul>
            </div>

            <div className="border-l-4 border-blue-500 pl-4">
              <h4 className="font-semibold text-gray-900">Visualization Types</h4>
              <ul className="list-disc list-inside text-gray-700 mt-2">
                <li><strong>Choropleth Maps:</strong> Color-coded sentiment intensity</li>
                <li><strong>Tree Maps:</strong> Hierarchical data representation</li>
                <li><strong>Regional Comparisons:</strong> Cross-regional analysis</li>
                <li><strong>Timeline Charts:</strong> Geographic sentiment trends</li>
              </ul>
            </div>

            <div className="bg-gray-50 p-3 rounded">
              <h4 className="font-semibold text-gray-900 mb-2">Best Practices:</h4>
              <ul className="list-disc list-inside text-gray-700 text-sm">
                <li>Start with state-level analysis before drilling down</li>
                <li>Compare similar administrative levels for meaningful insights</li>
                <li>Consider population density when interpreting results</li>
                <li>Check confidence scores for data reliability</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'demographic',
      title: 'Demographic Analysis',
      icon: UserGroupIcon,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            Understand how different demographic groups respond to political messages and candidates.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded-lg p-3">
              <h4 className="font-semibold text-gray-900 mb-2">Education Levels</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Primary Education</li>
                <li>• Secondary Education</li>
                <li>• Tertiary Education</li>
                <li>• Postgraduate</li>
                <li>• Undefined (low confidence)</li>
              </ul>
            </div>

            <div className="border border-gray-200 rounded-lg p-3">
              <h4 className="font-semibold text-gray-900 mb-2">Occupation Sectors</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Public Sector</li>
                <li>• Private Sector</li>
                <li>• Technology</li>
                <li>• Agriculture</li>
                <li>• Self-Employed</li>
                <li>• Student</li>
                <li>• Professional Services</li>
              </ul>
            </div>

            <div className="border border-gray-200 rounded-lg p-3">
              <h4 className="font-semibold text-gray-900 mb-2">Age Groups</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• 18-25 (Youth)</li>
                <li>• 26-35 (Young Adults)</li>
                <li>• 36-45 (Middle Age)</li>
                <li>• 46-55 (Mature)</li>
                <li>• 56-65 (Senior)</li>
                <li>• 65+ (Elderly)</li>
              </ul>
            </div>

            <div className="border border-gray-200 rounded-lg p-3">
              <h4 className="font-semibold text-gray-900 mb-2">Gender Classification</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Male</li>
                <li>• Female</li>
                <li>• Non-Binary</li>
                <li>• Undefined</li>
              </ul>
            </div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="font-semibold text-purple-900 mb-2">Privacy & Ethics:</h4>
            <p className="text-purple-800 text-sm">
              Demographic inference is performed with explicit consent and privacy protection. 
              Users can opt-out of demographic analysis and all data is anonymized appropriately.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'sentiment',
      title: 'Advanced Sentiment Analysis',
      icon: ChartBarIcon,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            Multi-layered sentiment analysis that goes beyond simple positive/negative classification.
          </p>

          <div className="space-y-4">
            <div className="border-l-4 border-green-500 pl-4">
              <h4 className="font-semibold text-gray-900">Polarity Classification</h4>
              <div className="mt-2 space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span className="text-sm"><strong>Positive:</strong> Supportive, favorable sentiment</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded"></div>
                  <span className="text-sm"><strong>Negative:</strong> Critical, unfavorable sentiment</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-gray-500 rounded"></div>
                  <span className="text-sm"><strong>Neutral:</strong> Balanced or factual content</span>
                </div>
              </div>
            </div>

            <div className="border-l-4 border-blue-500 pl-4">
              <h4 className="font-semibold text-gray-900">Emotion Detection</h4>
              <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                <div>😊 <strong>Joy:</strong> Happiness, celebration</div>
                <div>😠 <strong>Anger:</strong> Frustration, outrage</div>
                <div>😨 <strong>Fear:</strong> Anxiety, concern</div>
                <div>😢 <strong>Sadness:</strong> Disappointment, grief</div>
                <div>🤢 <strong>Disgust:</strong> Revulsion, contempt</div>
                <div>🤔 <strong>Mixed:</strong> Multiple emotions</div>
              </div>
            </div>

            <div className="border-l-4 border-purple-500 pl-4">
              <h4 className="font-semibold text-gray-900">Intensity Scaling</h4>
              <div className="space-y-1 mt-2 text-sm">
                <div><strong>Mild (0.1-0.4):</strong> Subtle sentiment expression</div>
                <div><strong>Moderate (0.4-0.7):</strong> Clear sentiment indication</div>
                <div><strong>Strong (0.7-1.0):</strong> Intense sentiment expression</div>
              </div>
            </div>

            <div className="border-l-4 border-orange-500 pl-4">
              <h4 className="font-semibold text-gray-900">Complexity Analysis</h4>
              <div className="space-y-1 mt-2 text-sm">
                <div><strong>Simple:</strong> Straightforward sentiment</div>
                <div><strong>Mixed:</strong> Multiple conflicting sentiments</div>
                <div><strong>Sarcastic:</strong> Ironic or satirical content</div>
                <div><strong>Conditional:</strong> Context-dependent sentiment</div>
              </div>
            </div>
          </div>

          <div className="bg-indigo-50 p-4 rounded-lg">
            <h4 className="font-semibold text-indigo-900 mb-2">Model Agreement:</h4>
            <p className="text-indigo-800 text-sm">
              Multiple AI models analyze each piece of content. High agreement scores (&gt;0.8) indicate 
              reliable classifications, while low scores suggest uncertain or complex content.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'topics',
      title: 'Topic & Theme Analysis',
      icon: BookOpenIcon,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            Categorize and track sentiment across specific political topics and themes.
          </p>

          <div className="space-y-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">Policy Areas</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>🏛️ Economy & Finance</div>
                <div>🛡️ Security & Defense</div>
                <div>⚖️ Anti-Corruption</div>
                <div>🎓 Education</div>
                <div>🏥 Healthcare</div>
                <div>🏗️ Infrastructure</div>
                <div>👥 Youth & Employment</div>
                <div>🌾 Agriculture</div>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">Campaign Issues</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>💰 Cost of Living</div>
                <div>⛽ Fuel Subsidy</div>
                <div>💵 Minimum Wage</div>
                <div>🗳️ Election Credibility</div>
                <div>🏛️ Governance Reform</div>
                <div>🌍 Climate Change</div>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">Event-Driven Topics</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>📢 Political Rallies</div>
                <div>✊ Protests & Demonstrations</div>
                <div>📰 Government Actions</div>
                <div>⚡ Breaking News Events</div>
                <div>🎤 Political Debates</div>
                <div>📊 Policy Announcements</div>
              </div>
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-semibold text-green-900 mb-2">Trending Analysis:</h4>
            <p className="text-green-800 text-sm">
              Topics are ranked by engagement velocity, sentiment intensity, and viral potential. 
              Trending scores help identify emerging political narratives and public concerns.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'engagement',
      title: 'Engagement Patterns',
      icon: ChartBarIcon,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            Analyze how content spreads, who amplifies it, and what drives political engagement.
          </p>

          <div className="space-y-4">
            <div className="border-l-4 border-red-500 pl-4">
              <h4 className="font-semibold text-gray-900">Engagement Levels</h4>
              <div className="space-y-2 mt-2">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded"></div>
                  <span className="text-sm"><strong>High:</strong> &gt;10K shares/retweets within 24 hours</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                  <span className="text-sm"><strong>Medium:</strong> 1K-10K shares with 100-1000 comments</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span className="text-sm"><strong>Low:</strong> &lt;1K shares with minimal comments</span>
                </div>
              </div>
            </div>

            <div className="border-l-4 border-purple-500 pl-4">
              <h4 className="font-semibold text-gray-900">Virality Metrics</h4>
              <ul className="list-disc list-inside text-sm text-gray-700 mt-2">
                <li>Share velocity (shares per hour)</li>
                <li>Amplification rate (retweets vs. original posts)</li>
                <li>Cross-platform spread</li>
                <li>Influencer pickup rate</li>
                <li>Geographic spread pattern</li>
              </ul>
            </div>

            <div className="border-l-4 border-blue-500 pl-4">
              <h4 className="font-semibold text-gray-900">Quality Indicators</h4>
              <ul className="list-disc list-inside text-sm text-gray-700 mt-2">
                <li>Source credibility score</li>
                <li>Fact-checking status</li>
                <li>Content authenticity</li>
                <li>Discussion quality (constructive vs. toxic)</li>
                <li>Information completeness</li>
              </ul>
            </div>

            <div className="border-l-4 border-indigo-500 pl-4">
              <h4 className="font-semibold text-gray-900">Influencer Analysis</h4>
              <ul className="list-disc list-inside text-sm text-gray-700 mt-2">
                <li>Verified accounts (&gt;100K followers)</li>
                <li>Political figures and officials</li>
                <li>Media personalities</li>
                <li>Subject matter experts</li>
                <li>Community leaders</li>
              </ul>
            </div>
          </div>

          <div className="bg-orange-50 p-4 rounded-lg">
            <h4 className="font-semibold text-orange-900 mb-2">Engagement Insights:</h4>
            <p className="text-orange-800 text-sm">
              High engagement doesn't always correlate with positive sentiment. Monitor both 
              engagement levels and sentiment polarity to understand true public reception.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'temporal',
      title: 'Temporal Analysis',
      icon: GlobeAltIcon,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            Understand how political sentiment varies across different time periods and cycles.
          </p>

          <div className="space-y-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">Daily Patterns</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>🌅 <strong>Morning (6AM-12PM):</strong> News consumption peak</div>
                <div>☀️ <strong>Afternoon (12PM-6PM):</strong> Work-hour discussions</div>
                <div>🌆 <strong>Evening (6PM-12AM):</strong> Social media activity peak</div>
                <div>🌙 <strong>Late Night (12AM-6AM):</strong> International audience</div>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">Weekly Cycles</h4>
              <div className="space-y-2 text-sm">
                <div><strong>Monday-Tuesday:</strong> Political announcements, policy discussions</div>
                <div><strong>Wednesday-Thursday:</strong> Peak political engagement</div>
                <div><strong>Friday:</strong> Week summary, analysis pieces</div>
                <div><strong>Weekend:</strong> Reduced political activity, social content</div>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">Election Cycles</h4>
              <div className="space-y-2 text-sm">
                <div>📅 <strong>Pre-Election (6+ months):</strong> Policy positioning, candidate announcements</div>
                <div>🗳️ <strong>Campaign Period (6 months-election):</strong> Intense political activity</div>
                <div>📊 <strong>Election Day:</strong> Real-time sentiment tracking</div>
                <div>📈 <strong>Post-Election (1-3 months):</strong> Result analysis, transition discussions</div>
              </div>
            </div>
          </div>

          <div className="bg-teal-50 p-4 rounded-lg">
            <h4 className="font-semibold text-teal-900 mb-2">Temporal Insights:</h4>
            <p className="text-teal-800 text-sm">
              Political sentiment often follows predictable patterns. Use temporal analysis to 
              identify optimal timing for political communications and predict sentiment shifts.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'filters',
      title: 'Advanced Filtering',
      icon: InformationCircleIcon,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            Learn how to use multi-dimensional filters effectively for precise analysis.
          </p>

          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Filter Combinations</h4>
              <p className="text-blue-800 text-sm mb-2">
                Combine multiple filter dimensions for targeted analysis:
              </p>
              <ul className="list-disc list-inside text-blue-800 text-sm space-y-1">
                <li>Geographic + Demographic: "Youth sentiment in Lagos State"</li>
                <li>Topic + Temporal: "Economy discussions during election period"</li>
                <li>Sentiment + Engagement: "High-engagement negative content"</li>
              </ul>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold text-green-900 mb-2">Confidence Thresholds</h4>
              <p className="text-green-800 text-sm mb-2">
                Adjust confidence thresholds to balance data completeness with reliability:
              </p>
              <ul className="list-disc list-inside text-green-800 text-sm space-y-1">
                <li><strong>High (0.8+):</strong> Most reliable, smaller dataset</li>
                <li><strong>Medium (0.6-0.8):</strong> Good balance of quality and quantity</li>
                <li><strong>Low (0.4-0.6):</strong> Larger dataset, interpret carefully</li>
              </ul>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="font-semibold text-yellow-900 mb-2">Filter Presets</h4>
              <p className="text-yellow-800 text-sm mb-2">
                Save commonly used filter combinations as presets:
              </p>
              <ul className="list-disc list-inside text-yellow-800 text-sm space-y-1">
                <li>"Youth Analysis" - Age 18-35, high engagement</li>
                <li>"Regional Comparison" - All states, medium confidence</li>
                <li>"Election Focus" - Election topics, high virality</li>
              </ul>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <h4 className="font-semibold text-purple-900 mb-2">Best Practices</h4>
              <ul className="list-disc list-inside text-purple-800 text-sm space-y-1">
                <li>Start with broad filters, then narrow down</li>
                <li>Always check sample sizes for statistical significance</li>
                <li>Compare filtered results with baseline data</li>
                <li>Document filter combinations for reproducible analysis</li>
                <li>Consider temporal context when interpreting results</li>
              </ul>
            </div>
          </div>
        </div>
      )
    }
  ];

  const currentSection = helpSections.find(section => section.id === activeSection) || helpSections[0];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-4xl transform overflow-hidden rounded-lg bg-white shadow-xl transition-all">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <div className="flex items-center space-x-3">
              <BookOpenIcon className="h-6 w-6 text-blue-600" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Multi-Dimensional Analysis Help
                </h2>
                <p className="text-sm text-gray-600">
                  Comprehensive guide to advanced political sentiment analysis
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-md p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Close help modal"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex">
            {/* Sidebar Navigation */}
            <div className="w-64 border-r border-gray-200 bg-gray-50">
              <nav className="p-4 space-y-1">
                {helpSections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 text-left text-sm font-medium rounded-md transition-colors ${
                        activeSection === section.id
                          ? 'bg-blue-100 text-blue-700 border border-blue-200'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{section.title}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-6 max-h-96 overflow-y-auto">
              <div className="flex items-center space-x-3 mb-4">
                <currentSection.icon className="h-6 w-6 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  {currentSection.title}
                </h3>
              </div>
              
              <div className="prose prose-sm max-w-none">
                {currentSection.content}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Need more help? Check our comprehensive documentation or contact support.
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpModal;