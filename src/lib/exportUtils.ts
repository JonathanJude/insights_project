import { POLITICAL_PARTIES } from '../constants';
import type { PartyInsight } from '../types';

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

// Export format type
export type ExportFormat = 'csv' | 'json' | 'pdf' | 'png' | 'svg';

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