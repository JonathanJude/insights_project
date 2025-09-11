import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { POLITICAL_PARTIES } from '../../constants';
import { usePageTitle } from '../../hooks/usePageTitle';
import { getSentimentColor, getSentimentLabel } from '../../lib/sentimentUtils';
import { politicianService } from '../../services/politician-service';
import type { PoliticalParty } from '../../types';

const PartyDetail: React.FC = () => {
  const { partyId } = useParams<{ partyId: string }>();
  const [selectedView, setSelectedView] = useState<'overview' | 'politicians' | 'analytics'>('overview');
  const [partyPoliticians, setPartyPoliticians] = useState<any[]>([]);

  // Find party information
  const party = POLITICAL_PARTIES.find(p => p.value === partyId);

  React.useEffect(() => {
    const loadPartyPoliticians = async () => {
      if (!partyId) return;
      
      try {
        const allPoliticians = await politicianService.getAllPoliticians();
        const filteredPoliticians = allPoliticians.filter(p => p.party === partyId);
        setPartyPoliticians(filteredPoliticians);
      } catch (error) {
        console.error('Error loading party politicians:', error);
      }
    };
    loadPartyPoliticians();
  }, [partyId]);

  usePageTitle(party ? `${party.label} - Party Analysis` : 'Party Analysis');

  if (!party) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Party Not Found</h1>
          <p className="text-gray-600 mb-4">The requested party could not be found.</p>
          <Link
            to="/party"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Back to Party Analytics
          </Link>
        </div>
      </div>
    );
  }

  // Generate party analytics data
  const generatePartyAnalytics = () => {
    const sentimentData = [
      { month: 'Jan', sentiment: Math.random() * 2 - 1, mentions: Math.floor(Math.random() * 5000) + 1000 },
      { month: 'Feb', sentiment: Math.random() * 2 - 1, mentions: Math.floor(Math.random() * 5000) + 1000 },
      { month: 'Mar', sentiment: Math.random() * 2 - 1, mentions: Math.floor(Math.random() * 5000) + 1000 },
      { month: 'Apr', sentiment: Math.random() * 2 - 1, mentions: Math.floor(Math.random() * 5000) + 1000 },
      { month: 'May', sentiment: Math.random() * 2 - 1, mentions: Math.floor(Math.random() * 5000) + 1000 },
      { month: 'Jun', sentiment: Math.random() * 2 - 1, mentions: Math.floor(Math.random() * 5000) + 1000 }
    ];

    const positionBreakdown = [
      { position: 'President', count: partyPoliticians.filter(p => p.position === 'president').length, color: '#3B82F6' },
      { position: 'Governor', count: partyPoliticians.filter(p => p.position === 'governor').length, color: '#10B981' },
      { position: 'Senator', count: partyPoliticians.filter(p => p.position === 'senator').length, color: '#F59E0B' },
      { position: 'House Rep', count: partyPoliticians.filter(p => p.position === 'house_rep').length, color: '#EF4444' },
      { position: 'Other', count: partyPoliticians.filter(p => !['president', 'governor', 'senator', 'house_rep'].includes(p.position)).length, color: '#8B5CF6' }
    ].filter(item => item.count > 0);

    return { sentimentData, positionBreakdown };
  };

  const { sentimentData, positionBreakdown } = generatePartyAnalytics();

  // Calculate party statistics
  const totalPoliticians = partyPoliticians.length;
  const avgSentiment = partyPoliticians.reduce((sum, p) => sum + (p.recentSentiment?.score || 0), 0) / totalPoliticians;
  const totalMentions = partyPoliticians.reduce((sum, p) => sum + (p.recentSentiment?.mentionCount || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex mb-6" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-4">
          <li>
            <Link to="/" className="text-gray-400 hover:text-gray-500 transition-colors">
              Dashboard
            </Link>
          </li>
          <li>
            <svg className="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 111.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </li>
          <li>
            <Link to="/party" className="text-gray-400 hover:text-gray-500 transition-colors">
              Party Analytics
            </Link>
          </li>
          <li>
            <svg className="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 111.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </li>
          <li>
            <span className="text-gray-500 font-medium">{party.label}</span>
          </li>
        </ol>
      </nav>

      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex items-center space-x-4">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl"
            style={{ backgroundColor: party.color }}
          >
            {party.label}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{party.fullName}</h1>
            <p className="text-lg text-gray-600">{party.label}</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-blue-900">Total Politicians</h3>
            <p className="text-2xl font-bold text-blue-700">{totalPoliticians}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-medium text-green-900">Avg Sentiment</h3>
            <p className="text-2xl font-bold text-green-700">{avgSentiment.toFixed(2)}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-medium text-purple-900">Total Mentions</h3>
            <p className="text-2xl font-bold text-purple-700">{totalMentions.toLocaleString()}</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="font-medium text-yellow-900">Sentiment Trend</h3>
            <p className="text-2xl font-bold text-yellow-700">
              {avgSentiment > 0 ? '📈' : avgSentiment < 0 ? '📉' : '➡️'}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview', icon: '📊' },
              { id: 'politicians', label: 'Politicians', icon: '👥' },
              { id: 'analytics', label: 'Analytics', icon: '🔍' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedView(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${selectedView === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content based on selected view */}
      {selectedView === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Sentiment Trend */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Sentiment Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={sentimentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[-1, 1]} />
                <Tooltip />
                <Line type="monotone" dataKey="sentiment" stroke={party.color} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Position Breakdown */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Position Breakdown</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={positionBreakdown}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="count"
                  label={({ position, count }) => `${position}: ${count}`}
                >
                  {positionBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {selectedView === 'politicians' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            All {party.label} Politicians ({totalPoliticians})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {partyPoliticians.map((politician) => (
              <Link
                key={politician.id}
                to={`/politician/${politician.id}`}
                className="group p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600">
                        {politician.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 group-hover:text-blue-600 truncate">
                      {politician.name}
                    </h4>
                    <p className="text-sm text-gray-500 truncate">{politician.position}</p>
                    <p className="text-sm text-gray-500">{politician.state}</p>
                    <div className="flex items-center mt-1">
                      <span
                        className="text-xs font-medium px-2 py-1 rounded-full"
                        style={{
                          backgroundColor: getSentimentColor(politician.recentSentiment?.score || 0) + '20',
                          color: getSentimentColor(politician.recentSentiment?.score || 0)
                        }}
                      >
                        {getSentimentLabel(politician.recentSentiment?.score || 0)}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {selectedView === 'analytics' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            🔍 Advanced Analysis for {party.label}
          </h3>
          <p className="text-gray-600 mb-6">
            Explore comprehensive sentiment analysis across multiple dimensions for {party.fullName}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link
              to={`/analysis/geographic?party=${party.value}`}
              className="group p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <span className="text-2xl">🗺️</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 group-hover:text-blue-600">
                    Geographic Analysis
                  </h4>
                  <p className="text-sm text-gray-500">
                    {party.label} sentiment across states and regions
                  </p>
                </div>
              </div>
            </Link>

            <Link
              to={`/analysis/demographic?party=${party.value}`}
              className="group p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <span className="text-2xl">👥</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 group-hover:text-blue-600">
                    Demographic Insights
                  </h4>
                  <p className="text-sm text-gray-500">
                    Age, education, and occupation patterns
                  </p>
                </div>
              </div>
            </Link>

            <Link
              to={`/analysis/sentiment?party=${party.value}`}
              className="group p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <span className="text-2xl">💭</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 group-hover:text-blue-600">
                    Sentiment Deep Dive
                  </h4>
                  <p className="text-sm text-gray-500">
                    Emotion analysis and intensity mapping
                  </p>
                </div>
              </div>
            </Link>

            <Link
              to={`/analysis/topics?party=${party.value}`}
              className="group p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <span className="text-2xl">📊</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 group-hover:text-blue-600">
                    Topic Trends
                  </h4>
                  <p className="text-sm text-gray-500">
                    Policy areas and campaign issues
                  </p>
                </div>
              </div>
            </Link>

            <Link
              to={`/analysis/engagement?party=${party.value}`}
              className="group p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <span className="text-2xl">🚀</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 group-hover:text-blue-600">
                    Engagement Patterns
                  </h4>
                  <p className="text-sm text-gray-500">
                    Virality and influence networks
                  </p>
                </div>
              </div>
            </Link>

            <Link
              to={`/analysis/temporal?party=${party.value}`}
              className="group p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <span className="text-2xl">⏰</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 group-hover:text-blue-600">
                    Time Analysis
                  </h4>
                  <p className="text-sm text-gray-500">
                    Temporal patterns and trends
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default PartyDetail;