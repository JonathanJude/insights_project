import { ExportFormats, ReportTypes } from '../enums/system-enums';

export interface ExportTemplate {
  id: string;
  name: string;
  description: string;
  format: ExportFormats;
  reportType: ReportTypes;
  fileExtension: string;
  mimeType: string;
  isEnabled: boolean;
  requiresChartElement?: boolean;
  supportsBatch?: boolean;
  maxFileSize?: number; // in MB
  metadata: {
    version: string;
    lastUpdated: string;
    author: string;
    tags: string[];
  };
}

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  reportType: ReportTypes;
  sections: ReportSection[];
  defaultFormat: ExportFormats;
  supportedFormats: ExportFormats[];
  isEnabled: boolean;
  metadata: {
    version: string;
    lastUpdated: string;
    author: string;
    tags: string[];
  };
}

export interface ReportSection {
  id: string;
  name: string;
  description: string;
  order: number;
  isRequired: boolean;
  dataSource: string;
  template: string;
  formatting: SectionFormatting;
}

export interface SectionFormatting {
  includeHeader: boolean;
  includeFooter: boolean;
  pageBreakBefore?: boolean;
  pageBreakAfter?: boolean;
  columns?: number;
  fontSize?: number;
  fontFamily?: string;
}

export interface FileNamingConvention {
  pattern: string;
  variables: string[];
  example: string;
  description: string;
}

// Export Format Templates
export const CSV_EXPORT_TEMPLATES: ExportTemplate[] = [
  {
    id: 'dashboard-stats-csv',
    name: 'Dashboard Statistics CSV',
    description: 'Export dashboard overview statistics as CSV',
    format: ExportFormats.CSV,
    reportType: ReportTypes.DASHBOARD,
    fileExtension: 'csv',
    mimeType: 'text/csv',
    isEnabled: true,
    supportsBatch: true,
    maxFileSize: 10,
    metadata: {
      version: '1.0.0',
      lastUpdated: '2024-01-15',
      author: 'System',
      tags: ['dashboard', 'statistics', 'csv']
    }
  },
  {
    id: 'politician-data-csv',
    name: 'Politician Data CSV',
    description: 'Export politician profiles and sentiment data as CSV',
    format: ExportFormats.CSV,
    reportType: ReportTypes.POLITICIAN,
    fileExtension: 'csv',
    mimeType: 'text/csv',
    isEnabled: true,
    supportsBatch: true,
    maxFileSize: 50,
    metadata: {
      version: '1.0.0',
      lastUpdated: '2024-01-15',
      author: 'System',
      tags: ['politician', 'profiles', 'csv']
    }
  },
  {
    id: 'party-comparison-csv',
    name: 'Party Comparison CSV',
    description: 'Export party comparison analysis as CSV',
    format: ExportFormats.CSV,
    reportType: ReportTypes.PARTY,
    fileExtension: 'csv',
    mimeType: 'text/csv',
    isEnabled: true,
    supportsBatch: false,
    maxFileSize: 25,
    metadata: {
      version: '1.0.0',
      lastUpdated: '2024-01-15',
      author: 'System',
      tags: ['party', 'comparison', 'csv']
    }
  },
  {
    id: 'geographic-analysis-csv',
    name: 'Geographic Analysis CSV',
    description: 'Export geographic sentiment analysis as CSV',
    format: ExportFormats.CSV,
    reportType: ReportTypes.GEOGRAPHIC,
    fileExtension: 'csv',
    mimeType: 'text/csv',
    isEnabled: true,
    supportsBatch: true,
    maxFileSize: 30,
    metadata: {
      version: '1.0.0',
      lastUpdated: '2024-01-15',
      author: 'System',
      tags: ['geographic', 'states', 'csv']
    }
  },
  {
    id: 'demographic-insights-csv',
    name: 'Demographic Insights CSV',
    description: 'Export demographic analysis as CSV',
    format: ExportFormats.CSV,
    reportType: ReportTypes.DEMOGRAPHIC,
    fileExtension: 'csv',
    mimeType: 'text/csv',
    isEnabled: true,
    supportsBatch: true,
    maxFileSize: 20,
    metadata: {
      version: '1.0.0',
      lastUpdated: '2024-01-15',
      author: 'System',
      tags: ['demographic', 'analysis', 'csv']
    }
  },
  {
    id: 'sentiment-analysis-csv',
    name: 'Sentiment Analysis CSV',
    description: 'Export detailed sentiment analysis as CSV',
    format: ExportFormats.CSV,
    reportType: ReportTypes.SENTIMENT,
    fileExtension: 'csv',
    mimeType: 'text/csv',
    isEnabled: true,
    supportsBatch: true,
    maxFileSize: 40,
    metadata: {
      version: '1.0.0',
      lastUpdated: '2024-01-15',
      author: 'System',
      tags: ['sentiment', 'emotion', 'csv']
    }
  }
];

export const JSON_EXPORT_TEMPLATES: ExportTemplate[] = [
  {
    id: 'dashboard-data-json',
    name: 'Dashboard Data JSON',
    description: 'Export complete dashboard data as JSON',
    format: ExportFormats.JSON,
    reportType: ReportTypes.DASHBOARD,
    fileExtension: 'json',
    mimeType: 'application/json',
    isEnabled: true,
    supportsBatch: true,
    maxFileSize: 100,
    metadata: {
      version: '1.0.0',
      lastUpdated: '2024-01-15',
      author: 'System',
      tags: ['dashboard', 'complete', 'json']
    }
  },
  {
    id: 'politician-profiles-json',
    name: 'Politician Profiles JSON',
    description: 'Export politician profiles with full metadata as JSON',
    format: ExportFormats.JSON,
    reportType: ReportTypes.POLITICIAN,
    fileExtension: 'json',
    mimeType: 'application/json',
    isEnabled: true,
    supportsBatch: true,
    maxFileSize: 200,
    metadata: {
      version: '1.0.0',
      lastUpdated: '2024-01-15',
      author: 'System',
      tags: ['politician', 'profiles', 'json']
    }
  },
  {
    id: 'analysis-results-json',
    name: 'Analysis Results JSON',
    description: 'Export analysis results with metadata as JSON',
    format: ExportFormats.JSON,
    reportType: ReportTypes.SENTIMENT,
    fileExtension: 'json',
    mimeType: 'application/json',
    isEnabled: true,
    supportsBatch: true,
    maxFileSize: 150,
    metadata: {
      version: '1.0.0',
      lastUpdated: '2024-01-15',
      author: 'System',
      tags: ['analysis', 'results', 'json']
    }
  }
];

export const PDF_EXPORT_TEMPLATES: ExportTemplate[] = [
  {
    id: 'comprehensive-report-pdf',
    name: 'Comprehensive Report PDF',
    description: 'Generate comprehensive political analysis report as PDF',
    format: ExportFormats.PDF,
    reportType: ReportTypes.DASHBOARD,
    fileExtension: 'pdf',
    mimeType: 'application/pdf',
    isEnabled: true,
    supportsBatch: false,
    maxFileSize: 50,
    metadata: {
      version: '1.0.0',
      lastUpdated: '2024-01-15',
      author: 'System',
      tags: ['comprehensive', 'report', 'pdf']
    }
  },
  {
    id: 'politician-profile-pdf',
    name: 'Politician Profile PDF',
    description: 'Generate detailed politician profile report as PDF',
    format: ExportFormats.PDF,
    reportType: ReportTypes.POLITICIAN,
    fileExtension: 'pdf',
    mimeType: 'application/pdf',
    isEnabled: true,
    supportsBatch: true,
    maxFileSize: 25,
    metadata: {
      version: '1.0.0',
      lastUpdated: '2024-01-15',
      author: 'System',
      tags: ['politician', 'profile', 'pdf']
    }
  },
  {
    id: 'party-analysis-pdf',
    name: 'Party Analysis PDF',
    description: 'Generate party comparison and analysis report as PDF',
    format: ExportFormats.PDF,
    reportType: ReportTypes.PARTY,
    fileExtension: 'pdf',
    mimeType: 'application/pdf',
    isEnabled: true,
    supportsBatch: false,
    maxFileSize: 30,
    metadata: {
      version: '1.0.0',
      lastUpdated: '2024-01-15',
      author: 'System',
      tags: ['party', 'analysis', 'pdf']
    }
  }
];

export const IMAGE_EXPORT_TEMPLATES: ExportTemplate[] = [
  {
    id: 'chart-png',
    name: 'Chart PNG Export',
    description: 'Export charts and visualizations as PNG images',
    format: ExportFormats.PNG,
    reportType: ReportTypes.DASHBOARD,
    fileExtension: 'png',
    mimeType: 'image/png',
    isEnabled: true,
    requiresChartElement: true,
    supportsBatch: true,
    maxFileSize: 10,
    metadata: {
      version: '1.0.0',
      lastUpdated: '2024-01-15',
      author: 'System',
      tags: ['chart', 'visualization', 'png']
    }
  },
  {
    id: 'chart-svg',
    name: 'Chart SVG Export',
    description: 'Export charts and visualizations as SVG images',
    format: ExportFormats.SVG,
    reportType: ReportTypes.DASHBOARD,
    fileExtension: 'svg',
    mimeType: 'image/svg+xml',
    isEnabled: true,
    requiresChartElement: true,
    supportsBatch: true,
    maxFileSize: 5,
    metadata: {
      version: '1.0.0',
      lastUpdated: '2024-01-15',
      author: 'System',
      tags: ['chart', 'visualization', 'svg']
    }
  }
];

export const EXCEL_EXPORT_TEMPLATES: ExportTemplate[] = [
  {
    id: 'dashboard-workbook-xlsx',
    name: 'Dashboard Workbook XLSX',
    description: 'Export dashboard data as Excel workbook with multiple sheets',
    format: ExportFormats.XLSX,
    reportType: ReportTypes.DASHBOARD,
    fileExtension: 'xlsx',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    isEnabled: true,
    supportsBatch: false,
    maxFileSize: 75,
    metadata: {
      version: '1.0.0',
      lastUpdated: '2024-01-15',
      author: 'System',
      tags: ['dashboard', 'workbook', 'xlsx']
    }
  },
  {
    id: 'analysis-workbook-xlsx',
    name: 'Analysis Workbook XLSX',
    description: 'Export analysis results as Excel workbook',
    format: ExportFormats.XLSX,
    reportType: ReportTypes.SENTIMENT,
    fileExtension: 'xlsx',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    isEnabled: true,
    supportsBatch: false,
    maxFileSize: 100,
    metadata: {
      version: '1.0.0',
      lastUpdated: '2024-01-15',
      author: 'System',
      tags: ['analysis', 'workbook', 'xlsx']
    }
  }
];

// Report Templates
export const DASHBOARD_REPORT_TEMPLATE: ReportTemplate = {
  id: 'dashboard-comprehensive-report',
  name: 'Comprehensive Dashboard Report',
  description: 'Complete political sentiment analysis dashboard report',
  reportType: ReportTypes.DASHBOARD,
  defaultFormat: ExportFormats.PDF,
  supportedFormats: [ExportFormats.PDF, ExportFormats.CSV, ExportFormats.JSON, ExportFormats.XLSX],
  isEnabled: true,
  sections: [
    {
      id: 'executive-summary',
      name: 'Executive Summary',
      description: 'High-level overview of key findings',
      order: 1,
      isRequired: true,
      dataSource: 'dashboard-stats',
      template: 'executive-summary-template',
      formatting: {
        includeHeader: true,
        includeFooter: false,
        pageBreakAfter: true,
        fontSize: 12,
        fontFamily: 'Arial'
      }
    },
    {
      id: 'sentiment-overview',
      name: 'Sentiment Overview',
      description: 'Overall sentiment analysis across all politicians',
      order: 2,
      isRequired: true,
      dataSource: 'sentiment-data',
      template: 'sentiment-overview-template',
      formatting: {
        includeHeader: true,
        includeFooter: false,
        fontSize: 11,
        fontFamily: 'Arial'
      }
    },
    {
      id: 'party-comparison',
      name: 'Party Comparison',
      description: 'Comparative analysis of political parties',
      order: 3,
      isRequired: true,
      dataSource: 'party-data',
      template: 'party-comparison-template',
      formatting: {
        includeHeader: true,
        includeFooter: false,
        fontSize: 11,
        fontFamily: 'Arial'
      }
    },
    {
      id: 'geographic-analysis',
      name: 'Geographic Analysis',
      description: 'State-by-state sentiment breakdown',
      order: 4,
      isRequired: false,
      dataSource: 'geographic-data',
      template: 'geographic-analysis-template',
      formatting: {
        includeHeader: true,
        includeFooter: false,
        fontSize: 11,
        fontFamily: 'Arial'
      }
    },
    {
      id: 'trending-topics',
      name: 'Trending Topics',
      description: 'Current trending political topics and issues',
      order: 5,
      isRequired: false,
      dataSource: 'trending-data',
      template: 'trending-topics-template',
      formatting: {
        includeHeader: true,
        includeFooter: false,
        fontSize: 11,
        fontFamily: 'Arial'
      }
    },
    {
      id: 'methodology',
      name: 'Methodology',
      description: 'Data collection and analysis methodology',
      order: 6,
      isRequired: true,
      dataSource: 'static-content',
      template: 'methodology-template',
      formatting: {
        includeHeader: true,
        includeFooter: true,
        fontSize: 10,
        fontFamily: 'Arial'
      }
    }
  ],
  metadata: {
    version: '1.0.0',
    lastUpdated: '2024-01-15',
    author: 'System',
    tags: ['dashboard', 'comprehensive', 'report']
  }
};

export const POLITICIAN_REPORT_TEMPLATE: ReportTemplate = {
  id: 'politician-profile-report',
  name: 'Politician Profile Report',
  description: 'Detailed individual politician analysis report',
  reportType: ReportTypes.POLITICIAN,
  defaultFormat: ExportFormats.PDF,
  supportedFormats: [ExportFormats.PDF, ExportFormats.CSV, ExportFormats.JSON],
  isEnabled: true,
  sections: [
    {
      id: 'politician-overview',
      name: 'Politician Overview',
      description: 'Basic information and current status',
      order: 1,
      isRequired: true,
      dataSource: 'politician-profile',
      template: 'politician-overview-template',
      formatting: {
        includeHeader: true,
        includeFooter: false,
        fontSize: 12,
        fontFamily: 'Arial'
      }
    },
    {
      id: 'sentiment-analysis',
      name: 'Sentiment Analysis',
      description: 'Detailed sentiment breakdown and trends',
      order: 2,
      isRequired: true,
      dataSource: 'politician-sentiment',
      template: 'sentiment-analysis-template',
      formatting: {
        includeHeader: true,
        includeFooter: false,
        fontSize: 11,
        fontFamily: 'Arial'
      }
    },
    {
      id: 'engagement-metrics',
      name: 'Engagement Metrics',
      description: 'Social media engagement and reach analysis',
      order: 3,
      isRequired: true,
      dataSource: 'engagement-data',
      template: 'engagement-metrics-template',
      formatting: {
        includeHeader: true,
        includeFooter: false,
        fontSize: 11,
        fontFamily: 'Arial'
      }
    },
    {
      id: 'topic-association',
      name: 'Topic Association',
      description: 'Topics and issues associated with the politician',
      order: 4,
      isRequired: false,
      dataSource: 'topic-data',
      template: 'topic-association-template',
      formatting: {
        includeHeader: true,
        includeFooter: false,
        fontSize: 11,
        fontFamily: 'Arial'
      }
    },
    {
      id: 'comparative-analysis',
      name: 'Comparative Analysis',
      description: 'Comparison with party peers and competitors',
      order: 5,
      isRequired: false,
      dataSource: 'comparative-data',
      template: 'comparative-analysis-template',
      formatting: {
        includeHeader: true,
        includeFooter: false,
        fontSize: 11,
        fontFamily: 'Arial'
      }
    }
  ],
  metadata: {
    version: '1.0.0',
    lastUpdated: '2024-01-15',
    author: 'System',
    tags: ['politician', 'profile', 'report']
  }
};

export const PARTY_REPORT_TEMPLATE: ReportTemplate = {
  id: 'party-analysis-report',
  name: 'Party Analysis Report',
  description: 'Comprehensive political party analysis report',
  reportType: ReportTypes.PARTY,
  defaultFormat: ExportFormats.PDF,
  supportedFormats: [ExportFormats.PDF, ExportFormats.CSV, ExportFormats.JSON, ExportFormats.XLSX],
  isEnabled: true,
  sections: [
    {
      id: 'party-overview',
      name: 'Party Overview',
      description: 'Party information and leadership',
      order: 1,
      isRequired: true,
      dataSource: 'party-profile',
      template: 'party-overview-template',
      formatting: {
        includeHeader: true,
        includeFooter: false,
        fontSize: 12,
        fontFamily: 'Arial'
      }
    },
    {
      id: 'sentiment-performance',
      name: 'Sentiment Performance',
      description: 'Party sentiment analysis and trends',
      order: 2,
      isRequired: true,
      dataSource: 'party-sentiment',
      template: 'sentiment-performance-template',
      formatting: {
        includeHeader: true,
        includeFooter: false,
        fontSize: 11,
        fontFamily: 'Arial'
      }
    },
    {
      id: 'key-politicians',
      name: 'Key Politicians',
      description: 'Top performing politicians within the party',
      order: 3,
      isRequired: true,
      dataSource: 'party-politicians',
      template: 'key-politicians-template',
      formatting: {
        includeHeader: true,
        includeFooter: false,
        fontSize: 11,
        fontFamily: 'Arial'
      }
    },
    {
      id: 'geographic-presence',
      name: 'Geographic Presence',
      description: 'Party performance across different states',
      order: 4,
      isRequired: false,
      dataSource: 'party-geographic',
      template: 'geographic-presence-template',
      formatting: {
        includeHeader: true,
        includeFooter: false,
        fontSize: 11,
        fontFamily: 'Arial'
      }
    },
    {
      id: 'competitive-analysis',
      name: 'Competitive Analysis',
      description: 'Comparison with other major parties',
      order: 5,
      isRequired: false,
      dataSource: 'competitive-data',
      template: 'competitive-analysis-template',
      formatting: {
        includeHeader: true,
        includeFooter: false,
        fontSize: 11,
        fontFamily: 'Arial'
      }
    }
  ],
  metadata: {
    version: '1.0.0',
    lastUpdated: '2024-01-15',
    author: 'System',
    tags: ['party', 'analysis', 'report']
  }
};

// File Naming Conventions
export const FILE_NAMING_CONVENTIONS: Record<ReportTypes, FileNamingConvention> = {
  [ReportTypes.DASHBOARD]: {
    pattern: 'dashboard-report-{date}-{time}',
    variables: ['date', 'time'],
    example: 'dashboard-report-2024-01-15-14-30',
    description: 'Dashboard reports include date and time of generation'
  },
  [ReportTypes.POLITICIAN]: {
    pattern: 'politician-{name}-{date}',
    variables: ['name', 'date'],
    example: 'politician-peter-obi-2024-01-15',
    description: 'Politician reports include politician name and date'
  },
  [ReportTypes.PARTY]: {
    pattern: 'party-{party}-analysis-{date}',
    variables: ['party', 'date'],
    example: 'party-apc-analysis-2024-01-15',
    description: 'Party reports include party abbreviation and date'
  },
  [ReportTypes.GEOGRAPHIC]: {
    pattern: 'geographic-analysis-{scope}-{date}',
    variables: ['scope', 'date'],
    example: 'geographic-analysis-nigeria-2024-01-15',
    description: 'Geographic reports include scope (state/region/country) and date'
  },
  [ReportTypes.DEMOGRAPHIC]: {
    pattern: 'demographic-insights-{category}-{date}',
    variables: ['category', 'date'],
    example: 'demographic-insights-age-groups-2024-01-15',
    description: 'Demographic reports include category and date'
  },
  [ReportTypes.SENTIMENT]: {
    pattern: 'sentiment-analysis-{scope}-{date}',
    variables: ['scope', 'date'],
    example: 'sentiment-analysis-overall-2024-01-15',
    description: 'Sentiment reports include analysis scope and date'
  },
  [ReportTypes.TOPIC]: {
    pattern: 'topic-trends-{topic}-{date}',
    variables: ['topic', 'date'],
    example: 'topic-trends-economy-2024-01-15',
    description: 'Topic reports include main topic and date'
  },
  [ReportTypes.TEMPORAL]: {
    pattern: 'temporal-analysis-{period}-{date}',
    variables: ['period', 'date'],
    example: 'temporal-analysis-monthly-2024-01-15',
    description: 'Temporal reports include time period and date'
  }
};

// All Export Templates Combined
export const ALL_EXPORT_TEMPLATES: ExportTemplate[] = [
  ...CSV_EXPORT_TEMPLATES,
  ...JSON_EXPORT_TEMPLATES,
  ...PDF_EXPORT_TEMPLATES,
  ...IMAGE_EXPORT_TEMPLATES,
  ...EXCEL_EXPORT_TEMPLATES
];

// All Report Templates Combined
export const ALL_REPORT_TEMPLATES: ReportTemplate[] = [
  DASHBOARD_REPORT_TEMPLATE,
  POLITICIAN_REPORT_TEMPLATE,
  PARTY_REPORT_TEMPLATE
];

// Template Utility Functions
export const getExportTemplatesByFormat = (format: ExportFormats): ExportTemplate[] => {
  return ALL_EXPORT_TEMPLATES.filter(template => template.format === format);
};

export const getExportTemplatesByReportType = (reportType: ReportTypes): ExportTemplate[] => {
  return ALL_EXPORT_TEMPLATES.filter(template => template.reportType === reportType);
};

export const getReportTemplateById = (id: string): ReportTemplate | undefined => {
  return ALL_REPORT_TEMPLATES.find(template => template.id === id);
};

export const getExportTemplateById = (id: string): ExportTemplate | undefined => {
  return ALL_EXPORT_TEMPLATES.find(template => template.id === id);
};

export const getEnabledExportTemplates = (): ExportTemplate[] => {
  return ALL_EXPORT_TEMPLATES.filter(template => template.isEnabled);
};

export const getEnabledReportTemplates = (): ReportTemplate[] => {
  return ALL_REPORT_TEMPLATES.filter(template => template.isEnabled);
};

export const generateFileName = (
  reportType: ReportTypes,
  format: ExportFormats,
  variables: Record<string, string> = {}
): string => {
  const convention = FILE_NAMING_CONVENTIONS[reportType];
  let fileName = convention.pattern;

  // Replace variables in the pattern
  convention.variables.forEach(variable => {
    const value = variables[variable] || getDefaultVariableValue(variable);
    fileName = fileName.replace(`{${variable}}`, value);
  });

  // Get the appropriate file extension
  const template = getExportTemplatesByFormat(format)[0];
  const extension = template?.fileExtension || format.toLowerCase();

  return `${fileName}.${extension}`;
};

const getDefaultVariableValue = (variable: string): string => {
  const now = new Date();
  
  switch (variable) {
    case 'date':
      return now.toISOString().split('T')[0]; // YYYY-MM-DD
    case 'time':
      return now.toTimeString().split(' ')[0].replace(/:/g, '-'); // HH-MM-SS
    case 'timestamp':
      return now.getTime().toString();
    case 'name':
      return 'unknown';
    case 'party':
      return 'unknown';
    case 'scope':
      return 'general';
    case 'category':
      return 'general';
    case 'topic':
      return 'general';
    case 'period':
      return 'current';
    default:
      return 'unknown';
  }
};

// Export Configuration
export interface ExportConfiguration {
  template: ExportTemplate;
  variables: Record<string, string>;
  options: ExportOptions;
}

export interface ExportOptions {
  includeMetadata: boolean;
  includeTimestamp: boolean;
  compressOutput: boolean;
  customFileName?: string;
  batchSize?: number;
  maxRetries?: number;
}

export const createExportConfiguration = (
  templateId: string,
  variables: Record<string, string> = {},
  options: Partial<ExportOptions> = {}
): ExportConfiguration | null => {
  const template = getExportTemplateById(templateId);
  if (!template) return null;

  const defaultOptions: ExportOptions = {
    includeMetadata: true,
    includeTimestamp: true,
    compressOutput: false,
    batchSize: 1000,
    maxRetries: 3
  };

  return {
    template,
    variables,
    options: { ...defaultOptions, ...options }
  };
};