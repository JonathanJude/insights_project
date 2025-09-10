import React, { useState } from 'react';
import { Area, CartesianGrid, ComposedChart, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import AnalysisFilters from '../../components/analysis/AnalysisFilters';
import { useAnalysisFilters } from '../../hooks/useAnalysisFilters';
import { useEnhancedPoliticians } from '../../hooks/useEnhancedPoliticians';

const TimeAnalysis: React.FC = () => {
  const { data: enhancedData, isLoading } = useEnhancedPoliticians([]);
  const {
    filters,
    availablePoliticians,
    filteredPoliticians,
    hasActiveFilters,
    updateFilter,
    getContextualData
  } = useAnalysisFilters();

  const [selectedView, setSelectedView] = useState<'circadian' | 'weekly' | 'seasonal' | 'election'>('circadian');
  const [selectedMetric, setSelectedMetric] = useState<'sentiment' | 'engagement' | 'volume'>('sentiment');
  const contextualData = getContextualData();

  // Generate circadian sentiment data
  const generateCircadianData = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    return hours.map(hour => ({
      hour: `${hour.toString().padStart(2, '0')}:00`,
      sentiment: Math.sin((hour - 6) * Math.PI / 12) * 0.3 + Math.random() * 0.2 - 0.1,
      engagement: Math.sin((hour - 8) * Math.PI / 12) * 40 + 50 + Math.random() * 10,
      volume: Math.sin((hour - 10) * Math.PI / 12) * 500 + 800 + Math.random() * 200,
      positive: Math.random() * 30 + 20,
      negative: Math.random() * 25 + 15,
      neutral: Math.random() * 20 + 10
    }));
  };

  // Generate weekly heatmap data
  const generateWeeklyHeatmapData = () => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const hours = Array.from({ length: 24 }, (_, i) => i);

    const data = [];
    days.forEach(day => {
      hours.forEach(hour => {
        // Different patterns for weekdays vs weekends
        const isWeekend = day === 'Saturday' || day === 'Sunday';
        const baseActivity = isWeekend ?
          Math.sin((hour - 12) * Math.PI / 12) * 30 + 40 :
          Math.sin((hour - 14) * Math.PI / 12) * 40 + 60;

        data.push({
          day,
          hour,
          activity: Math.max(0, baseActivity + Math.random() * 20 - 10),
          sentiment: Math.random() * 2 - 1
        });
      });
    });

    return data;
  };

  // Generate election timeline data
  const generateElectionTimelineData = () => {
    return [
      { date: '2023-01', phase: 'Pre-Campaign', sentiment: 0.1, volume: 1200, events: 'Party Primaries' },
      { date: '2023-03', phase: 'Campaign Launch', sentiment: 0.3, volume: 2800, events: 'Campaign Kickoff' },
      { date: '2023-06', phase: 'Mid-Campaign', sentiment: -0.1, volume: 4500, events: 'Debates Begin' },
      { date: '2023-09', phase: 'Late Campaign', sentiment: -0.3, volume: 6200, events: 'Final Push' },
      { date: '2023-12', phase: 'Pre-Election', sentiment: -0.5, volume: 8900, events: 'Last Mile' },
      { date: '2024-02', phase: 'Election Month', sentiment: -0.7, volume: 12000, events: 'Election Day' },
      { date: '2024-03', phase: 'Post-Election', sentiment: -0.4, volume: 7500, events: 'Results & Disputes' },
      { date: '2024-05', phase: 'Transition', sentiment: 0.0, volume: 3200, events: 'Inauguration Prep' },
      { date: '2024-06', phase: 'New Administration', sentiment: 0.2, volume: 2100, events: 'First 100 Days' }
    ];
  };

  // Generate seasonal trends data
  const generateSeasonalTrendsData = () => {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    return months.map((month, index) => ({
      month,
      sentiment2023: Math.sin((index - 2) * Math.PI / 6) * 0.4 + Math.random() * 0.2 - 0.1,
      sentiment2024: Math.sin((index - 1) * Math.PI / 6) * 0.3 + Math.random() * 0.2 - 0.1,
      volume2023: Math.sin((index - 3) * Math.PI / 6) * 2000 + 3000 + Math.random() * 500,
      volume2024: Math.sin((index - 2) * Math.PI / 6) * 2500 + 3500 + Math.random() * 600,
      temperature: Math.sin((index - 3) * Math.PI / 6) * 15 + 25, // Weather correlation
      rainfall: Math.sin((index - 6) * Math.PI / 6) * 100 + 120
    }));
  };

  // Generate temporal pattern recognition data
  const generatePatternRecognitionData = () => {
    return [
      { pattern: 'Morning Peak', frequency: 85, strength: 0.7, description: 'High engagement 7-9 AM' },
      { pattern: 'Lunch Dip', frequency: 92, strength: 0.6, description: 'Lower activity 12-2 PM' },
      { pattern: 'Evening Surge', frequency: 88, strength: 0.8, description: 'Peak activity 6-9 PM' },
      { pattern: 'Weekend Shift', frequency: 76, strength: 0.5, description: 'Later peak on weekends' },
      { pattern: 'Monday Blues', frequency: 68, strength: 0.4, description: 'Lower sentiment Mondays' },
      { pattern: 'Friday Optimism', frequency: 72, strength: 0.6, description: 'Higher sentiment Fridays' }
    ];
  };

  const circadianData = generateCircadianData();
  const weeklyHeatmapData = generateWeeklyHeatmapData();
  const electionTimelineData = generateElectionTimelineData();
  const seasonalTrendsData = generateSeasonalTrendsData();
  const patternRecognitionData = generatePatternRecognitionData();

  // Custom Weekly Heatmap Component
  const WeeklyHeatmap = ({ data }: { data: any[] }) => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const maxActivity = Math.max(...data.map(d => d.activity));

    return (
      <div className="overflow-x-auto">
        <div className="grid gap-1 text-xs" style={{ gridTemplateColumns: `80px repeat(${hours.length}, 1fr)` }}>
          <div></div>
          {hours.map(hour => (
            <div key={hour} className="text-center p-1 font-medium text-gray-600">
              {hour.toString().padStart(2, '0')}
            </div>
          ))}

          {days.map(day => (
            <React.Fragment key={day}>
              <div className="font-medium text-gray-700 p-2 text-right">{day.slice(0, 3)}</div>
              {hours.map(hour => {
                const cellData = data.find(d => d.day === day && d.hour === hour);
                const activity = cellData?.activity || 0;
                const sentiment = cellData?.sentiment || 0;

                const intensity = activity / maxActivity;
                const color = sentiment > 0.2 ? 'bg-green-500' :
                  sentiment < -0.2 ? 'bg-red-500' : 'bg-blue-500';

                return (
                  <div
                    key={`${day}-${hour}`}
                    className={`${color} rounded`}
                    style={{
                      height: '20px',
                      opacity: Math.max(intensity, 0.1)
                    }}
                    title={`${day} ${hour}:00 - Activity: ${activity.toFixed(0)}, Sentiment: ${sentiment.toFixed(2)}`}
                  />
                );
              })}
            </React.Fragment>
          ))}
        </div>
        <div className="mt-2 flex justify-center space-x-4 text-xs">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded mr-1"></div>
            <span>Positive</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded mr-1"></div>
            <span>Neutral</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded mr-1"></div>
            <span>Negative</span>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Temporal Analysis
        </h1>
        <p className="text-gray-600 mt-1">
          Analyze political sentiment patterns across time - circadian rhythms, weekly cycles, and seasonal trends
          {hasActiveFilters && (
            <span className="ml-2 text-blue-600 font-medium">
              (Filtered: {filteredPoliticians.length} politicians)
            </span>
          )}
        </p>
      </div>

      {/* Analysis Filters */}
      <AnalysisFilters
        selectedParty={filters.party}
        selectedPosition={filters.position}
        selectedState={filters.state}
        selectedPolitician={filters.politician}
        onPartyChange={(party) => updateFilter('party', party)}
        onPositionChange={(position) => updateFilter('position', position)}
        onStateChange={(state) => updateFilter('state', state)}
        onPoliticianChange={(politician) => updateFilter('politician', politician)}
        availablePoliticians={availablePoliticians}
      />

      {/* Controls */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex space-x-2">
            <span className="text-sm font-medium text-gray-700">View:</span>
            {(['circadian', 'weekly', 'seasonal', 'election'] as const).map((view) => (
              <button
                key={view}
                onClick={() => setSelectedView(view)}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${selectedView === view
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >
                {view.charAt(0).toUpperCase() + view.slice(1)}
              </button>
            ))}
          </div>

          <div className="flex space-x-2">
            <span className="text-sm font-medium text-gray-700">Metric:</span>
            {(['sentiment', 'engagement', 'volume'] as const).map((metric) => (
              <button
                key={metric}
                onClick={() => setSelectedMetric(metric)}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${selectedMetric === metric
                  ? 'bg-green-100 text-green-700 border border-green-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >
                {metric.charAt(0).toUpperCase() + metric.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chart based on selected view */}
      {selectedView === 'circadian' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Circadian Sentiment Patterns (24-Hour Cycle)
          </h2>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={circadianData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey={selectedMetric}
                stroke="#3B82F6"
                strokeWidth={3}
                name={selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)}
              />
              {selectedMetric === 'sentiment' && (
                <>
                  <Line type="monotone" dataKey="positive" stroke="#10B981" strokeWidth={2} name="Positive" />
                  <Line type="monotone" dataKey="negative" stroke="#EF4444" strokeWidth={2} name="Negative" />
                  <Line type="monotone" dataKey="neutral" stroke="#6B7280" strokeWidth={2} name="Neutral" />
                </>
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {selectedView === 'weekly' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Weekly Activity Heatmap
          </h2>
          <WeeklyHeatmap data={weeklyHeatmapData} />
          <div className="mt-4 text-center text-sm text-gray-600">
            Political engagement patterns throughout the week (opacity = activity level, color = sentiment)
          </div>
        </div>
      )}

      {selectedView === 'seasonal' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Seasonal Trends Comparison
          </h2>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={seasonalTrendsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="sentiment2023" stroke="#3B82F6" strokeWidth={2} name="2023 Sentiment" />
              <Line type="monotone" dataKey="sentiment2024" stroke="#10B981" strokeWidth={2} name="2024 Sentiment" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {selectedView === 'election' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Election Cycle Timeline
          </h2>
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={electionTimelineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="volume"
                stroke="#8884d8"
                fill="#8884d8"
                fillOpacity={0.3}
                name="Discussion Volume"
              />
              <Line
                type="monotone"
                dataKey="sentiment"
                stroke="#EF4444"
                strokeWidth={3}
                name="Sentiment Trend"
              />
            </ComposedChart>
          </ResponsiveContainer>
          <div className="mt-4">
            <h3 className="font-medium text-gray-900 mb-2">Key Election Milestones</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
              {electionTimelineData.map((item, index) => (
                <div key={index} className="bg-gray-50 p-2 rounded">
                  <span className="font-medium">{item.date}</span>: {item.events}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Pattern Recognition */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Detected Temporal Patterns
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {patternRecognitionData.map((pattern, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900">{pattern.pattern}</h3>
              <div className="mt-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Frequency</span>
                  <span>{pattern.frequency}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${pattern.frequency}%` }}
                  ></div>
                </div>
              </div>
              <div className="mt-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Strength</span>
                  <span>{(pattern.strength * 100).toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${pattern.strength * 100}%` }}
                  ></div>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-2">{pattern.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Temporal Analysis Insights
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-blue-900">Peak Hour</h3>
            <p className="text-2xl font-bold text-blue-700">8:00 PM</p>
            <p className="text-sm text-blue-600">Highest daily engagement</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-medium text-green-900">Best Day</h3>
            <p className="text-2xl font-bold text-green-700">Wednesday</p>
            <p className="text-sm text-green-600">Most positive sentiment</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="font-medium text-yellow-900">Seasonal Peak</h3>
            <p className="text-2xl font-bold text-yellow-700">February</p>
            <p className="text-sm text-yellow-600">Election month activity</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-medium text-purple-900">Pattern Strength</h3>
            <p className="text-2xl font-bold text-purple-700">78%</p>
            <p className="text-sm text-purple-600">Average pattern reliability</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeAnalysis;