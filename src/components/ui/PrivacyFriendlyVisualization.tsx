import { AlertTriangle, Eye, EyeOff, Settings, Shield } from 'lucide-react';
import React, { useMemo, useState } from 'react';

interface PrivacyLevel {
  level: 'full' | 'anonymized' | 'aggregated' | 'minimal';
  label: string;
  description: string;
}

interface DataPoint {
  id: string;
  value: number;
  label: string;
  sensitive?: boolean;
  demographic?: {
    age?: string;
    education?: string;
    location?: string;
  };
}

interface PrivacyFriendlyVisualizationProps {
  data: DataPoint[];
  title: string;
  children: (processedData: DataPoint[], privacyLevel: string) => React.ReactNode;
  defaultPrivacyLevel?: 'full' | 'anonymized' | 'aggregated' | 'minimal';
  showPrivacyControls?: boolean;
  onPrivacyLevelChange?: (level: string) => void;
  className?: string;
}

const PrivacyFriendlyVisualization: React.FC<PrivacyFriendlyVisualizationProps> = ({
  data,
  title,
  children,
  defaultPrivacyLevel = 'anonymized',
  showPrivacyControls = true,
  onPrivacyLevelChange,
  className = ''
}) => {
  const [privacyLevel, setPrivacyLevel] = useState<'full' | 'anonymized' | 'aggregated' | 'minimal'>(defaultPrivacyLevel);
  const [showSettings, setShowSettings] = useState(false);

  const privacyLevels: PrivacyLevel[] = [
    {
      level: 'full',
      label: 'Full Detail',
      description: 'Show all available data including demographic details'
    },
    {
      level: 'anonymized',
      label: 'Anonymized',
      description: 'Remove personally identifiable information but keep analytical value'
    },
    {
      level: 'aggregated',
      label: 'Aggregated',
      description: 'Group data into broader categories to protect individual privacy'
    },
    {
      level: 'minimal',
      label: 'Minimal',
      description: 'Show only essential data points without demographic details'
    }
  ];

  const processedData = useMemo(() => {
    switch (privacyLevel) {
      case 'full':
        return data;
      
      case 'anonymized':
        return data.map(point => ({
          ...point,
          id: `anon_${Math.random().toString(36).substr(2, 9)}`,
          label: point.sensitive ? 'Anonymous User' : point.label,
          demographic: point.demographic ? {
            age: point.demographic.age ? `${point.demographic.age.split('-')[0]}+ years` : undefined,
            education: point.demographic.education ? 'Higher Education' : undefined,
            location: point.demographic.location ? point.demographic.location.split(',')[0] : undefined
          } : undefined
        }));
      
      case 'aggregated':
        // Group similar data points together
        const aggregated = data.reduce((acc, point) => {
          const key = Math.floor(point.value / 10) * 10; // Group by value ranges
          if (!acc[key]) {
            acc[key] = {
              id: `group_${key}`,
              value: 0,
              label: `Group ${key}-${key + 9}`,
              count: 0
            };
          }
          acc[key].value += point.value;
          acc[key].count += 1;
          return acc;
        }, {} as Record<number, any>);
        
        return Object.values(aggregated).map(group => ({
          ...group,
          value: group.value / group.count // Average value
        }));
      
      case 'minimal':
        return data.map(point => ({
          id: point.id,
          value: Math.round(point.value / 5) * 5, // Round to nearest 5
          label: 'Data Point',
          demographic: undefined
        }));
      
      default:
        return data;
    }
  }, [data, privacyLevel]);

  const handlePrivacyLevelChange = (newLevel: 'full' | 'anonymized' | 'aggregated' | 'minimal') => {
    setPrivacyLevel(newLevel);
    if (onPrivacyLevelChange) {
      onPrivacyLevelChange(newLevel);
    }
  };

  const getPrivacyIcon = () => {
    switch (privacyLevel) {
      case 'full':
        return <Eye className="h-4 w-4 text-red-600" />;
      case 'anonymized':
        return <EyeOff className="h-4 w-4 text-yellow-600" />;
      case 'aggregated':
        return <Shield className="h-4 w-4 text-blue-600" />;
      case 'minimal':
        return <Shield className="h-4 w-4 text-green-600" />;
      default:
        return <Shield className="h-4 w-4 text-gray-600" />;
    }
  };

  const getPrivacyColor = () => {
    switch (privacyLevel) {
      case 'full':
        return 'bg-red-50 border-red-200 text-red-700';
      case 'anonymized':
        return 'bg-yellow-50 border-yellow-200 text-yellow-700';
      case 'aggregated':
        return 'bg-blue-50 border-blue-200 text-blue-700';
      case 'minimal':
        return 'bg-green-50 border-green-200 text-green-700';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  const sensitiveDataCount = data.filter(point => point.sensitive).length;

  return (
    <div className={`bg-white border border-gray-200 rounded-lg ${className}`}>
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        
        {showPrivacyControls && (
          <div className="flex items-center space-x-2">
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full border text-sm ${getPrivacyColor()}`}>
              {getPrivacyIcon()}
              <span className="font-medium">
                {privacyLevels.find(level => level.level === privacyLevel)?.label}
              </span>
            </div>
            
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
            >
              <Settings className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {showSettings && (
        <div className="p-4 border-b bg-gray-50">
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <AlertTriangle className="h-4 w-4" />
              <span>
                This visualization contains {sensitiveDataCount} sensitive data points
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {privacyLevels.map((level) => (
                <button
                  key={level.level}
                  onClick={() => handlePrivacyLevelChange(level.level)}
                  className={`p-3 text-left border rounded-lg transition-colors ${
                    privacyLevel === level.level
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-1">
                    {privacyLevel === level.level && getPrivacyIcon()}
                    <span className="font-medium text-sm">{level.label}</span>
                  </div>
                  <p className="text-xs text-gray-600">{level.description}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="p-4">
        {children(processedData, privacyLevel)}
      </div>

      <div className="px-4 pb-4">
        <div className="flex items-start space-x-2 p-3 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
          <Shield className="h-4 w-4 text-blue-600 mt-0.5" />
          <div>
            <p className="font-medium mb-1">Privacy Protection Active</p>
            <p>
              Data is being processed according to your privacy preferences. 
              {privacyLevel === 'full' && ' All personal details are visible.'}
              {privacyLevel === 'anonymized' && ' Personal identifiers have been removed.'}
              {privacyLevel === 'aggregated' && ' Data has been grouped to protect individual privacy.'}
              {privacyLevel === 'minimal' && ' Only essential data points are shown.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyFriendlyVisualization;