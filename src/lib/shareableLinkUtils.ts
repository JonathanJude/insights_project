/**
 * Enhanced Shareable Link Utilities for Multi-Dimensional Analysis
 * 
 * Generates and manages shareable links that preserve multi-dimensional filter states,
 * analysis views, and user preferences for collaborative analysis.
 */

import type { FilterState } from '../types';

// Enhanced shareable state interface
export interface EnhancedShareableState {
  // Filter states
  filters: Partial<FilterState>;
  
  // Multi-dimensional filter states
  multiDimensionalFilters: {
    geographic: {
      countries: string[];
      states: string[];
      lgas: string[];
      wards: string[];
      pollingUnits: string[];
      confidenceThreshold: number;
    };
    demographic: {
      education: string[];
      occupation: string[];
      ageRanges: [number, number];
      gender: string[];
      confidenceThreshold: number;
    };
    sentiment: {
      polarity: string[];
      emotions: string[];
      intensityRange: [number, number];
      complexity: string[];
      modelAgreementThreshold: number;
    };
    topics: {
      policyAreas: string[];
      campaignIssues: string[];
      events: string[];
      trendingThreshold: number;
    };
    engagement: {
      levels: string[];
      viralityThreshold: number;
      qualityThreshold: number;
      influencerAmplification: boolean;
    };
    temporal: {
      timeBlocks: string[];
      daysOfWeek: string[];
      electionPhases: string[];
    };
  };
  
  // View configuration
  view: {
    page: string;
    chartType?: string;
    selectedPoliticians?: string[];
    selectedParties?: string[];
    timeRange?: string;
    analysisMode?: 'overview' | 'detailed' | 'comparative';
  };
  
  // Display preferences
  preferences: {
    showConfidenceScores: boolean;
    showDataQuality: boolean;
    showUndefinedData: boolean;
    chartTheme: 'light' | 'dark' | 'auto';
    compactMode: boolean;
  };
  
  // Metadata
  metadata: {
    timestamp: number;
    version: string;
    title?: string;
    description?: string;
    createdBy?: string;
    expiresAt?: number;
  };
}

// Link generation options
export interface ShareableLinkOptions {
  includeFilters?: boolean;
  includePreferences?: boolean;
  includeMetadata?: boolean;
  customTitle?: string;
  customDescription?: string;
  expirationHours?: number;
  compress?: boolean;
}

/**
 * Enhanced Shareable Link Generator
 */
export class EnhancedShareableLinkGenerator {
  private static readonly VERSION = '2.0.0';
  private static readonly MAX_URL_LENGTH = 2000; // Browser URL length limit
  
  /**
   * Generate a shareable link with multi-dimensional state
   */
  static generateShareableLink(
    state: Partial<EnhancedShareableState>,
    options: ShareableLinkOptions = {}
  ): string {
    try {
      const {
        includeFilters = true,
        includePreferences = true,
        includeMetadata = true,
        customTitle,
        customDescription,
        expirationHours = 24 * 7, // 1 week default
        compress = true
      } = options;

      // Build complete state object
      const completeState: EnhancedShareableState = {
        filters: includeFilters ? (state.filters || {}) : {},
        multiDimensionalFilters: includeFilters ? (state.multiDimensionalFilters || this.getDefaultMultiDimensionalFilters()) : this.getDefaultMultiDimensionalFilters(),
        view: state.view || { page: 'dashboard' },
        preferences: includePreferences ? (state.preferences || this.getDefaultPreferences()) : this.getDefaultPreferences(),
        metadata: {
          timestamp: Date.now(),
          version: this.VERSION,
          title: customTitle,
          description: customDescription,
          expiresAt: expirationHours > 0 ? Date.now() + (expirationHours * 60 * 60 * 1000) : undefined,
          ...(includeMetadata ? (state.metadata || {}) : {})
        }
      };

      // Serialize and encode
      let encodedState: string;
      if (compress) {
        encodedState = this.compressAndEncode(completeState);
      } else {
        encodedState = btoa(JSON.stringify(completeState));
      }

      // Generate URL
      const baseUrl = this.getBaseUrl();
      const shareableUrl = `${baseUrl}?share=${encodedState}`;

      // Check URL length and compress if necessary
      if (shareableUrl.length > this.MAX_URL_LENGTH && !compress) {
        console.warn('URL too long, applying compression...');
        const compressedState = this.compressAndEncode(completeState);
        return `${baseUrl}?share=${compressedState}`;
      }

      if (shareableUrl.length > this.MAX_URL_LENGTH) {
        throw new Error('Shareable link too long even after compression');
      }

      return shareableUrl;
    } catch (error) {
      console.error('Failed to generate shareable link:', error);
      return this.getBaseUrl(); // Fallback to base URL
    }
  }

  /**
   * Parse a shareable link and extract state
   */
  static parseShareableLink(shareParam: string): EnhancedShareableState | null {
    try {
      let decodedState: string;
      
      // Try to decompress first (for compressed links)
      try {
        decodedState = this.decompressAndDecode(shareParam);
      } catch {
        // Fallback to simple base64 decode
        decodedState = atob(shareParam);
      }

      const state = JSON.parse(decodedState) as EnhancedShareableState;

      // Validate version compatibility
      if (state.metadata?.version && !this.isVersionCompatible(state.metadata.version)) {
        console.warn(`Shareable link version ${state.metadata.version} may not be fully compatible with current version ${this.VERSION}`);
      }

      // Check expiration
      if (state.metadata?.expiresAt && Date.now() > state.metadata.expiresAt) {
        console.warn('Shareable link has expired');
        return null;
      }

      // Validate and sanitize state
      return this.validateAndSanitizeState(state);
    } catch (error) {
      console.error('Failed to parse shareable link:', error);
      return null;
    }
  }

  /**
   * Generate a short shareable link (would typically use a URL shortener service)
   */
  static async generateShortLink(
    state: Partial<EnhancedShareableState>,
    options: ShareableLinkOptions = {}
  ): Promise<string> {
    try {
      const fullLink = this.generateShareableLink(state, options);
      
      // In a real implementation, this would call a URL shortener service
      // For now, we'll simulate it with a hash-based approach
      const hash = this.generateHash(fullLink);
      const shortCode = hash.substring(0, 8);
      
      // Store the mapping (in a real app, this would be in a database)
      this.storeShortLinkMapping(shortCode, fullLink);
      
      return `${this.getBaseUrl()}/s/${shortCode}`;
    } catch (error) {
      console.error('Failed to generate short link:', error);
      throw new Error('Failed to generate short link');
    }
  }

  /**
   * Copy shareable link to clipboard
   */
  static async copyToClipboard(link: string): Promise<void> {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(link);
      } else {
        // Fallback for older browsers or non-secure contexts
        const textArea = document.createElement('textarea');
        textArea.value = link;
        textArea.style.position = 'absolute';
        textArea.style.left = '-999999px';
        
        document.body.prepend(textArea);
        textArea.select();
        
        try {
          document.execCommand('copy');
        } catch (error) {
          throw new Error('Failed to copy to clipboard');
        } finally {
          textArea.remove();
        }
      }
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      throw new Error('Failed to copy link to clipboard');
    }
  }

  /**
   * Generate QR code for shareable link (would typically use a QR code library)
   */
  static generateQRCode(link: string): string {
    // In a real implementation, this would use a QR code library like qrcode
    // For now, we'll return a placeholder data URL
    const qrData = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(link)}`;
    return qrData;
  }

  /**
   * Get link analytics (would typically track usage)
   */
  static getLinkAnalytics(shareParam: string): {
    views: number;
    uniqueViews: number;
    lastAccessed: Date | null;
    createdAt: Date | null;
    expiresAt: Date | null;
  } {
    // In a real implementation, this would fetch from analytics service
    return {
      views: 0,
      uniqueViews: 0,
      lastAccessed: null,
      createdAt: null,
      expiresAt: null
    };
  }

  /**
   * Validate email for sharing
   */
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Share via email (would typically integrate with email service)
   */
  static shareViaEmail(
    link: string,
    recipientEmail: string,
    subject?: string,
    message?: string
  ): void {
    if (!this.validateEmail(recipientEmail)) {
      throw new Error('Invalid email address');
    }

    const defaultSubject = 'Multi-Dimensional Political Analysis - Shared Link';
    const defaultMessage = `I've shared a multi-dimensional political analysis with you. Click the link below to view:\n\n${link}`;

    const mailtoUrl = `mailto:${recipientEmail}?subject=${encodeURIComponent(subject || defaultSubject)}&body=${encodeURIComponent(message || defaultMessage)}`;
    
    if (typeof window !== 'undefined') {
      window.location.href = mailtoUrl;
    }
  }

  /**
   * Share via social media
   */
  static shareViaSocial(
    platform: 'twitter' | 'facebook' | 'linkedin' | 'whatsapp',
    link: string,
    title?: string,
    description?: string
  ): void {
    const defaultTitle = 'Multi-Dimensional Political Analysis';
    const defaultDescription = 'Explore comprehensive political sentiment analysis with geographic, demographic, and temporal insights.';

    const shareTitle = title || defaultTitle;
    const shareDescription = description || defaultDescription;

    let shareUrl: string;

    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(link)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}&quote=${encodeURIComponent(shareDescription)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(link)}&title=${encodeURIComponent(shareTitle)}&summary=${encodeURIComponent(shareDescription)}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(`${shareTitle}\n${shareDescription}\n${link}`)}`;
        break;
      default:
        throw new Error(`Unsupported social platform: ${platform}`);
    }

    if (typeof window !== 'undefined') {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  }

  // Private helper methods

  private static getDefaultMultiDimensionalFilters() {
    return {
      geographic: {
        countries: [],
        states: [],
        lgas: [],
        wards: [],
        pollingUnits: [],
        confidenceThreshold: 0.6
      },
      demographic: {
        education: [],
        occupation: [],
        ageRanges: [18, 65] as [number, number],
        gender: [],
        confidenceThreshold: 0.6
      },
      sentiment: {
        polarity: [],
        emotions: [],
        intensityRange: [0, 1] as [number, number],
        complexity: [],
        modelAgreementThreshold: 0.7
      },
      topics: {
        policyAreas: [],
        campaignIssues: [],
        events: [],
        trendingThreshold: 0.5
      },
      engagement: {
        levels: [],
        viralityThreshold: 0.5,
        qualityThreshold: 0.6,
        influencerAmplification: false
      },
      temporal: {
        timeBlocks: [],
        daysOfWeek: [],
        electionPhases: []
      }
    };
  }

  private static getDefaultPreferences() {
    return {
      showConfidenceScores: true,
      showDataQuality: true,
      showUndefinedData: true,
      chartTheme: 'auto' as const,
      compactMode: false
    };
  }

  private static getBaseUrl(): string {
    if (typeof window !== 'undefined') {
      return `${window.location.protocol}//${window.location.host}${window.location.pathname}`;
    }
    return 'https://localhost:3000'; // Fallback for server-side
  }

  private static compressAndEncode(state: EnhancedShareableState): string {
    // Simple compression by removing default values and minifying JSON
    const minified = this.minifyState(state);
    const jsonString = JSON.stringify(minified);
    
    // In a real implementation, you might use a compression library like pako
    // For now, we'll just use base64 encoding
    return btoa(jsonString);
  }

  private static decompressAndDecode(encoded: string): string {
    // In a real implementation, this would decompress using the same library
    return atob(encoded);
  }

  private static minifyState(state: EnhancedShareableState): any {
    // Remove default values to reduce size
    const minified: any = {};

    // Only include non-empty filters
    if (Object.keys(state.filters).length > 0) {
      minified.f = state.filters;
    }

    // Only include non-default multi-dimensional filters
    const defaultMD = this.getDefaultMultiDimensionalFilters();
    const mdFilters: any = {};
    
    Object.entries(state.multiDimensionalFilters).forEach(([key, value]) => {
      const defaultValue = defaultMD[key as keyof typeof defaultMD];
      if (JSON.stringify(value) !== JSON.stringify(defaultValue)) {
        mdFilters[key] = value;
      }
    });
    
    if (Object.keys(mdFilters).length > 0) {
      minified.md = mdFilters;
    }

    // Always include view
    minified.v = state.view;

    // Only include non-default preferences
    const defaultPrefs = this.getDefaultPreferences();
    const prefs: any = {};
    
    Object.entries(state.preferences).forEach(([key, value]) => {
      if (value !== defaultPrefs[key as keyof typeof defaultPrefs]) {
        prefs[key] = value;
      }
    });
    
    if (Object.keys(prefs).length > 0) {
      minified.p = prefs;
    }

    // Include essential metadata
    minified.m = {
      t: state.metadata.timestamp,
      v: state.metadata.version,
      ...(state.metadata.title && { title: state.metadata.title }),
      ...(state.metadata.expiresAt && { exp: state.metadata.expiresAt })
    };

    return minified;
  }

  private static isVersionCompatible(version: string): boolean {
    const [major] = version.split('.').map(Number);
    const [currentMajor] = this.VERSION.split('.').map(Number);
    return major === currentMajor;
  }

  private static validateAndSanitizeState(state: any): EnhancedShareableState {
    // Expand minified state back to full format
    const expanded: EnhancedShareableState = {
      filters: state.f || {},
      multiDimensionalFilters: {
        ...this.getDefaultMultiDimensionalFilters(),
        ...(state.md || {})
      },
      view: state.v || { page: 'dashboard' },
      preferences: {
        ...this.getDefaultPreferences(),
        ...(state.p || {})
      },
      metadata: {
        timestamp: state.m?.t || Date.now(),
        version: state.m?.v || this.VERSION,
        title: state.m?.title,
        expiresAt: state.m?.exp
      }
    };

    // Validate and sanitize values
    // Add validation logic here as needed

    return expanded;
  }

  private static generateHash(input: string): string {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  private static storeShortLinkMapping(shortCode: string, fullLink: string): void {
    // In a real implementation, this would store in a database
    // For now, we'll use localStorage as a demo
    if (typeof localStorage !== 'undefined') {
      const mappings = JSON.parse(localStorage.getItem('shortLinkMappings') || '{}');
      mappings[shortCode] = {
        fullLink,
        createdAt: Date.now()
      };
      localStorage.setItem('shortLinkMappings', JSON.stringify(mappings));
    }
  }
}

// Utility functions for easy access
export const generateShareableLink = (
  state: Partial<EnhancedShareableState>,
  options?: ShareableLinkOptions
): string => {
  return EnhancedShareableLinkGenerator.generateShareableLink(state, options);
};

export const parseShareableLink = (shareParam: string): EnhancedShareableState | null => {
  return EnhancedShareableLinkGenerator.parseShareableLink(shareParam);
};

export const copyShareableLink = async (link: string): Promise<void> => {
  return EnhancedShareableLinkGenerator.copyToClipboard(link);
};

export const shareViaEmail = (
  link: string,
  email: string,
  subject?: string,
  message?: string
): void => {
  return EnhancedShareableLinkGenerator.shareViaEmail(link, email, subject, message);
};

export const shareViaSocial = (
  platform: 'twitter' | 'facebook' | 'linkedin' | 'whatsapp',
  link: string,
  title?: string,
  description?: string
): void => {
  return EnhancedShareableLinkGenerator.shareViaSocial(platform, link, title, description);
};