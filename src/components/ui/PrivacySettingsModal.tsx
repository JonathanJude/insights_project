import { Check, Info, Shield, X } from 'lucide-react';
import React, { useState } from 'react';

interface PrivacySettings {
  demographicConsent: boolean;
  geographicPrecision: 'full' | 'state' | 'country' | 'none';
  dataMinimization: boolean;
  anonymization: boolean;
  crossBorderTransfer: boolean;
  auditLogging: boolean;
}

interface PrivacySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: PrivacySettings;
  onSettingsChange: (settings: PrivacySettings) => void;
}

const PrivacySettingsModal: React.FC<PrivacySettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSettingsChange
}) => {
  const [localSettings, setLocalSettings] = useState<PrivacySettings>(settings);
  const [showDetails, setShowDetails] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSave = () => {
    onSettingsChange(localSettings);
    onClose();
  };

  const updateSetting = <K extends keyof PrivacySettings>(
    key: K,
    value: PrivacySettings[K]
  ) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  const privacyOptions = [
    {
      id: 'demographicConsent',
      title: 'Demographic Data Processing',
      description: 'Allow analysis of age, education, occupation, and gender data',
      type: 'boolean' as const,
      value: localSettings.demographicConsent,
      details: 'This enables demographic inference from social media activity. You can opt out at any time.',
      compliance: 'NDPR Article 7 - Consent'
    },
    {
      id: 'geographicPrecision',
      title: 'Geographic Data Precision',
      description: 'Control the level of geographic detail displayed',
      type: 'select' as const,
      value: localSettings.geographicPrecision,
      options: [
        { value: 'full', label: 'Full Precision (Polling Unit)' },
        { value: 'state', label: 'State Level Only' },
        { value: 'country', label: 'Country Level Only' },
        { value: 'none', label: 'No Geographic Data' }
      ],
      details: 'Higher precision may reveal more specific location patterns but reduces privacy.',
      compliance: 'NDPR Article 25 - Data Protection by Design'
    },
    {
      id: 'dataMinimization',
      title: 'Data Minimization',
      description: 'Only process essential data for analysis',
      type: 'boolean' as const,
      value: localSettings.dataMinimization,
      details: 'Limits data collection to what is strictly necessary for the analysis purpose.',
      compliance: 'NDPR Article 5(1)(c) - Data Minimization'
    },
    {
      id: 'anonymization',
      title: 'Automatic Anonymization',
      description: 'Remove personally identifiable information from analysis',
      type: 'boolean' as const,
      value: localSettings.anonymization,
      details: 'Automatically anonymizes data to protect individual privacy while maintaining analytical value.',
      compliance: 'NDPR Article 4(5) - Pseudonymisation'
    },
    {
      id: 'crossBorderTransfer',
      title: 'Cross-Border Data Transfer',
      description: 'Allow data processing outside Nigeria',
      type: 'boolean' as const,
      value: localSettings.crossBorderTransfer,
      details: 'Enables analysis of international content but may involve data transfer to other countries.',
      compliance: 'NDPR Article 26 - International Transfer'
    },
    {
      id: 'auditLogging',
      title: 'Audit Trail Logging',
      description: 'Maintain logs of data processing activities',
      type: 'boolean' as const,
      value: localSettings.auditLogging,
      details: 'Creates detailed logs of all data processing for compliance and transparency.',
      compliance: 'NDPR Article 30 - Records of Processing'
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-2">
            <Shield className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Privacy Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-blue-900">
                    Data Privacy & Compliance
                  </h3>
                  <p className="text-sm text-blue-700 mt-1">
                    These settings control how your data is processed in compliance with the 
                    Nigeria Data Protection Regulation (NDPR) and international privacy standards.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {privacyOptions.map((option) => (
              <div key={option.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm font-medium text-gray-900">
                        {option.title}
                      </h3>
                      <button
                        onClick={() => setShowDetails(
                          showDetails === option.id ? null : option.id
                        )}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <Info className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {option.description}
                    </p>
                    
                    {showDetails === option.id && (
                      <div className="mt-3 p-3 bg-gray-50 rounded border">
                        <p className="text-xs text-gray-700 mb-2">
                          {option.details}
                        </p>
                        <p className="text-xs text-blue-600 font-medium">
                          {option.compliance}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="ml-4">
                    {option.type === 'boolean' ? (
                      <button
                        onClick={() => updateSetting(
                          option.id as keyof PrivacySettings,
                          !option.value as any
                        )}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          option.value ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            option.value ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    ) : (
                      <select
                        value={option.value as string}
                        onChange={(e) => updateSetting(
                          option.id as keyof PrivacySettings,
                          e.target.value as any
                        )}
                        className="text-sm border border-gray-300 rounded px-2 py-1"
                      >
                        {option.options?.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Shield className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-yellow-900">
                  Your Rights
                </h3>
                <ul className="text-sm text-yellow-700 mt-1 space-y-1">
                  <li>• Right to access your personal data</li>
                  <li>• Right to rectification of inaccurate data</li>
                  <li>• Right to erasure ("right to be forgotten")</li>
                  <li>• Right to data portability</li>
                  <li>• Right to object to processing</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Check className="h-4 w-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrivacySettingsModal;