import React, { useState } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import AnalysisFilters from '../../components/analysis/AnalysisFilters';
import PageLayout from '../../components/layout/PageLayout';
import { useAnalysisFilters } from '../../hooks/useAnalysisFilters';
import { useEnhancedPoliticians } from '../../hooks/useEnhancedPoliticians';
import { useIsMobile } from '../../hooks/useMediaQuery';
import { ANALYSIS_PAGE_METADATA, usePageNavigation } from '../../hooks/usePageNavigation';

const GeographicAnalysis: React.FC = () => {
  const { data: enhancedData, isLoading } = useEnhancedPoliticians([]);
  const {
    filters,
    availablePoliticians,
    filteredPoliticians,
    selectedPoliticianData,
    hasActiveFilters,
    updateFilter,
    clearAllFilters,
    getFilterSummary,
    getContextualData
  } = useAnalysisFilters();

  const isMobile = useIsMobile();

  // Use page navigation hook
  usePageNavigation({
    metadata: ANALYSIS_PAGE_METADATA.geographic
  });

  const [selectedState, setSelectedState] = useState<string>('all');
  const [selectedLGA, setSelectedLGA] = useState<string>('all');
  const [selectedWard, setSelectedWard] = useState<string>('all');
  const [selectedView, setSelectedView] = useState<'choropleth' | 'treemap' | 'comparison' | 'timeline' | 'lga' | 'ward' | 'polling'>('choropleth');
  const [administrativeLevel, setAdministrativeLevel] = useState<'state' | 'lga' | 'ward' | 'polling'>('state');

  const contextualData = getContextualData();

  // Generate Nigeria choropleth data
  const generateNigeriaChoroplethData = () => {
    const states = [
      'Lagos', 'Kano', 'Rivers', 'Kaduna', 'Oyo', 'Ogun', 'Imo', 'Borno', 'Osun', 'Delta',
      'Anambra', 'Taraba', 'Katsina', 'Cross River', 'Plateau', 'Bauchi', 'Jigawa', 'Kebbi',
      'Ondo', 'Enugu', 'Zamfara', 'Sokoto', 'Benue', 'Adamawa', 'Nasarawa', 'Akwa Ibom',
      'Ebonyi', 'Kwara', 'Gombe', 'Yobe', 'Abia', 'Ekiti', 'Bayelsa', 'Kogi', 'Niger', 'Edo', 'FCT'
    ];

    return states.map(state => ({
      state,
      sentiment: Math.random() * 2 - 1, // -1 to 1
      positive: Math.random() * 60 + 20,
      negative: Math.random() * 40 + 10,
      neutral: Math.random() * 30 + 15,
      dataPoints: Math.floor(Math.random() * 20000) + 5000,
      region: getRegion(state)
    }));
  };

  // Generate hierarchical tree map data for LGA-level analysis
  const generateLGATreemapData = () => {
    const regions = [
      { name: 'South West', states: ['Lagos', 'Ogun', 'Oyo', 'Osun', 'Ondo', 'Ekiti'] },
      { name: 'South East', states: ['Anambra', 'Enugu', 'Imo', 'Abia', 'Ebonyi'] },
      { name: 'South South', states: ['Rivers', 'Delta', 'Cross River', 'Akwa Ibom', 'Bayelsa', 'Edo'] },
      { name: 'North Central', states: ['FCT', 'Plateau', 'Benue', 'Nasarawa', 'Kogi', 'Niger', 'Kwara'] },
      { name: 'North West', states: ['Kano', 'Kaduna', 'Katsina', 'Sokoto', 'Kebbi', 'Zamfara', 'Jigawa'] },
      { name: 'North East', states: ['Borno', 'Adamawa', 'Taraba', 'Bauchi', 'Gombe', 'Yobe'] }
    ];

    return regions.map(region => ({
      name: region.name,
      children: region.states.map(state => ({
        name: state,
        size: Math.floor(Math.random() * 15000) + 5000,
        sentiment: Math.random() * 2 - 1,
        children: Array.from({ length: Math.floor(Math.random() * 8) + 5 }, (_, i) => ({
          name: `${state} LGA ${i + 1}`,
          size: Math.floor(Math.random() * 2000) + 500,
          sentiment: Math.random() * 2 - 1
        }))
      }))
    }));
  };

  // Generate regional comparison data
  const generateRegionalComparisonData = () => {
    return [
      { region: 'South West', sentiment: 0.45, positive: 65, negative: 20, neutral: 15, population: 28000000 },
      { region: 'South East', sentiment: 0.38, positive: 58, negative: 25, neutral: 17, population: 16000000 },
      { region: 'South South', sentiment: 0.32, positive: 55, negative: 28, neutral: 17, population: 21000000 },
      { region: 'North Central', sentiment: 0.15, positive: 45, negative: 35, neutral: 20, population: 20000000 },
      { region: 'North West', sentiment: -0.05, positive: 38, negative: 42, neutral: 20, population: 35000000 },
      { region: 'North East', sentiment: -0.15, positive: 35, negative: 45, neutral: 20, population: 18000000 }
    ];
  };

  // Generate geographic timeline data
  const generateGeographicTimelineData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map(month => ({
      month,
      'South West': Math.random() * 0.8 + 0.2,
      'South East': Math.random() * 0.6 + 0.1,
      'South South': Math.random() * 0.5 + 0.1,
      'North Central': Math.random() * 0.4 - 0.1,
      'North West': Math.random() * 0.3 - 0.2,
      'North East': Math.random() * 0.2 - 0.3
    }));
  };

  // Generate LGA data for selected state
  const generateLGAData = (state: string) => {
    const lgaCount = Math.floor(Math.random() * 15) + 10; // 10-25 LGAs per state
    return Array.from({ length: lgaCount }, (_, i) => ({
      lga: `${state} ${['Central', 'North', 'South', 'East', 'West', 'Metropolitan', 'Urban', 'Rural'][i % 8]} LGA`,
      sentiment: Math.random() * 2 - 1,
      positive: Math.random() * 60 + 20,
      negative: Math.random() * 40 + 10,
      neutral: Math.random() * 30 + 15,
      dataPoints: Math.floor(Math.random() * 5000) + 1000,
      wards: Math.floor(Math.random() * 8) + 5, // 5-12 wards per LGA
      pollingUnits: Math.floor(Math.random() * 50) + 20 // 20-70 polling units per LGA
    }));
  };

  // Generate Ward data for selected LGA
  const generateWardData = (lga: string) => {
    const wardCount = Math.floor(Math.random() * 8) + 5; // 5-12 wards per LGA
    return Array.from({ length: wardCount }, (_, i) => ({
      ward: `Ward ${String(i + 1).padStart(2, '0')}`,
      fullName: `${lga} - Ward ${String(i + 1).padStart(2, '0')}`,
      sentiment: Math.random() * 2 - 1,
      positive: Math.random() * 60 + 20,
      negative: Math.random() * 40 + 10,
      neutral: Math.random() * 30 + 15,
      dataPoints: Math.floor(Math.random() * 800) + 200,
      pollingUnits: Math.floor(Math.random() * 8) + 3, // 3-10 polling units per ward
      registeredVoters: Math.floor(Math.random() * 5000) + 2000
    }));
  };

  // Generate Polling Unit data for selected ward
  const generatePollingUnitData = (ward: string) => {
    const puCount = Math.floor(Math.random() * 8) + 3; // 3-10 polling units per ward
    return Array.from({ length: puCount }, (_, i) => ({
      pollingUnit: `PU ${String(i + 1).padStart(3, '0')}`,
      fullName: `${ward} - PU ${String(i + 1).padStart(3, '0')}`,
      sentiment: Math.random() * 2 - 1,
      positive: Math.random() * 60 + 20,
      negative: Math.random() * 40 + 10,
      neutral: Math.random() * 30 + 15,
      dataPoints: Math.floor(Math.random() * 150) + 50,
      registeredVoters: Math.floor(Math.random() * 800) + 300,
      location: ['School', 'Community Center', 'Town Hall', 'Church', 'Mosque', 'Market Square'][Math.floor(Math.random() * 6)],
      accessibility: ['High', 'Medium', 'Low'][Math.floor(Math.random() * 3)]
    }));
  };

  // Generate administrative hierarchy breakdown
  const generateAdministrativeBreakdown = () => {
    return {
      states: 37,
      lgas: 774, // Total LGAs in Nigeria
      wards: 8809, // Approximate total wards
      pollingUnits: 176846, // Approximate total polling units
      coverage: {
        states: 36, // States with data
        lgas: 720, // LGAs with data
        wards: 7850, // Wards with data
        pollingUnits: 165000 // Polling units with data
      }
    };
  };

  // Helper function to get region for a state
  const getRegion = (state: string): string => {
    const regionMap: Record<string, string> = {
      'Lagos': 'South West', 'Ogun': 'South West', 'Oyo': 'South West', 'Osun': 'South West', 'Ondo': 'South West', 'Ekiti': 'South West',
      'Anambra': 'South East', 'Enugu': 'South East', 'Imo': 'South East', 'Abia': 'South East', 'Ebonyi': 'South East',
      'Rivers': 'South South', 'Delta': 'South South', 'Cross River': 'South South', 'Akwa Ibom': 'South South', 'Bayelsa': 'South South', 'Edo': 'South South',
      'FCT': 'North Central', 'Plateau': 'North Central', 'Benue': 'North Central', 'Nasarawa': 'North Central', 'Kogi': 'North Central', 'Niger': 'North Central', 'Kwara': 'North Central',
      'Kano': 'North West', 'Kaduna': 'North West', 'Katsina': 'North West', 'Sokoto': 'North West', 'Kebbi': 'North West', 'Zamfara': 'North West', 'Jigawa': 'North West',
      'Borno': 'North East', 'Adamawa': 'North East', 'Taraba': 'North East', 'Bauchi': 'North East', 'Gombe': 'North East', 'Yobe': 'North East'
    };
    return regionMap[state] || 'Unknown';
  };

  const choroplethData = generateNigeriaChoroplethData();
  const treemapData = generateLGATreemapData();
  const regionalComparisonData = generateRegionalComparisonData();
  const timelineData = generateGeographicTimelineData();
  const lgaData = selectedState !== 'all' ? generateLGAData(selectedState) : [];
  const wardData = selectedLGA !== 'all' ? generateWardData(selectedLGA) : [];
  const pollingUnitData = selectedWard !== 'all' ? generatePollingUnitData(selectedWard) : [];
  const adminBreakdown = generateAdministrativeBreakdown();

  // Custom Nigeria Map Component (simplified representation)
  const NigeriaMap = ({ data }: { data: any[] }) => {
    const maxSentiment = Math.max(...data.map(d => Math.abs(d.sentiment)));

    return (
      <div className="bg-gray-50 rounded-lg p-6" style={{ minHeight: '400px' }}>
        <div className="grid grid-cols-6 gap-2">
          {data.map((stateData, index) => {
            const intensity = Math.abs(stateData.sentiment) / maxSentiment;
            const color = stateData.sentiment > 0 ? 'bg-green-' : stateData.sentiment < 0 ? 'bg-red-' : 'bg-gray-';
            const shade = intensity > 0.7 ? '500' : intensity > 0.4 ? '300' : '100';

            return (
              <div
                key={stateData.state}
                className={`${color}${shade} p-3 rounded text-center text-white font-medium cursor-pointer hover:opacity-80 transition-opacity`}
                title={`${stateData.state}: ${stateData.sentiment.toFixed(2)} sentiment, ${stateData.dataPoints} data points`}
                onClick={() => setSelectedState(stateData.state)}
              >
                <div className="text-xs font-bold">{stateData.state}</div>
                <div className="text-xs">{stateData.sentiment.toFixed(2)}</div>
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex justify-center space-x-6 text-sm">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
            <span>Positive Sentiment</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-gray-300 rounded mr-2"></div>
            <span>Neutral</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
            <span>Negative Sentiment</span>
          </div>
        </div>
      </div>
    );
  };

  // Custom Treemap Component
  const CustomTreemap = ({ data }: { data: any[] }) => {
    return (
      <div className="space-y-4">
        {data.map((region, regionIndex) => (
          <div key={region.name} className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">{region.name}</h3>
            <div className="grid grid-cols-3 gap-2">
              {region.children.map((state: any, stateIndex: number) => {
                const intensity = Math.abs(state.sentiment);
                const color = state.sentiment > 0 ? 'bg-green-' : state.sentiment < 0 ? 'bg-red-' : 'bg-gray-';
                const shade = intensity > 0.7 ? '500' : intensity > 0.4 ? '300' : '100';

                return (
                  <div
                    key={state.name}
                    className={`${color}${shade} p-3 rounded text-center text-white cursor-pointer hover:opacity-80`}
                    style={{
                      minHeight: `${Math.max(60, (state.size / 1000) * 10)}px`,
                      opacity: Math.max(0.3, intensity)
                    }}
                    title={`${state.name}: ${state.sentiment.toFixed(2)} sentiment, ${state.size} data points`}
                    onClick={() => setSelectedState(state.name)}
                  >
                    <div className="text-xs font-bold">{state.name}</div>
                    <div className="text-xs">{state.sentiment.toFixed(2)}</div>
                    <div className="text-xs">{state.children?.length || 0} LGAs</div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // LGA Grid Component
  const LGAGrid = ({ data }: { data: any[] }) => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.map((lga, index) => {
          const intensity = Math.abs(lga.sentiment);
          const color = lga.sentiment > 0 ? 'border-green-500 bg-green-50' :
            lga.sentiment < 0 ? 'border-red-500 bg-red-50' : 'border-gray-500 bg-gray-50';

          return (
            <div
              key={lga.lga}
              className={`border-2 ${color} rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow`}
              onClick={() => setSelectedLGA(lga.lga)}
            >
              <h3 className="font-semibold text-gray-900 mb-2">{lga.lga}</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Sentiment:</span>
                  <span className={`font-medium ${lga.sentiment > 0 ? 'text-green-600' : lga.sentiment < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                    {lga.sentiment.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Data Points:</span>
                  <span className="font-medium">{lga.dataPoints.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Wards:</span>
                  <span className="font-medium">{lga.wards}</span>
                </div>
                <div className="flex justify-between">
                  <span>Polling Units:</span>
                  <span className="font-medium">{lga.pollingUnits}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Ward Grid Component
  const WardGrid = ({ data }: { data: any[] }) => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {data.map((ward, index) => {
          const intensity = Math.abs(ward.sentiment);
          const color = ward.sentiment > 0 ? 'border-green-500 bg-green-50' :
            ward.sentiment < 0 ? 'border-red-500 bg-red-50' : 'border-gray-500 bg-gray-50';

          return (
            <div
              key={ward.ward}
              className={`border-2 ${color} rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow`}
              onClick={() => setSelectedWard(ward.fullName)}
            >
              <h3 className="font-semibold text-gray-900 mb-2">{ward.ward}</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Sentiment:</span>
                  <span className={`font-medium ${ward.sentiment > 0 ? 'text-green-600' : ward.sentiment < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                    {ward.sentiment.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Data Points:</span>
                  <span className="font-medium">{ward.dataPoints.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Polling Units:</span>
                  <span className="font-medium">{ward.pollingUnits}</span>
                </div>
                <div className="flex justify-between">
                  <span>Voters:</span>
                  <span className="font-medium">{ward.registeredVoters.toLocaleString()}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Polling Unit Table Component
  const PollingUnitTable = ({ data }: { data: any[] }) => {
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Polling Unit
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sentiment
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Data Points
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Registered Voters
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Accessibility
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((pu, index) => (
              <tr key={pu.pollingUnit} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {pu.pollingUnit}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {pu.location}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`font-medium ${pu.sentiment > 0 ? 'text-green-600' : pu.sentiment < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                    {pu.sentiment.toFixed(2)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {pu.dataPoints.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {pu.registeredVoters.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 py-1 text-xs rounded-full ${pu.accessibility === 'High' ? 'bg-green-100 text-green-800' :
                    pu.accessibility === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                    {pu.accessibility}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  if (isLoading) {
    return (
      <PageLayout
        title="Geographic Analysis"
        subtitle="Loading geographic sentiment data..."
        badge={{ text: 'New', color: 'purple' }}
      >
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </PageLayout>
    );
  }

  // Error boundary for data generation
  try {

    return (
      <PageLayout
        title="Geographic Analysis"
        subtitle={`Analyze political sentiment across Nigerian states, regions, and local government areas${
          hasActiveFilters ? ` (Filtered: ${filteredPoliticians.length} politicians)` : ''
        }`}
        badge={{ text: 'New', color: 'purple' }}
      >

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
              {(['choropleth', 'treemap', 'comparison', 'timeline', 'lga', 'ward', 'polling'] as const).map((view) => (
                <button
                  key={view}
                  onClick={() => setSelectedView(view)}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${selectedView === view
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                  {view === 'lga' ? 'LGA' : view === 'polling' ? 'Polling Units' : view.charAt(0).toUpperCase() + view.slice(1)}
                </button>
              ))}
            </div>

            <div className="flex space-x-2">
              <span className="text-sm font-medium text-gray-700">State:</span>
              <select
                value={selectedState}
                onChange={(e) => {
                  setSelectedState(e.target.value);
                  setSelectedLGA('all');
                  setSelectedWard('all');
                }}
                className="px-3 py-1 border border-gray-300 rounded text-sm"
              >
                <option value="all">All States</option>
                {choroplethData.map(state => (
                  <option key={state.state} value={state.state}>{state.state}</option>
                ))}
              </select>
            </div>

            {selectedState !== 'all' && lgaData.length > 0 && (
              <div className="flex space-x-2">
                <span className="text-sm font-medium text-gray-700">LGA:</span>
                <select
                  value={selectedLGA}
                  onChange={(e) => {
                    setSelectedLGA(e.target.value);
                    setSelectedWard('all');
                  }}
                  className="px-3 py-1 border border-gray-300 rounded text-sm"
                >
                  <option value="all">All LGAs</option>
                  {lgaData.map(lga => (
                    <option key={lga.lga} value={lga.lga}>{lga.lga}</option>
                  ))}
                </select>
              </div>
            )}

            {selectedLGA !== 'all' && wardData.length > 0 && (
              <div className="flex space-x-2">
                <span className="text-sm font-medium text-gray-700">Ward:</span>
                <select
                  value={selectedWard}
                  onChange={(e) => setSelectedWard(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded text-sm"
                >
                  <option value="all">All Wards</option>
                  {wardData.map(ward => (
                    <option key={ward.fullName} value={ward.fullName}>{ward.ward}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Administrative Level Breadcrumb */}
          <div className="mt-4 flex items-center space-x-2 text-sm text-gray-600">
            <span>Navigation:</span>
            <button
              onClick={() => { setSelectedState('all'); setSelectedLGA('all'); setSelectedWard('all'); }}
              className="text-blue-600 hover:text-blue-800"
            >
              Nigeria
            </button>
            {selectedState !== 'all' && (
              <>
                <span>→</span>
                <button
                  onClick={() => { setSelectedLGA('all'); setSelectedWard('all'); }}
                  className="text-blue-600 hover:text-blue-800"
                >
                  {selectedState}
                </button>
              </>
            )}
            {selectedLGA !== 'all' && (
              <>
                <span>→</span>
                <button
                  onClick={() => setSelectedWard('all')}
                  className="text-blue-600 hover:text-blue-800"
                >
                  {selectedLGA}
                </button>
              </>
            )}
            {selectedWard !== 'all' && (
              <>
                <span>→</span>
                <span className="text-gray-900 font-medium">{selectedWard}</span>
              </>
            )}
          </div>
        </div>

        {/* Main Visualization based on selected view */}
        {selectedView === 'choropleth' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Nigeria Sentiment Choropleth Map
            </h2>
            <NigeriaMap data={choroplethData} />
            <div className="mt-4 text-center text-sm text-gray-600">
              Click on any state to view detailed analysis. Color intensity represents sentiment strength.
            </div>
          </div>
        )}

        {selectedView === 'treemap' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Hierarchical Tree Map - LGA Level Analysis
            </h2>
            <CustomTreemap data={treemapData} />
            <div className="mt-4 text-center text-sm text-gray-600">
              Hierarchical view showing regional, state, and LGA-level sentiment distribution
            </div>
          </div>
        )}

        {selectedView === 'comparison' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Regional Comparison Charts
            </h2>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={regionalComparisonData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="region" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="positive" fill="#10B981" name="Positive %" />
                <Bar dataKey="negative" fill="#EF4444" name="Negative %" />
                <Bar dataKey="neutral" fill="#6B7280" name="Neutral %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {selectedView === 'timeline' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Geographic Timeline Visualization
            </h2>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[-0.5, 1]} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="South West" stroke="#10B981" strokeWidth={2} />
                <Line type="monotone" dataKey="South East" stroke="#3B82F6" strokeWidth={2} />
                <Line type="monotone" dataKey="South South" stroke="#8B5CF6" strokeWidth={2} />
                <Line type="monotone" dataKey="North Central" stroke="#F59E0B" strokeWidth={2} />
                <Line type="monotone" dataKey="North West" stroke="#EF4444" strokeWidth={2} />
                <Line type="monotone" dataKey="North East" stroke="#6B7280" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {selectedView === 'lga' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Local Government Area Analysis
              {selectedState !== 'all' && ` - ${selectedState} State`}
            </h2>
            {selectedState === 'all' ? (
              <div className="text-center py-8 text-gray-500">
                <p>Please select a state to view LGA-level analysis</p>
              </div>
            ) : (
              <>
                <LGAGrid data={lgaData} />
                <div className="mt-4 text-center text-sm text-gray-600">
                  Click on any LGA to drill down to ward-level analysis
                </div>
              </>
            )}
          </div>
        )}

        {selectedView === 'ward' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Ward-Level Analysis
              {selectedLGA !== 'all' && ` - ${selectedLGA}`}
            </h2>
            {selectedLGA === 'all' ? (
              <div className="text-center py-8 text-gray-500">
                <p>Please select an LGA to view ward-level analysis</p>
              </div>
            ) : (
              <>
                <WardGrid data={wardData} />
                <div className="mt-4 text-center text-sm text-gray-600">
                  Click on any ward to drill down to polling unit analysis
                </div>
              </>
            )}
          </div>
        )}

        {selectedView === 'polling' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Polling Unit Analysis
              {selectedWard !== 'all' && ` - ${selectedWard}`}
            </h2>
            {selectedWard === 'all' ? (
              <div className="text-center py-8 text-gray-500">
                <p>Please select a ward to view polling unit analysis</p>
              </div>
            ) : (
              <>
                <PollingUnitTable data={pollingUnitData} />
                <div className="mt-4 text-center text-sm text-gray-600">
                  Detailed polling unit information including location and accessibility
                </div>
              </>
            )}
          </div>
        )}

        {/* State Detail Panel (when state is selected) */}
        {selectedState !== 'all' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {selectedState} State Analysis
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(() => {
                const stateData = choroplethData.find(s => s.state === selectedState);
                return stateData ? (
                  <>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="font-medium text-blue-900">Overall Sentiment</h3>
                      <p className="text-2xl font-bold text-blue-700">{stateData.sentiment.toFixed(2)}</p>
                      <p className="text-sm text-blue-600">Sentiment score (-1 to +1)</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h3 className="font-medium text-green-900">Data Points</h3>
                      <p className="text-2xl font-bold text-green-700">{stateData.dataPoints.toLocaleString()}</p>
                      <p className="text-sm text-green-600">Total analyzed posts</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h3 className="font-medium text-purple-900">Region</h3>
                      <p className="text-2xl font-bold text-purple-700">{stateData.region}</p>
                      <p className="text-sm text-purple-600">Geopolitical zone</p>
                    </div>
                  </>
                ) : null;
              })()}
            </div>
          </div>
        )}

        {/* Administrative Coverage Statistics */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Administrative Coverage Overview
            {hasActiveFilters && (
              <span className="text-sm font-normal text-gray-600 ml-2">
                (Filtered Data)
              </span>
            )}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900">States</h3>
              <p className="text-2xl font-bold text-blue-700">{Math.floor(adminBreakdown.coverage.states * (hasActiveFilters ? 0.8 : 1))}/{adminBreakdown.states}</p>
              <p className="text-sm text-blue-600">Coverage: {(contextualData.coveragePercentage).toFixed(1)}%</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-medium text-green-900">LGAs</h3>
              <p className="text-2xl font-bold text-green-700">{Math.floor(adminBreakdown.coverage.lgas * (hasActiveFilters ? 0.7 : 1)).toLocaleString()}/{adminBreakdown.lgas.toLocaleString()}</p>
              <p className="text-sm text-green-600">Coverage: {(contextualData.coveragePercentage * 0.9).toFixed(1)}%</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-medium text-purple-900">Wards</h3>
              <p className="text-2xl font-bold text-purple-700">{Math.floor(adminBreakdown.coverage.wards * (hasActiveFilters ? 0.6 : 1)).toLocaleString()}/{adminBreakdown.wards.toLocaleString()}</p>
              <p className="text-sm text-purple-600">Coverage: {(contextualData.coveragePercentage * 0.85).toFixed(1)}%</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="font-medium text-yellow-900">Polling Units</h3>
              <p className="text-2xl font-bold text-yellow-700">{Math.floor(adminBreakdown.coverage.pollingUnits * (hasActiveFilters ? 0.5 : 1)).toLocaleString()}/{adminBreakdown.pollingUnits.toLocaleString()}</p>
              <p className="text-sm text-yellow-600">Coverage: {(contextualData.coveragePercentage * 0.8).toFixed(1)}%</p>
            </div>
          </div>

          {/* Filter Context Information */}
          {hasActiveFilters && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Current Analysis Context</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-blue-700 font-medium">Data Points:</span>
                  <span className="ml-2 text-blue-600">{contextualData.totalDataPoints.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-blue-700 font-medium">Politicians:</span>
                  <span className="ml-2 text-blue-600">{contextualData.filteredCount}</span>
                </div>
                <div>
                  <span className="text-blue-700 font-medium">Avg Sentiment:</span>
                  <span className="ml-2 text-blue-600">{contextualData.sentimentScore.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Summary Statistics */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Geographic Analysis Summary
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-medium text-green-900">Most Positive</h3>
              <p className="text-2xl font-bold text-green-700">South West</p>
              <p className="text-sm text-green-600">Highest regional sentiment</p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <h3 className="font-medium text-red-900">Most Negative</h3>
              <p className="text-2xl font-bold text-red-700">North East</p>
              <p className="text-sm text-red-600">Lowest regional sentiment</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900">Most Active</h3>
              <p className="text-2xl font-bold text-blue-700">Lagos</p>
              <p className="text-sm text-blue-600">Highest data volume</p>
            </div>
            <div className="bg-indigo-50 p-4 rounded-lg">
              <h3 className="font-medium text-indigo-900">Granular Analysis</h3>
              <p className="text-2xl font-bold text-indigo-700">4 Levels</p>
              <p className="text-sm text-indigo-600">State → LGA → Ward → PU</p>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  } catch (error) {
    console.error('Error in GeographicAnalysis:', error);
    return (
      <PageLayout
        title="Geographic Analysis"
        subtitle="Analyze political sentiment across Nigerian states, regions, and local government areas"
        badge={{ text: 'New', color: 'purple' }}
      >
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">
              There was an error loading the geographic analysis. Please try refreshing the page.
            </p>
          </div>
        </div>
      </PageLayout>
    );
  }
};

export default GeographicAnalysis;