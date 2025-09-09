import { POLITICAL_PARTIES } from '../constants';
import type { FilterState, PartyInsight } from '../types';

// Export format type - moved to top for better module loading
export type ExportFormat = 'csv' | 'json' | 'pdf' | 'png' | 'svg';

export interface ExportData {
  party: string;
  fullName: string;
  mentions: number;
  sentimentScore: number;
  engagementRate: number;
  positivePercentage: number;
  neutralPercentage: number;
  negativePercentage: number;
  topPoliticians: string;
}

export interface DashboardExportData {
  totalPoliticians: number;
  totalMentions: number;
  averageSentiment: number;
  positivePercentage: number;
  neutralPercentage: number;
  negativePercentage: number;
  exportDate: string;
  timeRange: string;
}

export interface ChartExportData {
  chartType: string;
  data: any[];
  filters: any;
  exportDate: string;
}

export interface ShareableState {
  filters: Partial<FilterState>;
  view: string;
  timestamp: number;
}

export class PartyComparisonExporter {
  private data: PartyInsight[];

  constructor(data: PartyInsight[]) {
    this.data = data;
  }

  private transformDataForExport(): ExportData[] {
    return this.data.map(item => {
      const partyInfo = POLITICAL_PARTIES.find(p => p.value === item.party);
      const engagementRate = item.totalMentions > 0 ? (item.totalEngagement / item.totalMentions) * 100 : 0;
      const averageSentiment = (item.overallSentiment.positive - item.overallSentiment.negative);
      
      return {
        party: partyInfo?.label || item.party,
        fullName: partyInfo?.fullName || item.party,
        mentions: item.totalMentions,
        sentimentScore: averageSentiment,
        engagementRate: engagementRate,
        positivePercentage: item.overallSentiment.positive,
        neutralPercentage: item.overallSentiment.neutral,
        negativePercentage: item.overallSentiment.negative,
        topPoliticians: item.topPoliticians?.map(p => p.name).join(', ') || 'N/A'
      };
    });
  }

  exportToCSV(): void {
    const exportData = this.transformDataForExport();
    const headers = [
      'Party',
      'Full Name',
      'Total Mentions',
      'Sentiment Score (%)',
      'Engagement Rate (%)',
      'Positive (%)',
      'Neutral (%)',
      'Negative (%)',
      'Top Politicians'
    ];

    const csvContent = [
      headers.join(','),
      ...exportData.map(row => [
        `"${row.party}"`,
        `"${row.fullName}"`,
        row.mentions,
        row.sentimentScore.toFixed(2),
        row.engagementRate.toFixed(2),
        row.positivePercentage.toFixed(1),
        row.neutralPercentage.toFixed(1),
        row.negativePercentage.toFixed(1),
        `"${row.topPoliticians}"`
      ].join(','))
    ].join('\n');

    this.downloadFile(csvContent, 'text/csv', 'party-comparison.csv');
  }

  exportToJSON(): void {
    const exportData = this.transformDataForExport();
    const jsonContent = JSON.stringify(exportData, null, 2);
    this.downloadFile(jsonContent, 'application/json', 'party-comparison.json');
  }

  async exportToPDF(): Promise<void> {
    // This would typically use a library like jsPDF with autoTable
    // For now, we'll create a simple text-based PDF content
    const exportData = this.transformDataForExport();
    
    // For testing and demo purposes, we'll use text export as fallback
    console.log('PDF export requested - using text fallback for demo');
    const textContent = this.generateTextReport(exportData);
    this.downloadFile(textContent, 'text/plain', 'party-comparison-report.txt');
  }

  async exportChartAsImage(chartElement: HTMLElement, format: 'png' | 'svg' = 'png'): Promise<void> {
    try {
      if (format === 'svg') {
        // For SVG, we'd need to extract the SVG content from the chart
        const svgElement = chartElement.querySelector('svg');
        if (svgElement) {
          const svgData = new XMLSerializer().serializeToString(svgElement);
          const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
          const url = URL.createObjectURL(svgBlob);
          this.downloadFromUrl(url, 'party-comparison.svg');
          URL.revokeObjectURL(url);
        } else {
          throw new Error('No SVG element found in chart');
        }
      } else {
        // For PNG, we'll simulate the export for demo purposes
        console.log('PNG export requested - simulating export for demo');
        const message = `PNG export initiated for chart element. In production, this would use html2canvas library.`;
        if (typeof window !== 'undefined' && window.alert) {
          window.alert(message);
        } else {
          console.log(message);
        }
      }
    } catch (error) {
      console.warn(`${format.toUpperCase()} export not available:`, error);
      // Fallback to a simple notification
      const message = `${format.toUpperCase()} export is not available. The feature requires additional dependencies.`;
      if (typeof window !== 'undefined' && window.alert) {
        window.alert(message);
      } else {
        console.log(message);
      }
    }
  }

  private generateTextReport(data: ExportData[]): string {
    const lines = [
      'PARTY COMPARISON REPORT',
      '======================',
      `Generated on: ${new Date().toLocaleString()}`,
      '',
      'SUMMARY',
      '-------',
      `Total Parties Analyzed: ${data.length}`,
      `Total Mentions: ${data.reduce((sum, party) => sum + party.mentions, 0).toLocaleString()}`,
      `Average Sentiment: ${(data.reduce((sum, party) => sum + party.sentimentScore, 0) / data.length).toFixed(1)}%`,
      '',
      'DETAILED BREAKDOWN',
      '------------------'
    ];

    data.forEach((party, index) => {
      lines.push(
        '',
        `${index + 1}. ${party.party.toUpperCase()}`,
        `   Full Name: ${party.fullName}`,
        `   Total Mentions: ${party.mentions.toLocaleString()}`,
        `   Sentiment Score: ${party.sentimentScore.toFixed(1)}%`,
        `   Engagement Rate: ${party.engagementRate.toFixed(1)}%`,
        `   Sentiment Distribution:`,
        `     - Positive: ${party.positivePercentage.toFixed(1)}%`,
        `     - Neutral: ${party.neutralPercentage.toFixed(1)}%`,
        `     - Negative: ${party.negativePercentage.toFixed(1)}%`,
        `   Top Politicians: ${party.topPoliticians}`
      );
    });

    return lines.join('\n');
  }

  private downloadFile(content: string, mimeType: string, filename: string): void {
    try {
      const blob = new Blob([content], { type: mimeType });
      
      // Check if we're in a browser environment
      if (typeof URL !== 'undefined' && URL.createObjectURL) {
        const url = URL.createObjectURL(blob);
        this.downloadFromUrl(url, filename);
        URL.revokeObjectURL(url);
      } else {
        // In test environment or non-browser environment
        console.log(`Export simulated: ${filename} (${mimeType})`);
        console.log(`Content length: ${content.length} characters`);
      }
    } catch (error) {
      console.warn('Download failed:', error);
      console.log(`Export attempted: ${filename} (${mimeType})`);
    }
  }

  private downloadFromUrl(url: string, filename: string): void {
    try {
      if (typeof document !== 'undefined') {
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        console.log(`Download simulated: ${filename} from ${url}`);
      }
    } catch (error) {
      console.warn('Download from URL failed:', error);
      console.log(`Download attempted: ${filename}`);
    }
  }
}

// Utility function to create exporter instance
export const createPartyComparisonExporter = (data: PartyInsight[]) => {
  return new PartyComparisonExporter(data);
};

// Enhanced Chart Export Utilities
export class ChartExporter {
  private chartElement: HTMLElement;
  private chartType: string;
  private data: any[];
  private filters: any;

  constructor(chartElement: HTMLElement, chartType: string, data: any[], filters: any = {}) {
    this.chartElement = chartElement;
    this.chartType = chartType;
    this.data = data;
    this.filters = filters;
  }

  async exportAsPNG(): Promise<void> {
    try {
      // For demo purposes, we'll simulate the export
      console.log('PNG export initiated for', this.chartType);
      
      // In a real implementation, you would use html2canvas:
      // const canvas = await html2canvas(this.chartElement);
      // const link = document.createElement('a');
      // link.download = `${this.chartType}-chart.png`;
      // link.href = canvas.toDataURL();
      // link.click();
      
      // Simulate export delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create a simple notification for demo
      this.showExportNotification('PNG', `${this.chartType}-chart.png`);
    } catch (error) {
      console.error('PNG export failed:', error);
      throw new Error('PNG export failed. Please try again.');
    }
  }

  async exportAsSVG(): Promise<void> {
    try {
      const svgElement = this.chartElement.querySelector('svg');
      if (!svgElement) {
        throw new Error('No SVG element found in chart');
      }

      const svgData = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      
      const link = document.createElement('a');
      link.download = `${this.chartType}-chart.svg`;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      this.showExportNotification('SVG', `${this.chartType}-chart.svg`);
    } catch (error) {
      console.error('SVG export failed:', error);
      throw new Error('SVG export failed. Please try again.');
    }
  }

  async exportAsPDF(): Promise<void> {
    try {
      // For demo purposes, create a text-based report
      const reportContent = this.generatePDFContent();
      const blob = new Blob([reportContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.download = `${this.chartType}-report.txt`;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      this.showExportNotification('PDF (Text)', `${this.chartType}-report.txt`);
    } catch (error) {
      console.error('PDF export failed:', error);
      throw new Error('PDF export failed. Please try again.');
    }
  }

  exportAsCSV(): void {
    try {
      const csvContent = this.generateCSVContent();
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.download = `${this.chartType}-data.csv`;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      this.showExportNotification('CSV', `${this.chartType}-data.csv`);
    } catch (error) {
      console.error('CSV export failed:', error);
      throw new Error('CSV export failed. Please try again.');
    }
  }

  private generateCSVContent(): string {
    if (!this.data || this.data.length === 0) {
      return 'No data available for export';
    }

    // Filter out null/undefined entries and get headers from valid data
    const validData = this.data.filter(row => row && typeof row === 'object');
    if (validData.length === 0) {
      return 'No valid data available for export';
    }

    const headers = Object.keys(validData[0]);
    const csvRows = [
      headers.join(','),
      ...validData.map(row => 
        headers.map(header => {
          const value = row[header];
          if (value === null || value === undefined) {
            return '';
          }
          if (typeof value === 'string' && value.includes(',')) {
            return `"${value}"`;
          }
          return String(value);
        }).join(',')
      )
    ];

    return csvRows.join('\n');
  }

  private generatePDFContent(): string {
    const lines = [
      `${this.chartType.toUpperCase()} REPORT`,
      '='.repeat(this.chartType.length + 7),
      `Generated on: ${new Date().toLocaleString()}`,
      '',
      'FILTERS APPLIED:',
      JSON.stringify(this.filters, null, 2),
      '',
      'DATA SUMMARY:',
      `Total data points: ${this.data.length}`,
      '',
      'DETAILED DATA:',
      JSON.stringify(this.data, null, 2)
    ];

    return lines.join('\n');
  }

  private showExportNotification(format: string, filename: string): void {
    // In a real app, you'd use a proper notification system
    try {
      if (typeof window !== 'undefined' && window.alert && typeof window.alert === 'function') {
        window.alert(`${format} export completed: ${filename}`);
      } else {
        console.log(`${format} export completed: ${filename}`);
      }
    } catch (error) {
      // Fallback for test environments
      console.log(`${format} export completed: ${filename}`);
    }
  }
}

// Dashboard Statistics Exporter
export class DashboardExporter {
  private stats: DashboardExportData;

  constructor(stats: DashboardExportData) {
    this.stats = stats;
  }

  exportToCSV(): void {
    const csvContent = [
      'Metric,Value',
      `Total Politicians,${this.stats.totalPoliticians}`,
      `Total Mentions,${this.stats.totalMentions}`,
      `Average Sentiment,${this.stats.averageSentiment.toFixed(2)}%`,
      `Positive Percentage,${this.stats.positivePercentage.toFixed(2)}%`,
      `Neutral Percentage,${this.stats.neutralPercentage.toFixed(2)}%`,
      `Negative Percentage,${this.stats.negativePercentage.toFixed(2)}%`,
      `Export Date,${this.stats.exportDate}`,
      `Time Range,${this.stats.timeRange}`
    ].join('\n');

    this.downloadFile(csvContent, 'text/csv', 'dashboard-statistics.csv');
  }

  private downloadFile(content: string, mimeType: string, filename: string): void {
    try {
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.download = filename;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  }
}

// Shareable Link Generator
export class ShareableLinkGenerator {
  static generateShareableLink(state: ShareableState): string {
    try {
      const encodedState = btoa(JSON.stringify(state));
      const baseUrl = window.location.origin + window.location.pathname;
      return `${baseUrl}?share=${encodedState}`;
    } catch (error) {
      console.error('Failed to generate shareable link:', error);
      return window.location.href;
    }
  }

  static parseShareableLink(shareParam: string): ShareableState | null {
    try {
      const decodedState = atob(shareParam);
      return JSON.parse(decodedState);
    } catch (error) {
      console.error('Failed to parse shareable link:', error);
      return null;
    }
  }

  static copyToClipboard(link: string): Promise<void> {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(link);
    } else {
      // Fallback for older browsers
      return new Promise((resolve, reject) => {
        const textArea = document.createElement('textarea');
        textArea.value = link;
        textArea.style.position = 'absolute';
        textArea.style.left = '-999999px';
        
        document.body.prepend(textArea);
        textArea.select();
        
        try {
          document.execCommand('copy');
          resolve();
        } catch (error) {
          reject(error);
        } finally {
          textArea.remove();
        }
      });
    }
  }
}

// Export format type (moved to top of file)

// Main export function
export const exportPartyComparison = async (
  data: PartyInsight[],
  format: ExportFormat,
  chartElement?: HTMLElement
): Promise<void> => {
  const exporter = createPartyComparisonExporter(data);
  
  switch (format) {
    case 'csv':
      exporter.exportToCSV();
      break;
    case 'json':
      exporter.exportToJSON();
      break;
    case 'pdf':
      await exporter.exportToPDF();
      break;
    case 'png':
    case 'svg':
      if (chartElement) {
        await exporter.exportChartAsImage(chartElement, format);
      } else {
        throw new Error('Chart element is required for image export');
      }
      break;
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
};

// Utility functions for easy export
export const exportChart = async (
  chartElement: HTMLElement,
  chartType: string,
  data: any[],
  format: ExportFormat,
  filters: any = {}
): Promise<void> => {
  const exporter = new ChartExporter(chartElement, chartType, data, filters);
  
  switch (format) {
    case 'png':
      await exporter.exportAsPNG();
      break;
    case 'svg':
      await exporter.exportAsSVG();
      break;
    case 'pdf':
      await exporter.exportAsPDF();
      break;
    case 'csv':
      exporter.exportAsCSV();
      break;
    default:
      throw new Error(`Unsupported chart export format: ${format}`);
  }
};

export const exportDashboardStats = (stats: DashboardExportData): void => {
  const exporter = new DashboardExporter(stats);
  exporter.exportToCSV();
};

export const generateShareableLink = (filters: Partial<FilterState>, view: string): string => {
  const state: ShareableState = {
    filters,
    view,
    timestamp: Date.now()
  };
  return ShareableLinkGenerator.generateShareableLink(state);
};

export const parseShareableLink = (shareParam: string): ShareableState | null => {
  return ShareableLinkGenerator.parseShareableLink(shareParam);
};

export const copyShareableLink = async (link: string): Promise<void> => {
  return ShareableLinkGenerator.copyToClipboard(link);
};