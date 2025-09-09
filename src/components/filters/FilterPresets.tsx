import React from 'react';
import { useFilterStore } from '../../stores/filterStore';
import { PoliticalLevel, PoliticalParty, SocialPlatform } from '../../types';

interface FilterPreset {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  filters: {
    parties?: PoliticalParty[];
    platforms?: SocialPlatform[];
    levels?: PoliticalLevel[];
    dateRangeDays?: number;
  };
}

interface FilterPresetsProps {
  className?: string;
}

const FilterPresets: React.FC<FilterPresetsProps> = ({ className = "" }) => {
  const {
    setSelectedParties,
    setSelectedPlatforms,
    setSelectedLevels,
    setPresetDateRange,
    clearAllFilters
  } = useFilterStore();

  const presets: FilterPreset[] = [
    {
      id: 'federal-politicians',
      name: 'Federal Politicians',
      description: 'Focus on federal-level political figures',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      filters: {
        levels: [PoliticalLevel.FEDERAL],
        dateRangeDays: 30
      }
    },
    {
      id: 'major-parties',
      name: 'Major Parties',
      description: 'APC, PDP, and Labour Party politicians',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      filters: {
        parties: [PoliticalParty.APC, PoliticalParty.PDP, PoliticalParty.LP],
        dateRangeDays: 30
      }
    },
    {
      id: 'social-media-focus',
      name: 'Social Media Focus',
      description: 'Twitter, Facebook, and Instagram activity',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-9 0a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2m-9 0V4" />
        </svg>
      ),
      filters: {
        platforms: [SocialPlatform.TWITTER, SocialPlatform.FACEBOOK, SocialPlatform.INSTAGRAM],
        dateRangeDays: 7
      }
    },
    {
      id: 'recent-activity',
      name: 'Recent Activity',
      description: 'Last 7 days across all platforms',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      filters: {
        dateRangeDays: 7
      }
    },
    {
      id: 'state-governors',
      name: 'State Level',
      description: 'Governors and state-level politicians',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      filters: {
        levels: [PoliticalLevel.STATE],
        dateRangeDays: 30
      }
    }
  ];

  const applyPreset = (preset: FilterPreset) => {
    // Clear existing filters first
    clearAllFilters();
    
    // Apply preset filters
    if (preset.filters.parties) {
      setSelectedParties(preset.filters.parties);
    }
    
    if (preset.filters.platforms) {
      setSelectedPlatforms(preset.filters.platforms);
    }
    
    if (preset.filters.levels) {
      setSelectedLevels(preset.filters.levels);
    }
    
    if (preset.filters.dateRangeDays) {
      setPresetDateRange(preset.filters.dateRangeDays);
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
        <h4 className="font-medium text-gray-900">Quick Filters</h4>
      </div>
      
      <div className="grid grid-cols-1 gap-2">
        {presets.map((preset) => (
          <button
            key={preset.id}
            onClick={() => applyPreset(preset)}
            className="flex items-start gap-3 p-3 text-left border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors group"
          >
            <div className="flex-shrink-0 p-2 bg-gray-100 rounded-lg group-hover:bg-blue-100 transition-colors">
              {preset.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-gray-900 group-hover:text-blue-900">
                {preset.name}
              </div>
              <div className="text-sm text-gray-500 group-hover:text-blue-700">
                {preset.description}
              </div>
            </div>
            <svg className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ))}
      </div>
    </div>
  );
};

export default FilterPresets;