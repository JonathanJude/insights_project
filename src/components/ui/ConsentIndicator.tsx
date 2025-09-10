import { AlertTriangle, Check, Info, Shield, X } from 'lucide-react';
import React, { useState } from 'react';

interface ConsentStatus {
  demographic: boolean;
  geographic: boolean;
  sentiment: boolean;
  crossBorder: boolean;
}

interface DataUsageInfo {
  type: 'demographic' | 'geographic' | 'sentiment' | 'crossBorder';
  purpose: string;
  retention: string;
  sharing: string;
  legal_basis: string;
}

interface ConsentIndicatorProps {
  consentStatus: ConsentStatus;
  onConsentChange?: (type: keyof ConsentStatus, granted: boolean) => void;
  showDetails?: boolean;
  className?: string;
}

const ConsentIndicator: React.FC<ConsentIndicatorProps> = ({
  consentStatus,
  onConsentChange,
  showDetails = false,
  className = ''
}) => {
  const [expandedInfo, setExpandedInfo] = useState<string | null>(null);

  const dataUsageInfo: DataUsageInfo[] = [
    {
      type: 'demographic',
      purpose: 'Analyze sentiment patterns across age, education, and occupation groups',
      retention: 'Data is anonymized after 30 days and aggregated for analysis',
      sharing: 'No personal demographic data is shared with third parties',
      legal_basis: 'Legitimate interest for political analysis (NDPR Article 6)'
    },
    {
      type: 'geographic',
      purpose: 'Understand regional political sentiment and geographic patterns',
      retention: 'Location data is aggregated to state/LGA level after processing',
      sharing: 'Geographic trends may be shared in anonymized reports',
      legal_basis: 'Consent for location-based analysis (NDPR Article 7)'
    },
    {
      type: 'sentiment',
      purpose: 'Analyze emotional responses and opinion trends in political discourse',
      retention: 'Sentiment data is retained for trend analysis for 12 months',
      sharing: 'Aggregated sentiment trends may be published in research',
      legal_basis: 'Legitimate interest for public opinion research (NDPR Article 6)'
    },
    {
      type: 'crossBorder',
      purpose: 'Enable analysis of international political content and comparisons',
      retention: 'International data follows local jurisdiction requirements',
      sharing: 'May involve data processing in EU/US with adequate protections',
      legal_basis: 'Explicit consent for international transfer (NDPR Article 26)'
    }
  ];

  const getConsentIcon = (granted: boolean) => {
    return granted ? (
      <Check className="h-4 w-4 text-green-600" />
    ) : (
      <X className="h-4 w-4 text-red-600" />
    );
  };

  const getConsentColor = (granted: boolean) => {
    return granted ? 'text-green-700 bg-green-50 border-green-200' : 'text-red-700 bg-red-50 border-red-200';
  };

  const handleConsentToggle = (type: keyof ConsentStatus) => {
    if (onConsentChange) {
      onConsentChange(type, !consentStatus[type]);
    }
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-center space-x-2 mb-3">
        <Shield className="h-5 w-5 text-blue-600" />
        <h3 className="text-sm font-medium text-gray-900">Data Usage Consent</h3>
        <div className="flex items-center space-x-1">
          {Object.values(consentStatus).every(Boolean) ? (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <Check className="h-3 w-3 mr-1" />
              All Consents Granted
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Partial Consent
            </span>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {dataUsageInfo.map((info) => {
          const isGranted = consentStatus[info.type];
          return (
            <div key={info.type} className="border border-gray-100 rounded p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getConsentIcon(isGranted)}
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {info.type} Data
                  </span>
                  <button
                    onClick={() => setExpandedInfo(
                      expandedInfo === info.type ? null : info.type
                    )}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <Info className="h-4 w-4" />
                  </button>
                </div>
                
                {onConsentChange && (
                  <button
                    onClick={() => handleConsentToggle(info.type)}
                    className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${
                      isGranted 
                        ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                        : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                    }`}
                  >
                    {isGranted ? 'Revoke' : 'Grant'}
                  </button>
                )}
              </div>

              {expandedInfo === info.type && (
                <div className="mt-3 p-3 bg-gray-50 rounded border text-xs text-gray-600">
                  <div className="space-y-2">
                    <div>
                      <span className="font-medium">Purpose:</span> {info.purpose}
                    </div>
                    <div>
                      <span className="font-medium">Data Retention:</span> {info.retention}
                    </div>
                    <div>
                      <span className="font-medium">Data Sharing:</span> {info.sharing}
                    </div>
                    <div>
                      <span className="font-medium">Legal Basis:</span> {info.legal_basis}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showDetails && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
          <div className="flex items-start space-x-2">
            <Info className="h-4 w-4 text-blue-600 mt-0.5" />
            <div className="text-xs text-blue-700">
              <p className="font-medium mb-1">Your Privacy Rights:</p>
              <ul className="space-y-1">
                <li>• You can withdraw consent at any time</li>
                <li>• Data processing will stop immediately upon withdrawal</li>
                <li>• Previously processed data may be retained for legal compliance</li>
                <li>• You can request data deletion or export at any time</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsentIndicator;