/**
 * Multi-Dimensional Export Utilities
 * 
 * Enhanced export functionality for multi-dimensional sentiment analysis data
 * including geographic, demographic, sentiment, topic, engagement, and temporal data
 */

import type { FilterState } from '../types';
import type { EnhancedPoliticianData } from './enhancedMockDataService';

// Enhanced export formats
export type MultiDimensionalExportFormat = 'csv' | 'json' | 'pdf' | 'png' | 'svg' | 'xlsx';

// Multi-dimensional export data interfaces
export interface MultiDimensionalExportData {
  politician: {
    id: string;
    name: string;
    party: string;
    position: string;
    state: string;
  };
  geographic: {
    country: string;
    state: string;
    lga: string;
    ward: string;
    pollingUnit: string;
    confidence: number;
  };
  demographic: {
    education: string;
    occupation: string;
    ageGroup: string;
    gender: string;
    confidence: number;
  };
  sentiment: {
    polarity: string;
    polarityScore: number;
    primaryEmotion: string;
    emotionScores: Record<string, number>;
    intensity: string;
    intensityScore: number;
    complexity: string;
    modelAgreement: number;
  };
  topics: {
    primaryPolicyArea: string;
    campaignIssues: string[];
    eventTypes: string[];
    trendingScore: number;
  };
  engagement: {
    level: string;
    viralityScore: number;
    qualityScore: number;
    influencerAmplification: boolean;
  };
  temporal: {
    peakHours: string[];
    activeDays: string[];
    electionPhase: string;
  };
  dataQuality: {
    completeness: number;
    confidence: number;
    lastUpdated: string;
  };
}

export interface ExportMetadata {
  exportDate: string;
  exportTime: string;
  dataRange: string;
  filtersApplied: Partial<FilterState>;
  totalRecords: number;
  dataQualityScore: number;
  confidenceThreshold: number;
  undefinedDataPercentage: number;
}

export interface ExportProgress {
  stage: 'preparing' | 'processing' | 'generating' | 'downloading' | 'complete' | 'error';
  progress: number; // 0-100
  message: string;
  estimatedTimeRemaining?: number;
}

/**
 * Multi-Dimensional Data Exporter
 */
export class MultiDimensionalExporter {
  private data: EnhancedPoliticianData[];
  private filters: Partial<FilterState>;
  private metadata: ExportMetadata;
  private progressCallback?: (progress: ExportProgress) => void;

  constructor(
    data: EnhancedPoliticianData[],
    filters: Partial<FilterState> = {},
    progressCallback?: (progress: ExportProgress) => void
  ) {
    this.data = data;
    this.filters = filters;
    this.progressCallback = progressCallback;
    this.metadata = this.generateMetadata();
  }

  /**
   * Export data in specified format with metadata
   */
  async exportData(format: MultiDimensionalExportFormat): Promise<void> {
    try {
      this.updateProgress('preparing', 0, 'Preparing export data...');
      
      const transformedData = this.transformDataForExport();
      
      this.updateProgress('processing', 25, 'Processing multi-dimensional data...');
      
      switch (format) {
        case 'csv':
          await this.exportToCSV(transformedData);
          break;
        case 'json':
          await this.exportToJSON(transformedData);
          break;
        case 'pdf':
          await this.exportToPDF(transformedData);
          break;
        case 'xlsx':
          await this.exportToExcel(transformedData);
          break;
        default:
          throw new Error(`Unsupported export format: ${format}`);
      }
      
      this.updateProgress('complete', 100, 'Export completed successfully');
    } catch (error) {
      this.updateProgress('error', 0, `Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  /**
   * Export chart as high-resolution image
   */
  async exportChartAsImage(
    chartElement: HTMLElement,
    format: 'png' | 'svg',
    options: {
      width?: number;
      height?: number;
      quality?: number;
      includeMetadata?: boolean;
    } = {}
  ): Promise<void> {
    try {
      this.updateProgress('preparing', 0, 'Preparing chart export...');
      
      const {
        width = 1920,
        height = 1080,
        quality = 1.0,
        includeMetadata = true
      } = options;

      if (format === 'svg') {
        await this.exportChartAsSVG(chartElement, includeMetadata);
      } else {
        await this.exportChartAsPNG(chartElement, width, height, quality, includeMetadata);
      }
      
      this.updateProgress('complete', 100, 'Chart export completed');
    } catch (error) {
      this.updateProgress('error', 0, `Chart export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  /**
   * Transform enhanced data for export
   */
  private transformDataForExport(): MultiDimensionalExportData[] {
    return this.data.map(politician => ({
      politician: {
        id: politician.id,
        name: politician.name,
        party: politician.party,
        position: politician.position,
        state: politician.state
      },
      geographic: {
        country: politician.geographic.country.name,
        state: politician.geographic.state.name,
        lga: politician.geographic.lga.name,
        ward: politician.geographic.ward.name,
        pollingUnit: politician.geographic.pollingUnit.name,
        confidence: politician.geographic.state.confidence
      },
      demographic: {
        education: politician.demographic.education.level,
        occupation: politician.demographic.occupation.sector,
        ageGroup: politician.demographic.ageGroup.range,
        gender: politician.demographic.gender.classification,
        confidence: (
          politician.demographic.education.confidence +
          politician.demographic.occupation.confidence +
          politician.demographic.ageGroup.confidence +
          politician.demographic.gender.confidence
        ) / 4
      },
      sentiment: {
        polarity: politician.enhancedSentiment.polarity.classification,
        polarityScore: politician.enhancedSentiment.polarity.score,
        primaryEmotion: politician.enhancedSentiment.emotions.primary,
        emotionScores: politician.enhancedSentiment.emotions.scores,
        intensity: politician.enhancedSentiment.intensity.level,
        intensityScore: politician.enhancedSentiment.intensity.score,
        complexity: politician.enhancedSentiment.complexity.type,
        modelAgreement: politician.enhancedSentiment.modelAgreement.score
      },
      topics: {
        primaryPolicyArea: politician.topics.policyAreas[0] || 'Undefined',
        campaignIssues: politician.topics.campaignIssues,
        eventTypes: politician.topics.eventDriven,
        trendingScore: politician.topics.trending.score
      },
      engagement: {
        level: politician.engagement.level,
        viralityScore: politician.engagement.virality.score,
        qualityScore: politician.engagement.quality.score,
        influencerAmplification: politician.engagement.influencerAmplification.detected
      },
      temporal: {
        peakHours: politician.temporal.daily.peakHours,
        activeDays: politician.temporal.weekly.activeDays,
        electionPhase: politician.temporal.electionCycle.currentPhase
      },
      dataQuality: {
        completeness: politician.dataQuality.completeness,
        confidence: politician.dataQuality.confidence,
        lastUpdated: politician.dataQuality.lastUpdated.toISOString()
      }
    }));
  }

  /**
   * Export to CSV format
   */
  private async exportToCSV(data: MultiDimensionalExportData[]): Promise<void> {
    this.updateProgress('generating', 50, 'Generating CSV file...');
    
    const headers = [
      // Basic info
      'ID', 'Name', 'Party', 'Position', 'State',
      // Geographic
      'Country', 'State_Detail', 'LGA', 'Ward', 'Polling_Unit', 'Geographic_Confidence',
      // Demographic
      'Education', 'Occupation', 'Age_Group', 'Gender', 'Demographic_Confidence',
      // Sentiment
      'Polarity', 'Polarity_Score', 'Primary_Emotion', 'Joy_Score', 'Anger_Score', 
      'Fear_Score', 'Sadness_Score', 'Disgust_Score', 'Intensity', 'Intensity_Score',
      'Complexity', 'Model_Agreement',
      // Topics
      'Primary_Policy_Area', 'Campaign_Issues', 'Event_Types', 'Trending_Score',
      // Engagement
      'Engagement_Level', 'Virality_Score', 'Quality_Score', 'Influencer_Amplification',
      // Temporal
      'Peak_Hours', 'Active_Days', 'Election_Phase',
      // Data Quality
      'Completeness', 'Confidence', 'Last_Updated'
    ];

    const csvRows = data.map(row => [
      // Basic info
      row.politician.id,
      `"${row.politician.name}"`,
      `"${row.politician.party}"`,
      `"${row.politician.position}"`,
      `"${row.politician.state}"`,
      // Geographic
      `"${row.geographic.country}"`,
      `"${row.geographic.state}"`,
      `"${row.geographic.lga}"`,
      `"${row.geographic.ward}"`,
      `"${row.geographic.pollingUnit}"`,
      row.geographic.confidence.toFixed(3),
      // Demographic
      `"${row.demographic.education}"`,
      `"${row.demographic.occupation}"`,
      `"${row.demographic.ageGroup}"`,
      `"${row.demographic.gender}"`,
      row.demographic.confidence.toFixed(3),
      // Sentiment
      `"${row.sentiment.polarity}"`,
      row.sentiment.polarityScore.toFixed(3),
      `"${row.sentiment.primaryEmotion}"`,
      row.sentiment.emotionScores.joy?.toFixed(3) || '0',
      row.sentiment.emotionScores.anger?.toFixed(3) || '0',
      row.sentiment.emotionScores.fear?.toFixed(3) || '0',
      row.sentiment.emotionScores.sadness?.toFixed(3) || '0',
      row.sentiment.emotionScores.disgust?.toFixed(3) || '0',
      `"${row.sentiment.intensity}"`,
      row.sentiment.intensityScore.toFixed(3),
      `"${row.sentiment.complexity}"`,
      row.sentiment.modelAgreement.toFixed(3),
      // Topics
      `"${row.topics.primaryPolicyArea}"`,
      `"${row.topics.campaignIssues.join('; ')}"`,
      `"${row.topics.eventTypes.join('; ')}"`,
      row.topics.trendingScore.toFixed(3),
      // Engagement
      `"${row.engagement.level}"`,
      row.engagement.viralityScore.toFixed(3),
      row.engagement.qualityScore.toFixed(3),
      row.engagement.influencerAmplification ? 'Yes' : 'No',
      // Temporal
      `"${row.temporal.peakHours.join('; ')}"`,
      `"${row.temporal.activeDays.join('; ')}"`,
      `"${row.temporal.electionPhase}"`,
      // Data Quality
      row.dataQuality.completeness.toFixed(3),
      row.dataQuality.confidence.toFixed(3),
      `"${row.dataQuality.lastUpdated}"`
    ].join(','));

    const csvContent = [
      headers.join(','),
      ...csvRows,
      '',
      '# Export Metadata',
      `# Export Date: ${this.metadata.exportDate}`,
      `# Total Records: ${this.metadata.totalRecords}`,
      `# Data Quality Score: ${this.metadata.dataQualityScore.toFixed(2)}`,
      `# Confidence Threshold: ${this.metadata.confidenceThreshold}`,
      `# Undefined Data: ${this.metadata.undefinedDataPercentage.toFixed(1)}%`
    ].join('\n');

    this.updateProgress('downloading', 75, 'Preparing download...');
    
    await this.downloadFile(csvContent, 'text/csv', 'multi-dimensional-analysis.csv');
  }

  /**
   * Export to JSON format
   */
  private async exportToJSON(data: MultiDimensionalExportData[]): Promise<void> {
    this.updateProgress('generating', 50, 'Generating JSON file...');
    
    const exportObject = {
      metadata: this.metadata,
      data: data,
      summary: {
        totalRecords: data.length,
        dimensionsCovered: [
          'geographic', 'demographic', 'sentiment', 
          'topics', 'engagement', 'temporal'
        ],
        exportVersion: '1.0.0'
      }
    };

    const jsonContent = JSON.stringify(exportObject, null, 2);
    
    this.updateProgress('downloading', 75, 'Preparing download...');
    
    await this.downloadFile(jsonContent, 'application/json', 'multi-dimensional-analysis.json');
  }

  /**
   * Export to PDF format
   */
  private async exportToPDF(data: MultiDimensionalExportData[]): Promise<void> {
    this.updateProgress('generating', 50, 'Generating PDF report...');
    
    // For now, create a comprehensive text-based report
    // In production, this would use a PDF library like jsPDF
    const reportContent = this.generatePDFContent(data);
    
    this.updateProgress('downloading', 75, 'Preparing download...');
    
    await this.downloadFile(reportContent, 'text/plain', 'multi-dimensional-analysis-report.txt');
  }

  /**
   * Export to Excel format (simulated)
   */
  private async exportToExcel(data: MultiDimensionalExportData[]): Promise<void> {
    this.updateProgress('generating', 50, 'Generating Excel file...');
    
    // For now, create a CSV with Excel-friendly formatting
    // In production, this would use a library like SheetJS
    const excelContent = await this.generateExcelContent(data);
    
    this.updateProgress('downloading', 75, 'Preparing download...');
    
    await this.downloadFile(excelContent, 'text/csv', 'multi-dimensional-analysis.xlsx.csv');
  }

  /**
   * Export chart as SVG
   */
  private async exportChartAsSVG(chartElement: HTMLElement, includeMetadata: boolean): Promise<void> {
    const svgElement = chartElement.querySelector('svg');
    if (!svgElement) {
      throw new Error('No SVG element found in chart');
    }

    let svgData = new XMLSerializer().serializeToString(svgElement);
    
    if (includeMetadata) {
      // Add metadata as SVG comments
      const metadataComment = `<!-- Multi-Dimensional Analysis Chart
Export Date: ${this.metadata.exportDate}
Total Records: ${this.metadata.totalRecords}
Data Quality Score: ${this.metadata.dataQualityScore.toFixed(2)}
-->`;
      svgData = svgData.replace('<svg', `${metadataComment}\n<svg`);
    }

    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    
    this.downloadFromUrl(url, 'multi-dimensional-chart.svg');
    URL.revokeObjectURL(url);
  }

  /**
   * Export chart as PNG (simulated)
   */
  private async exportChartAsPNG(
    chartElement: HTMLElement,
    width: number,
    height: number,
    quality: number,
    includeMetadata: boolean
  ): Promise<void> {
    // In production, this would use html2canvas or similar
    console.log('PNG export initiated with options:', { width, height, quality, includeMetadata });
    
    // Simulate export process
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Create a placeholder notification
    const message = `High-resolution PNG export (${width}x${height}) with quality ${quality} ${includeMetadata ? 'including metadata' : 'without metadata'} would be generated here.`;
    
    if (typeof window !== 'undefined' && window.alert) {
      window.alert(message);
    } else {
      console.log(message);
    }
  }

  /**
   * Generate PDF content
   */
  private generatePDFContent(data: MultiDimensionalExportData[]): string {
    const lines = [
      'MULTI-DIMENSIONAL SENTIMENT ANALYSIS REPORT',
      '==========================================',
      '',
      `Export Date: ${this.metadata.exportDate}`,
      `Export Time: ${this.metadata.exportTime}`,
      `Data Range: ${this.metadata.dataRange}`,
      `Total Records: ${this.metadata.totalRecords}`,
      `Data Quality Score: ${this.metadata.dataQualityScore.toFixed(2)}/100`,
      `Confidence Threshold: ${this.metadata.confidenceThreshold}`,
      `Undefined Data: ${this.metadata.undefinedDataPercentage.toFixed(1)}%`,
      '',
      'FILTERS APPLIED:',
      '================',
      JSON.stringify(this.metadata.filtersApplied, null, 2),
      '',
      'EXECUTIVE SUMMARY:',
      '==================',
      `This report contains comprehensive multi-dimensional analysis of ${data.length} political entities.`,
      `The analysis covers six key dimensions: Geographic, Demographic, Sentiment, Topics, Engagement, and Temporal patterns.`,
      '',
      'DETAILED DATA:',
      '==============',
      ''
    ];

    // Add detailed data for each politician
    data.forEach((politician, index) => {
      lines.push(
        `${index + 1}. ${politician.politician.name.toUpperCase()}`,
        `   Party: ${politician.politician.party}`,
        `   Position: ${politician.politician.position}`,
        `   State: ${politician.politician.state}`,
        '',
        '   GEOGRAPHIC ANALYSIS:',
        `   - Location: ${politician.geographic.state}, ${politician.geographic.lga}`,
        `   - Administrative Level: ${politician.geographic.ward}, ${politician.geographic.pollingUnit}`,
        `   - Confidence: ${(politician.geographic.confidence * 100).toFixed(1)}%`,
        '',
        '   DEMOGRAPHIC PROFILE:',
        `   - Education: ${politician.demographic.education}`,
        `   - Occupation: ${politician.demographic.occupation}`,
        `   - Age Group: ${politician.demographic.ageGroup}`,
        `   - Gender: ${politician.demographic.gender}`,
        `   - Confidence: ${(politician.demographic.confidence * 100).toFixed(1)}%`,
        '',
        '   SENTIMENT ANALYSIS:',
        `   - Polarity: ${politician.sentiment.polarity} (${politician.sentiment.polarityScore.toFixed(2)})`,
        `   - Primary Emotion: ${politician.sentiment.primaryEmotion}`,
        `   - Intensity: ${politician.sentiment.intensity} (${politician.sentiment.intensityScore.toFixed(2)})`,
        `   - Complexity: ${politician.sentiment.complexity}`,
        `   - Model Agreement: ${(politician.sentiment.modelAgreement * 100).toFixed(1)}%`,
        '',
        '   TOPIC ENGAGEMENT:',
        `   - Primary Policy Area: ${politician.topics.primaryPolicyArea}`,
        `   - Campaign Issues: ${politician.topics.campaignIssues.join(', ')}`,
        `   - Event Types: ${politician.topics.eventTypes.join(', ')}`,
        `   - Trending Score: ${politician.topics.trendingScore.toFixed(2)}`,
        '',
        '   ENGAGEMENT METRICS:',
        `   - Level: ${politician.engagement.level}`,
        `   - Virality Score: ${politician.engagement.viralityScore.toFixed(2)}`,
        `   - Quality Score: ${politician.engagement.qualityScore.toFixed(2)}`,
        `   - Influencer Amplification: ${politician.engagement.influencerAmplification ? 'Yes' : 'No'}`,
        '',
        '   TEMPORAL PATTERNS:',
        `   - Peak Hours: ${politician.temporal.peakHours.join(', ')}`,
        `   - Active Days: ${politician.temporal.activeDays.join(', ')}`,
        `   - Election Phase: ${politician.temporal.electionPhase}`,
        '',
        '   DATA QUALITY:',
        `   - Completeness: ${(politician.dataQuality.completeness * 100).toFixed(1)}%`,
        `   - Confidence: ${(politician.dataQuality.confidence * 100).toFixed(1)}%`,
        `   - Last Updated: ${politician.dataQuality.lastUpdated}`,
        '',
        '   ' + '='.repeat(80),
        ''
      );
    });

    return lines.join('\n');
  }

  /**
   * Generate Excel content
   */
  private async generateExcelContent(data: MultiDimensionalExportData[]): Promise<string> {
    // Create multiple sheets in CSV format
    const sheets = {
      'Summary': this.generateSummarySheet(data),
      'Geographic': this.generateGeographicSheet(data),
      'Demographic': this.generateDemographicSheet(data),
      'Sentiment': this.generateSentimentSheet(data),
      'Topics': this.generateTopicsSheet(data),
      'Engagement': this.generateEngagementSheet(data),
      'Temporal': this.generateTemporalSheet(data)
    };

    // Combine all sheets with sheet separators
    const excelContent = Object.entries(sheets)
      .map(([sheetName, content]) => `# Sheet: ${sheetName}\n${content}`)
      .join('\n\n' + '='.repeat(80) + '\n\n');

    return excelContent;
  }

  /**
   * Generate summary sheet
   */
  private generateSummarySheet(data: MultiDimensionalExportData[]): string {
    const headers = ['ID', 'Name', 'Party', 'Position', 'State', 'Overall_Sentiment', 'Data_Quality'];
    const rows = data.map(row => [
      row.politician.id,
      `"${row.politician.name}"`,
      `"${row.politician.party}"`,
      `"${row.politician.position}"`,
      `"${row.politician.state}"`,
      row.sentiment.polarityScore.toFixed(3),
      row.dataQuality.confidence.toFixed(3)
    ].join(','));

    return [headers.join(','), ...rows].join('\n');
  }

  /**
   * Generate geographic sheet
   */
  private generateGeographicSheet(data: MultiDimensionalExportData[]): string {
    const headers = ['ID', 'Name', 'Country', 'State', 'LGA', 'Ward', 'Polling_Unit', 'Confidence'];
    const rows = data.map(row => [
      row.politician.id,
      `"${row.politician.name}"`,
      `"${row.geographic.country}"`,
      `"${row.geographic.state}"`,
      `"${row.geographic.lga}"`,
      `"${row.geographic.ward}"`,
      `"${row.geographic.pollingUnit}"`,
      row.geographic.confidence.toFixed(3)
    ].join(','));

    return [headers.join(','), ...rows].join('\n');
  }

  /**
   * Generate demographic sheet
   */
  private generateDemographicSheet(data: MultiDimensionalExportData[]): string {
    const headers = ['ID', 'Name', 'Education', 'Occupation', 'Age_Group', 'Gender', 'Confidence'];
    const rows = data.map(row => [
      row.politician.id,
      `"${row.politician.name}"`,
      `"${row.demographic.education}"`,
      `"${row.demographic.occupation}"`,
      `"${row.demographic.ageGroup}"`,
      `"${row.demographic.gender}"`,
      row.demographic.confidence.toFixed(3)
    ].join(','));

    return [headers.join(','), ...rows].join('\n');
  }

  /**
   * Generate sentiment sheet
   */
  private generateSentimentSheet(data: MultiDimensionalExportData[]): string {
    const headers = [
      'ID', 'Name', 'Polarity', 'Polarity_Score', 'Primary_Emotion', 
      'Joy', 'Anger', 'Fear', 'Sadness', 'Disgust', 
      'Intensity', 'Intensity_Score', 'Complexity', 'Model_Agreement'
    ];
    const rows = data.map(row => [
      row.politician.id,
      `"${row.politician.name}"`,
      `"${row.sentiment.polarity}"`,
      row.sentiment.polarityScore.toFixed(3),
      `"${row.sentiment.primaryEmotion}"`,
      row.sentiment.emotionScores.joy?.toFixed(3) || '0',
      row.sentiment.emotionScores.anger?.toFixed(3) || '0',
      row.sentiment.emotionScores.fear?.toFixed(3) || '0',
      row.sentiment.emotionScores.sadness?.toFixed(3) || '0',
      row.sentiment.emotionScores.disgust?.toFixed(3) || '0',
      `"${row.sentiment.intensity}"`,
      row.sentiment.intensityScore.toFixed(3),
      `"${row.sentiment.complexity}"`,
      row.sentiment.modelAgreement.toFixed(3)
    ].join(','));

    return [headers.join(','), ...rows].join('\n');
  }

  /**
   * Generate topics sheet
   */
  private generateTopicsSheet(data: MultiDimensionalExportData[]): string {
    const headers = ['ID', 'Name', 'Primary_Policy_Area', 'Campaign_Issues', 'Event_Types', 'Trending_Score'];
    const rows = data.map(row => [
      row.politician.id,
      `"${row.politician.name}"`,
      `"${row.topics.primaryPolicyArea}"`,
      `"${row.topics.campaignIssues.join('; ')}"`,
      `"${row.topics.eventTypes.join('; ')}"`,
      row.topics.trendingScore.toFixed(3)
    ].join(','));

    return [headers.join(','), ...rows].join('\n');
  }

  /**
   * Generate engagement sheet
   */
  private generateEngagementSheet(data: MultiDimensionalExportData[]): string {
    const headers = ['ID', 'Name', 'Level', 'Virality_Score', 'Quality_Score', 'Influencer_Amplification'];
    const rows = data.map(row => [
      row.politician.id,
      `"${row.politician.name}"`,
      `"${row.engagement.level}"`,
      row.engagement.viralityScore.toFixed(3),
      row.engagement.qualityScore.toFixed(3),
      row.engagement.influencerAmplification ? 'Yes' : 'No'
    ].join(','));

    return [headers.join(','), ...rows].join('\n');
  }

  /**
   * Generate temporal sheet
   */
  private generateTemporalSheet(data: MultiDimensionalExportData[]): string {
    const headers = ['ID', 'Name', 'Peak_Hours', 'Active_Days', 'Election_Phase'];
    const rows = data.map(row => [
      row.politician.id,
      `"${row.politician.name}"`,
      `"${row.temporal.peakHours.join('; ')}"`,
      `"${row.temporal.activeDays.join('; ')}"`,
      `"${row.temporal.electionPhase}"`
    ].join(','));

    return [headers.join(','), ...rows].join('\n');
  }

  /**
   * Generate export metadata
   */
  private generateMetadata(): ExportMetadata {
    const now = new Date();
    const totalRecords = this.data.length;
    const dataQualityScores = this.data.map(d => d.dataQuality.confidence);
    const avgDataQuality = dataQualityScores.reduce((sum, score) => sum + score, 0) / totalRecords;
    
    const undefinedCount = this.data.reduce((count, d) => {
      let undefinedFields = 0;
      if (d.geographic.state.isUndefined) undefinedFields++;
      if (d.demographic.education.level === 'Undefined') undefinedFields++;
      if (d.demographic.occupation.sector === 'Undefined') undefinedFields++;
      if (d.demographic.ageGroup.range === 'Undefined') undefinedFields++;
      if (d.demographic.gender.classification === 'Undefined') undefinedFields++;
      return count + (undefinedFields > 0 ? 1 : 0);
    }, 0);

    return {
      exportDate: now.toISOString().split('T')[0],
      exportTime: now.toISOString().split('T')[1].split('.')[0],
      dataRange: 'All available data',
      filtersApplied: this.filters,
      totalRecords,
      dataQualityScore: avgDataQuality * 100,
      confidenceThreshold: 0.6,
      undefinedDataPercentage: (undefinedCount / totalRecords) * 100
    };
  }

  /**
   * Update progress callback
   */
  private updateProgress(stage: ExportProgress['stage'], progress: number, message: string): void {
    if (this.progressCallback) {
      this.progressCallback({ stage, progress, message });
    }
  }

  /**
   * Download file utility
   */
  private async downloadFile(content: string, mimeType: string, filename: string): Promise<void> {
    try {
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      
      this.downloadFromUrl(url, filename);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      throw new Error('Failed to download file');
    }
  }

  /**
   * Download from URL utility
   */
  private downloadFromUrl(url: string, filename: string): void {
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
  }
}

/**
 * Utility function to create multi-dimensional exporter
 */
export const createMultiDimensionalExporter = (
  data: EnhancedPoliticianData[],
  filters: Partial<FilterState> = {},
  progressCallback?: (progress: ExportProgress) => void
): MultiDimensionalExporter => {
  return new MultiDimensionalExporter(data, filters, progressCallback);
};