import {
    BookOpenIcon,
    ChartBarIcon,
    Cog6ToothIcon,
    EyeIcon,
    InformationCircleIcon,
    LightBulbIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import React, { useState } from 'react';

interface DocumentationSection {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  content: React.ReactNode;
  category: 'overview' | 'features' | 'usage' | 'tips' | 'troubleshooting';
}

interface FeatureDocumentationProps {
  feature: 'geographic' | 'demographic' | 'sentiment' | 'topics' | 'engagement' | 'temporal' | 'filters';
  embedded?: boolean;
  className?: string;
}

const FeatureDocumentation: React.FC<FeatureDocumentationProps> = ({
  feature,
  embedded = true,
  className = ''
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('overview');
  const [isExpanded, setIsExpanded] = useState(false);

  const getDocumentationSections = (feature: string): DocumentationSection[] => {
    switch (feature) {
      case 'geographic':
        return [
          {
            id: 'geo-overview',
            title: 'Geographic Analysis Overview',
            icon: InformationCircleIcon,
            category: 'overview',
            content: (
              <div className="space-y-3">
                <p className="text-gray-700">
                  Analyze political sentiment across Nigeria's administrative hierarchy from national to polling unit level.
                </p>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Administrative Levels:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>🇳🇬 <strong>Country:</strong> National overview (Nigeria)</li>
                    <li>🏛️ <strong>State:</strong> 36 states + FCT analysis</li>
                    <li>🏘️ <strong>LGA:</strong> 774 Local Government Areas</li>
                    <li>🗳️ <strong>Ward:</strong> ~8,800 electoral wards</li>
                    <li>📍 <strong>Polling Unit:</strong> ~176,000 polling units</li>
                  </ul>
                </div>
              </div>
            )
          },
          {
            id: 'geo-features',
            title: 'Visualization Features',
            icon: ChartBarIcon,
            category: 'features',
            content: (
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="border border-gray-200 rounded-lg p-3">
                    <h4 className="font-semibold text-gray-900 mb-2">🗺️ Choropleth Maps</h4>
                    <p className="text-sm text-gray-700">Color-coded sentiment intensity across administrative boundaries</p>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-3">
                    <h4 className="font-semibold text-gray-900 mb-2">🌳 Tree Maps</h4>
                    <p className="text-sm text-gray-700">Hierarchical visualization showing nested administrative levels</p>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-3">
                    <h4 className="font-semibold text-gray-900 mb-2">📊 Regional Comparisons</h4>
                    <p className="text-sm text-gray-700">Side-by-side analysis of Nigeria's six geopolitical zones</p>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-3">
                    <h4 className="font-semibold text-gray-900 mb-2">📈 Timeline Charts</h4>
                    <p className="text-sm text-gray-700">Geographic sentiment trends over time</p>
                  </div>
                </div>
              </div>
            )
          },
          {
            id: 'geo-usage',
            title: 'How to Use',
            icon: Cog6ToothIcon,
            category: 'usage',
            content: (
              <div className="space-y-3">
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-900">Step-by-Step Usage:</h4>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                    <li>Start with the <strong>Choropleth</strong> view for national overview</li>
                    <li>Click on states to drill down to LGA-level analysis</li>
                    <li>Use the <strong>State selector</strong> to focus on specific regions</li>
                    <li>Switch to <strong>Timeline</strong> view to see temporal patterns</li>
                    <li>Compare regions using the <strong>Comparison</strong> charts</li>
                  </ol>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Navigation Breadcrumbs:</h4>
                  <p className="text-sm text-gray-700">
                    Use the breadcrumb navigation (Nigeria → Lagos → Ikeja LGA → Ward 01) to move between administrative levels.
                  </p>
                </div>
              </div>
            )
          },
          {
            id: 'geo-tips',
            title: 'Analysis Tips',
            icon: LightBulbIcon,
            category: 'tips',
            content: (
              <div className="space-y-3">
                <div className="bg-yellow-50 p-3 rounded-lg">
                  <h4 className="font-semibold text-yellow-900 mb-2">💡 Pro Tips:</h4>
                  <ul className="list-disc list-inside text-sm text-yellow-800 space-y-1">
                    <li>Compare similar population sizes for meaningful insights</li>
                    <li>Check data point counts before drawing conclusions</li>
                    <li>Consider cultural and economic contexts in interpretation</li>
                    <li>Use confidence scores to validate geographic classifications</li>
                    <li>Cross-reference with demographic data for deeper insights</li>
                  </ul>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-2">✅ Best Practices:</h4>
                  <ul className="list-disc list-inside text-sm text-green-800 space-y-1">
                    <li>Start broad (state-level) then drill down to specifics</li>
                    <li>Validate patterns across multiple administrative levels</li>
                    <li>Account for population density in rural vs urban areas</li>
                    <li>Consider time zone effects for real-time analysis</li>
                  </ul>
                </div>
              </div>
            )
          }
        ];

      case 'demographic':
        return [
          {
            id: 'demo-overview',
            title: 'Demographic Analysis Overview',
            icon: InformationCircleIcon,
            category: 'overview',
            content: (
              <div className="space-y-3">
                <p className="text-gray-700">
                  Understand how different demographic groups respond to political messages with privacy-first analysis.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <h4 className="font-semibold text-purple-900 mb-2">📚 Education</h4>
                    <ul className="text-xs text-purple-800 space-y-1">
                      <li>• Primary Education</li>
                      <li>• Secondary Education</li>
                      <li>• Tertiary Education</li>
                      <li>• Postgraduate</li>
                    </ul>
                  </div>
                  <div className="bg-indigo-50 p-3 rounded-lg">
                    <h4 className="font-semibold text-indigo-900 mb-2">💼 Occupation</h4>
                    <ul className="text-xs text-indigo-800 space-y-1">
                      <li>• Public Sector</li>
                      <li>• Private Sector</li>
                      <li>• Technology</li>
                      <li>• Agriculture</li>
                    </ul>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">👥 Age Groups</h4>
                    <ul className="text-xs text-blue-800 space-y-1">
                      <li>• 18-25 (Youth)</li>
                      <li>• 26-35 (Young Adults)</li>
                      <li>• 36-45 (Middle Age)</li>
                      <li>• 46+ (Mature)</li>
                    </ul>
                  </div>
                  <div className="bg-teal-50 p-3 rounded-lg">
                    <h4 className="font-semibold text-teal-900 mb-2">⚧ Gender</h4>
                    <ul className="text-xs text-teal-800 space-y-1">
                      <li>• Male</li>
                      <li>• Female</li>
                      <li>• Non-Binary</li>
                      <li>• Undefined</li>
                    </ul>
                  </div>
                </div>
              </div>
            )
          },
          {
            id: 'demo-features',
            title: 'Analysis Features',
            icon: ChartBarIcon,
            category: 'features',
            content: (
              <div className="space-y-3">
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-900">Visualization Types:</h4>
                  <div className="grid grid-cols-1 gap-2">
                    <div className="flex items-center space-x-2 text-sm">
                      <span className="w-2 h-2 bg-purple-500 rounded"></span>
                      <span><strong>Demographic Matrix:</strong> Cross-tabulated sentiment by demographic segments</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <span className="w-2 h-2 bg-blue-500 rounded"></span>
                      <span><strong>Radar Charts:</strong> Multi-dimensional demographic profiles</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <span className="w-2 h-2 bg-green-500 rounded"></span>
                      <span><strong>Heatmaps:</strong> Intensity visualization across demographic intersections</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <span className="w-2 h-2 bg-orange-500 rounded"></span>
                      <span><strong>Trend Lines:</strong> Demographic sentiment evolution over time</span>
                    </div>
                  </div>
                </div>
                <div className="bg-red-50 p-3 rounded-lg">
                  <h4 className="font-semibold text-red-900 mb-2">🔒 Privacy Protection:</h4>
                  <p className="text-sm text-red-800">
                    All demographic inference requires explicit consent. Users can opt-out and data is anonymized appropriately.
                  </p>
                </div>
              </div>
            )
          }
        ];

      case 'sentiment':
        return [
          {
            id: 'sent-overview',
            title: 'Advanced Sentiment Analysis',
            icon: InformationCircleIcon,
            category: 'overview',
            content: (
              <div className="space-y-3">
                <p className="text-gray-700">
                  Multi-layered sentiment analysis that goes beyond simple positive/negative classification.
                </p>
                <div className="space-y-2">
                  <div className="border-l-4 border-green-500 pl-3">
                    <h4 className="font-semibold text-gray-900">Polarity Classification</h4>
                    <p className="text-sm text-gray-600">Positive, Negative, or Neutral with confidence scores</p>
                  </div>
                  <div className="border-l-4 border-blue-500 pl-3">
                    <h4 className="font-semibold text-gray-900">Emotion Detection</h4>
                    <p className="text-sm text-gray-600">Joy, Anger, Fear, Sadness, Disgust with intensity levels</p>
                  </div>
                  <div className="border-l-4 border-purple-500 pl-3">
                    <h4 className="font-semibold text-gray-900">Intensity Scaling</h4>
                    <p className="text-sm text-gray-600">Mild (0.1-0.4), Moderate (0.4-0.7), Strong (0.7-1.0)</p>
                  </div>
                  <div className="border-l-4 border-orange-500 pl-3">
                    <h4 className="font-semibold text-gray-900">Complexity Analysis</h4>
                    <p className="text-sm text-gray-600">Simple, Mixed, Sarcastic, or Conditional sentiment</p>
                  </div>
                </div>
              </div>
            )
          }
        ];

      default:
        return [];
    }
  };

  const sections = getDocumentationSections(feature);
  const categories = ['overview', 'features', 'usage', 'tips', 'troubleshooting'];
  const categoryLabels = {
    overview: 'Overview',
    features: 'Features',
    usage: 'How to Use',
    tips: 'Tips & Best Practices',
    troubleshooting: 'Troubleshooting'
  };

  const activeSections = sections.filter(section => section.category === activeCategory);

  if (embedded && !isExpanded) {
    return (
      <div className={`bg-blue-50 border border-blue-200 rounded-lg p-3 ${className}`}>
        <button
          onClick={() => setIsExpanded(true)}
          className="flex items-center space-x-2 text-blue-700 hover:text-blue-800 text-sm font-medium"
        >
          <BookOpenIcon className="h-4 w-4" />
          <span>View Documentation</span>
        </button>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <BookOpenIcon className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              {feature.charAt(0).toUpperCase() + feature.slice(1)} Analysis Documentation
            </h3>
          </div>
          
          {embedded && (
            <button
              onClick={() => setIsExpanded(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Category Tabs */}
        <div className="flex space-x-1 mt-3">
          {categories.map(category => {
            const hasContent = sections.some(section => section.category === category);
            if (!hasContent) return null;

            return (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  activeCategory === category
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {categoryLabels[category as keyof typeof categoryLabels]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {activeSections.map(section => {
          const Icon = section.icon;
          return (
            <div key={section.id} className="space-y-3">
              <div className="flex items-center space-x-2">
                <Icon className="h-5 w-5 text-gray-600" />
                <h4 className="font-semibold text-gray-900">{section.title}</h4>
              </div>
              <div className="ml-7">
                {section.content}
              </div>
            </div>
          );
        })}

        {activeSections.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <EyeIcon className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p>No documentation available for this category.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeatureDocumentation;