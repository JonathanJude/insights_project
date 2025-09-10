import { AlertTriangle, Clock, Download, Eye, FileText, Shield, Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import usePrivacyControls from '../../hooks/usePrivacyControls';
import ConsentIndicator from './ConsentIndicator';
import PrivacySettingsModal from './PrivacySettingsModal';

interface PrivacyDashboardProps {
  className?: string;
}

const PrivacyDashboard: React.FC<PrivacyDashboardProps> = ({ className = '' }) => {
  const {
    privacySettings,
    consentStatus,
    auditLog,
    isLoading,
    updatePrivacySettings,
    updateConsentStatus,
    exportUserData,
    deleteUserData,
    getDataRetentionPeriod
  } = usePrivacyControls();

  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAuditLog, setShowAuditLog] = useState(false);

  if (isLoading) {
    return (
      <div className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  const handleExportData = () => {
    const userData = exportUserData();
    const blob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `privacy-data-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDeleteData = () => {
    deleteUserData();
    setShowDeleteConfirm(false);
  };

  const privacyScore = () => {
    let score = 0;
    if (privacySettings.anonymization) score += 25;
    if (privacySettings.dataMinimization) score += 25;
    if (privacySettings.geographicPrecision !== 'full') score += 25;
    if (!privacySettings.crossBorderTransfer) score += 25;
    return score;
  };

  const getScoreColor = (score: number) => {
    if (score >= 75) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 50) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const recentAuditEntries = auditLog.slice(-5).reverse();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Privacy Overview */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Shield className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Privacy Dashboard</h2>
          </div>
          
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full border text-sm font-medium ${getScoreColor(privacyScore())}`}>
            <Shield className="h-4 w-4" />
            <span>Privacy Score: {privacyScore()}%</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Eye className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-blue-900">Data Visibility</span>
            </div>
            <p className="text-sm text-blue-700">
              Geographic precision: {privacySettings.geographicPrecision}
            </p>
            <p className="text-sm text-blue-700">
              Anonymization: {privacySettings.anonymization ? 'Enabled' : 'Disabled'}
            </p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="h-5 w-5 text-green-600" />
              <span className="font-medium text-green-900">Data Retention</span>
            </div>
            <p className="text-sm text-green-700">
              Demographic: {getDataRetentionPeriod('demographic')} days
            </p>
            <p className="text-sm text-green-700">
              Geographic: {getDataRetentionPeriod('geographic')} days
            </p>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <FileText className="h-5 w-5 text-purple-600" />
              <span className="font-medium text-purple-900">Audit Trail</span>
            </div>
            <p className="text-sm text-purple-700">
              Total entries: {auditLog.length}
            </p>
            <p className="text-sm text-purple-700">
              Logging: {privacySettings.auditLogging ? 'Active' : 'Disabled'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setShowSettingsModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Shield className="h-4 w-4" />
            <span>Privacy Settings</span>
          </button>
          
          <button
            onClick={handleExportData}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Export My Data</span>
          </button>
          
          <button
            onClick={() => setShowAuditLog(!showAuditLog)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
          >
            <FileText className="h-4 w-4" />
            <span>View Audit Log</span>
          </button>
          
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete My Data</span>
          </button>
        </div>
      </div>

      {/* Consent Status */}
      <ConsentIndicator
        consentStatus={consentStatus}
        onConsentChange={updateConsentStatus}
        showDetails={true}
      />

      {/* Audit Log */}
      {showAuditLog && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {recentAuditEntries.length > 0 ? (
              recentAuditEntries.map((entry, index) => (
                <div key={index} className="border border-gray-100 rounded p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900">
                      {entry.action.replace(/_/g, ' ').toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(entry.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{entry.purpose}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-blue-600">{entry.dataType}</span>
                    <span className="text-xs text-gray-500">{entry.legalBasis}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No recent activity</p>
            )}
          </div>
        </div>
      )}

      {/* Privacy Settings Modal */}
      <PrivacySettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        settings={privacySettings}
        onSettingsChange={updatePrivacySettings}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <AlertTriangle className="h-6 w-6 text-red-600" />
                <h3 className="text-lg font-medium text-gray-900">Delete All Data</h3>
              </div>
              
              <p className="text-sm text-gray-600 mb-6">
                This will permanently delete all your privacy settings, consent records, and audit logs. 
                This action cannot be undone.
              </p>
              
              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteData}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700"
                >
                  Delete All Data
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrivacyDashboard;