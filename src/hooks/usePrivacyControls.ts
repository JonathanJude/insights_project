import { useCallback, useEffect, useState } from 'react';

interface PrivacySettings {
  demographicConsent: boolean;
  geographicPrecision: 'full' | 'state' | 'country' | 'none';
  dataMinimization: boolean;
  anonymization: boolean;
  crossBorderTransfer: boolean;
  auditLogging: boolean;
}

interface ConsentStatus {
  demographic: boolean;
  geographic: boolean;
  sentiment: boolean;
  crossBorder: boolean;
}

interface AuditLogEntry {
  timestamp: string;
  action: string;
  dataType: string;
  purpose: string;
  legalBasis: string;
  userId?: string;
}

const DEFAULT_PRIVACY_SETTINGS: PrivacySettings = {
  demographicConsent: false,
  geographicPrecision: 'state',
  dataMinimization: true,
  anonymization: true,
  crossBorderTransfer: false,
  auditLogging: true
};

const DEFAULT_CONSENT_STATUS: ConsentStatus = {
  demographic: false,
  geographic: true,
  sentiment: true,
  crossBorder: false
};

export const usePrivacyControls = () => {
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>(DEFAULT_PRIVACY_SETTINGS);
  const [consentStatus, setConsentStatus] = useState<ConsentStatus>(DEFAULT_CONSENT_STATUS);
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load privacy settings from localStorage on mount
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('privacy_settings');
      const savedConsent = localStorage.getItem('consent_status');
      const savedAuditLog = localStorage.getItem('audit_log');

      if (savedSettings) {
        setPrivacySettings(JSON.parse(savedSettings));
      }
      if (savedConsent) {
        setConsentStatus(JSON.parse(savedConsent));
      }
      if (savedAuditLog) {
        setAuditLog(JSON.parse(savedAuditLog));
      }
    } catch (error) {
      console.error('Error loading privacy settings:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save privacy settings to localStorage whenever they change
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('privacy_settings', JSON.stringify(privacySettings));
    }
  }, [privacySettings, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('consent_status', JSON.stringify(consentStatus));
    }
  }, [consentStatus, isLoading]);

  useEffect(() => {
    if (!isLoading && auditLog.length > 0) {
      localStorage.setItem('audit_log', JSON.stringify(auditLog.slice(-100))); // Keep last 100 entries
    }
  }, [auditLog, isLoading]);

  const logAuditEntry = useCallback((
    action: string,
    dataType: string,
    purpose: string,
    legalBasis: string
  ) => {
    if (privacySettings.auditLogging) {
      const entry: AuditLogEntry = {
        timestamp: new Date().toISOString(),
        action,
        dataType,
        purpose,
        legalBasis,
        userId: 'anonymous' // In a real app, this would be the actual user ID
      };
      setAuditLog(prev => [...prev, entry]);
    }
  }, [privacySettings.auditLogging]);

  const updatePrivacySettings = useCallback((newSettings: Partial<PrivacySettings>) => {
    setPrivacySettings(prev => {
      const updated = { ...prev, ...newSettings };
      
      // Log the privacy settings change
      logAuditEntry(
        'privacy_settings_updated',
        'privacy_configuration',
        'User updated privacy preferences',
        'NDPR Article 7 - Consent'
      );
      
      return updated;
    });
  }, [logAuditEntry]);

  const updateConsentStatus = useCallback((
    type: keyof ConsentStatus,
    granted: boolean
  ) => {
    setConsentStatus(prev => {
      const updated = { ...prev, [type]: granted };
      
      // Log the consent change
      logAuditEntry(
        granted ? 'consent_granted' : 'consent_revoked',
        type,
        `User ${granted ? 'granted' : 'revoked'} consent for ${type} data processing`,
        granted ? 'NDPR Article 7 - Consent' : 'NDPR Article 7(3) - Withdrawal of Consent'
      );
      
      return updated;
    });
  }, [logAuditEntry]);

  const processDataWithPrivacy = useCallback(<T extends Record<string, any>>(
    data: T[],
    dataType: 'demographic' | 'geographic' | 'sentiment'
  ): T[] => {
    // Log data processing
    logAuditEntry(
      'data_processed',
      dataType,
      `Processing ${dataType} data for analysis`,
      'NDPR Article 6 - Legitimate Interest'
    );

    // Apply privacy settings to data
    if (!consentStatus[dataType] && dataType !== 'sentiment') {
      return []; // Return empty array if consent not granted
    }

    let processedData = [...data];

    // Apply anonymization if enabled
    if (privacySettings.anonymization) {
      processedData = processedData.map(item => ({
        ...item,
        id: `anon_${Math.random().toString(36).substr(2, 9)}`,
        // Remove or anonymize sensitive fields
        name: item.name ? 'Anonymous User' : item.name,
        email: undefined,
        phone: undefined
      }));
    }

    // Apply geographic precision limits
    if (dataType === 'geographic' && privacySettings.geographicPrecision !== 'full') {
      processedData = processedData.map(item => {
        const geographic = { ...item.geographic };
        
        switch (privacySettings.geographicPrecision) {
          case 'country':
            geographic.state = undefined;
            geographic.lga = undefined;
            geographic.ward = undefined;
            geographic.pollingUnit = undefined;
            break;
          case 'state':
            geographic.lga = undefined;
            geographic.ward = undefined;
            geographic.pollingUnit = undefined;
            break;
          case 'none':
            return { ...item, geographic: undefined };
        }
        
        return { ...item, geographic };
      });
    }

    // Apply data minimization
    if (privacySettings.dataMinimization) {
      processedData = processedData.map(item => {
        // Remove non-essential fields
        const { metadata, internalId, debugInfo, ...essential } = item;
        return essential;
      });
    }

    return processedData;
  }, [consentStatus, privacySettings, logAuditEntry]);

  const canProcessCrossBorderData = useCallback(() => {
    return consentStatus.crossBorder && privacySettings.crossBorderTransfer;
  }, [consentStatus.crossBorder, privacySettings.crossBorderTransfer]);

  const getDataRetentionPeriod = useCallback((dataType: string) => {
    const retentionPeriods = {
      demographic: privacySettings.dataMinimization ? 30 : 90, // days
      geographic: 365, // days
      sentiment: 365, // days
      audit: 2555 // 7 years for compliance
    };
    return retentionPeriods[dataType as keyof typeof retentionPeriods] || 90;
  }, [privacySettings.dataMinimization]);

  const exportUserData = useCallback(() => {
    const userData = {
      privacySettings,
      consentStatus,
      auditLog: auditLog.slice(-50), // Last 50 entries
      exportDate: new Date().toISOString(),
      dataRetentionPeriods: {
        demographic: getDataRetentionPeriod('demographic'),
        geographic: getDataRetentionPeriod('geographic'),
        sentiment: getDataRetentionPeriod('sentiment')
      }
    };

    logAuditEntry(
      'data_exported',
      'user_data',
      'User requested data export',
      'NDPR Article 20 - Right to Data Portability'
    );

    return userData;
  }, [privacySettings, consentStatus, auditLog, getDataRetentionPeriod, logAuditEntry]);

  const deleteUserData = useCallback(() => {
    // Clear all stored data
    localStorage.removeItem('privacy_settings');
    localStorage.removeItem('consent_status');
    localStorage.removeItem('audit_log');
    
    // Reset to defaults
    setPrivacySettings(DEFAULT_PRIVACY_SETTINGS);
    setConsentStatus(DEFAULT_CONSENT_STATUS);
    setAuditLog([]);

    // Log the deletion (this will be the last entry)
    logAuditEntry(
      'data_deleted',
      'all_user_data',
      'User requested data deletion',
      'NDPR Article 17 - Right to Erasure'
    );
  }, [logAuditEntry]);

  return {
    privacySettings,
    consentStatus,
    auditLog,
    isLoading,
    updatePrivacySettings,
    updateConsentStatus,
    processDataWithPrivacy,
    canProcessCrossBorderData,
    getDataRetentionPeriod,
    exportUserData,
    deleteUserData,
    logAuditEntry
  };
};

export default usePrivacyControls;