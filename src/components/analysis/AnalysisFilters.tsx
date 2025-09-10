import React from 'react';
import { NIGERIAN_STATES, POLITICAL_PARTIES } from '../../constants';
import { PoliticalPosition } from '../../types';

interface AnalysisFiltersProps {
  selectedParty: string;
  selectedPosition: string;
  selectedState: string;
  selectedPolitician: string;
  onPartyChange: (party: string) => void;
  onPositionChange: (position: string) => void;
  onStateChange: (state: string) => void;
  onPoliticianChange: (politician: string) => void;
  availablePoliticians?: Array<{ id: string; name: string; party: string; position: string; state: string }>;
}

const POLITICAL_POSITIONS = [
  { value: PoliticalPosition.PRESIDENT, label: 'President' },
  { value: PoliticalPosition.VICE_PRESIDENT, label: 'Vice President' },
  { value: PoliticalPosition.GOVERNOR, label: 'Governor' },
  { value: PoliticalPosition.DEPUTY_GOVERNOR, label: 'Deputy Governor' },
  { value: PoliticalPosition.SENATOR, label: 'Senator' },
  { value: PoliticalPosition.HOUSE_REP, label: 'House of Representatives' },
  { value: PoliticalPosition.STATE_ASSEMBLY, label: 'State Assembly' },
  { value: PoliticalPosition.LOCAL_CHAIRMAN, label: 'Local Chairman' },
  { value: PoliticalPosition.COUNCILLOR, label: 'Councillor' },
  { value: PoliticalPosition.MINISTER, label: 'Minister' },
  { value: PoliticalPosition.COMMISSIONER, label: 'Commissioner' },
  { value: PoliticalPosition.PARTY_LEADER, label: 'Party Leader' },
  { value: PoliticalPosition.ASPIRANT, label: 'Aspirant' },
  { value: PoliticalPosition.OTHER, label: 'Other' }
];

const AnalysisFilters: React.FC<AnalysisFiltersProps> = ({
  selectedParty,
  selectedPosition,
  selectedState,
  selectedPolitician,
  onPartyChange,
  onPositionChange,
  onStateChange,
  onPoliticianChange,
  availablePoliticians = []
}) => {
  // Filter politicians based on current selections
  const filteredPoliticians = availablePoliticians.filter(politician => {
    if (selectedParty !== 'all' && politician.party !== selectedParty) return false;
    if (selectedPosition !== 'all' && politician.position !== selectedPosition) return false;
    if (selectedState !== 'all' && politician.state !== selectedState) return false;
    return true;
  });

  const clearAllFilters = () => {
    onPartyChange('all');
    onPositionChange('all');
    onStateChange('all');
    onPoliticianChange('all');
  };

  const hasActiveFilters = selectedParty !== 'all' || selectedPosition !== 'all' || 
                          selectedState !== 'all' || selectedPolitician !== 'all';

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Analysis Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Clear All Filters
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Political Party Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Political Party
          </label>
          <select
            value={selectedParty}
            onChange={(e) => onPartyChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Parties</option>
            {POLITICAL_PARTIES.map(party => (
              <option key={party.value} value={party.value}>
                {party.label} - {party.fullName}
              </option>
            ))}
          </select>
        </div>

        {/* Political Position Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Political Position
          </label>
          <select
            value={selectedPosition}
            onChange={(e) => onPositionChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Positions</option>
            {POLITICAL_POSITIONS.map(position => (
              <option key={position.value} value={position.value}>
                {position.label}
              </option>
            ))}
          </select>
        </div>

        {/* State Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            State
          </label>
          <select
            value={selectedState}
            onChange={(e) => onStateChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All States</option>
            {NIGERIAN_STATES.map(state => (
              <option key={state.value} value={state.value}>
                {state.label}
              </option>
            ))}
          </select>
        </div>

        {/* Specific Politician Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Specific Politician
          </label>
          <select
            value={selectedPolitician}
            onChange={(e) => onPoliticianChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={filteredPoliticians.length === 0}
          >
            <option value="all">All Politicians</option>
            {filteredPoliticians.map(politician => (
              <option key={politician.id} value={politician.id}>
                {politician.name}
              </option>
            ))}
          </select>
          {filteredPoliticians.length === 0 && selectedPolitician === 'all' && (
            <p className="text-xs text-gray-500 mt-1">
              No politicians match current filters
            </p>
          )}
        </div>
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-gray-600">Active filters:</span>
            {selectedParty !== 'all' && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {POLITICAL_PARTIES.find(p => p.value === selectedParty)?.label}
                <button
                  onClick={() => onPartyChange('all')}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            )}
            {selectedPosition !== 'all' && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {POLITICAL_POSITIONS.find(p => p.value === selectedPosition)?.label}
                <button
                  onClick={() => onPositionChange('all')}
                  className="ml-1 text-green-600 hover:text-green-800"
                >
                  ×
                </button>
              </span>
            )}
            {selectedState !== 'all' && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                {NIGERIAN_STATES.find(s => s.value === selectedState)?.label}
                <button
                  onClick={() => onStateChange('all')}
                  className="ml-1 text-purple-600 hover:text-purple-800"
                >
                  ×
                </button>
              </span>
            )}
            {selectedPolitician !== 'all' && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                {availablePoliticians.find(p => p.id === selectedPolitician)?.name}
                <button
                  onClick={() => onPoliticianChange('all')}
                  className="ml-1 text-yellow-600 hover:text-yellow-800"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalysisFilters;