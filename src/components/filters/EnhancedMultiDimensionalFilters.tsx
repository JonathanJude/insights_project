import React from 'react';

interface EnhancedMultiDimensionalFiltersProps {
  onCollapse?: () => void;
  showCollapseButton?: boolean;
  className?: string;
}

const EnhancedMultiDimensionalFilters: React.FC<EnhancedMultiDimensionalFiltersProps> = ({
  onCollapse,
  showCollapseButton = true,
  className = ""
}) => {
  return (
    <div className={`bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-200 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-purple-600">✨</span>
          <h3 className="text-sm font-semibold text-gray-900">Enhanced Filters</h3>
        </div>
        {showCollapseButton && onCollapse && (
          <button
            onClick={onCollapse}
            className="text-xs text-purple-600 hover:text-purple-800 transition-colors"
          >
            Collapse
          </button>
        )}
      </div>
      
      {/* Enhanced Multi-Dimensional Filter Grid */}
      <div className="space-y-4">
        {/* Geographic Hierarchy Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700 flex items-center">
              <span className="mr-1">🗺️</span> State
            </label>
            <select className="w-full text-xs border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-purple-500 focus:border-transparent">
              <option>All States</option>
              <option>Lagos</option>
              <option>Abuja (FCT)</option>
              <option>Kano</option>
              <option>Rivers</option>
              <option>Ogun</option>
              <option>Kaduna</option>
              <option>Oyo</option>
            </select>
          </div>
          
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700 flex items-center">
              <span className="mr-1">🏘️</span> LGA
            </label>
            <select className="w-full text-xs border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-purple-500 focus:border-transparent">
              <option>All LGAs</option>
              <option>Ikeja</option>
              <option>Lagos Island</option>
              <option>Surulere</option>
              <option>Alimosho</option>
              <option>Eti-Osa</option>
            </select>
          </div>
          
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700 flex items-center">
              <span className="mr-1">🏠</span> Ward
            </label>
            <select className="w-full text-xs border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-purple-500 focus:border-transparent">
              <option>All Wards</option>
              <option>Ward 1</option>
              <option>Ward 2</option>
              <option>Ward 3</option>
              <option>Ward 4</option>
              <option>Ward 5</option>
            </select>
          </div>
          
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700 flex items-center">
              <span className="mr-1">🗳️</span> Polling Unit
            </label>
            <select className="w-full text-xs border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-purple-500 focus:border-transparent">
              <option>All Units</option>
              <option>PU 001</option>
              <option>PU 002</option>
              <option>PU 003</option>
              <option>PU 004</option>
            </select>
          </div>
        </div>

        {/* Demographics and Sentiment Row */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700 flex items-center">
              <span className="mr-1">👥</span> Age Group
            </label>
            <select className="w-full text-xs border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-purple-500 focus:border-transparent">
              <option>All Ages</option>
              <option>18-25</option>
              <option>26-35</option>
              <option>36-45</option>
              <option>46-55</option>
              <option>56-65</option>
              <option>65+</option>
            </select>
          </div>
          
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700 flex items-center">
              <span className="mr-1">🎓</span> Education
            </label>
            <select className="w-full text-xs border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-purple-500 focus:border-transparent">
              <option>All Education</option>
              <option>Primary</option>
              <option>Secondary</option>
              <option>Tertiary</option>
              <option>Postgraduate</option>
            </select>
          </div>
          
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700 flex items-center">
              <span className="mr-1">💼</span> Occupation
            </label>
            <select className="w-full text-xs border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-purple-500 focus:border-transparent">
              <option>All Sectors</option>
              <option>Public Sector</option>
              <option>Private Sector</option>
              <option>Technology</option>
              <option>Agriculture</option>
              <option>Self-Employed</option>
              <option>Student</option>
            </select>
          </div>
          
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700 flex items-center">
              <span className="mr-1">😊</span> Sentiment
            </label>
            <select className="w-full text-xs border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-purple-500 focus:border-transparent">
              <option>All Sentiment</option>
              <option>Positive</option>
              <option>Neutral</option>
              <option>Negative</option>
            </select>
          </div>
          
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700 flex items-center">
              <span className="mr-1">🎭</span> Emotion
            </label>
            <select className="w-full text-xs border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-purple-500 focus:border-transparent">
              <option>All Emotions</option>
              <option>Joy 😊</option>
              <option>Anger 😠</option>
              <option>Fear 😰</option>
              <option>Sadness 😢</option>
              <option>Mixed 🤔</option>
            </select>
          </div>
        </div>

        {/* Topics and Engagement Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700 flex items-center">
              <span className="mr-1">📋</span> Policy Area
            </label>
            <select className="w-full text-xs border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-purple-500 focus:border-transparent">
              <option>All Topics</option>
              <option>Economy</option>
              <option>Security</option>
              <option>Education</option>
              <option>Healthcare</option>
              <option>Infrastructure</option>
              <option>Corruption</option>
              <option>Youth/Jobs</option>
            </select>
          </div>
          
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700 flex items-center">
              <span className="mr-1">📊</span> Engagement
            </label>
            <select className="w-full text-xs border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-purple-500 focus:border-transparent">
              <option>All Levels</option>
              <option>High 🔥</option>
              <option>Medium</option>
              <option>Low</option>
              <option>Viral Only</option>
            </select>
          </div>
          
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700 flex items-center">
              <span className="mr-1">📈</span> Confidence
            </label>
            <div className="flex items-center space-x-2">
              <input 
                type="range" 
                min="0" 
                max="100" 
                defaultValue="70"
                className="flex-1 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-xs text-gray-600 w-8">70%</span>
            </div>
          </div>
          
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700">Actions</label>
            <div className="flex space-x-1">
              <button className="px-3 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors">
                Apply Filters
              </button>
              <button className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors">
                Reset All
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedMultiDimensionalFilters;