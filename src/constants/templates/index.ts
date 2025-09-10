// Quick Actions Templates
export * from './quick-actions';

// Export and Report Templates
export * from './export-templates';
export * from './report-templates';

// Search and Filter Configurations
export * from './search-filter-configs';

// Re-export commonly used types and interfaces
export type {
    ExportConfiguration,
    ExportOptions, ExportTemplate, FileNamingConvention, FilterConfiguration, FilterPreset, QuickActionCategory, QuickActionTemplate, RankingWeights, ReportFormatting, ReportSection, ReportTemplate, ReportTemplateContent, SearchConfiguration,
    SearchField, SortConfiguration
} from './quick-actions';

export type {
    ExportTemplate as ExportTemplateType,
    ReportTemplate as ReportTemplateType
} from './export-templates';

export type {
    ReportTemplateContent as ReportTemplateContentType
} from './report-templates';

export type {
    FilterPreset as FilterPresetType, SearchConfiguration as SearchConfigurationType, SortConfiguration as SortConfigurationType
} from './search-filter-configs';

// Template Collections
export {
    ALL_QUICK_ACTIONS, ANALYSIS_ACTIONS, COMPARISON_ACTIONS, DASHBOARD_ACTIONS, EXPORT_ACTIONS, QUICK_FILTER_ACTIONS, SEARCH_ACTIONS, UTILITY_ACTIONS
} from './quick-actions';

export {
    ALL_EXPORT_TEMPLATES,
    ALL_REPORT_TEMPLATES,
    CSV_EXPORT_TEMPLATES, EXCEL_EXPORT_TEMPLATES,
    FILE_NAMING_CONVENTIONS, IMAGE_EXPORT_TEMPLATES, JSON_EXPORT_TEMPLATES,
    PDF_EXPORT_TEMPLATES
} from './export-templates';

export {
    ALL_REPORT_TEMPLATE_CONTENTS,
    EXECUTIVE_SUMMARY_TEMPLATE, GEOGRAPHIC_ANALYSIS_TEMPLATE, METHODOLOGY_TEMPLATE, PARTY_COMPARISON_TEMPLATE, POLITICIAN_OVERVIEW_TEMPLATE,
    SENTIMENT_ANALYSIS_TEMPLATE, SENTIMENT_OVERVIEW_TEMPLATE, TRENDING_TOPICS_TEMPLATE
} from './report-templates';

export {
    ALL_FILTER_PRESETS, ALL_SEARCH_CONFIGS, ALL_SORT_CONFIGS, DATE_SORT_ASC, DATE_SORT_DESC, GLOBAL_SEARCH_CONFIG, MAJOR_PARTIES_PRESET, MENTIONS_SORT_DESC, NAME_SORT_ASC,
    NAME_SORT_DESC, NEGATIVE_SENTIMENT_PRESET, PARTY_SEARCH_CONFIG, POLITICIAN_SEARCH_CONFIG, POPULARITY_SORT_DESC, POPULAR_POLITICIANS_PRESET, REGIONAL_ANALYSIS_PRESET, RELEVANCE_SORT, SENTIMENT_SORT_ASC, SENTIMENT_SORT_DESC, SOCIAL_MEDIA_FOCUS_PRESET, TOPIC_SEARCH_CONFIG, TRENDING_TOPICS_PRESET, YOUTH_DEMOGRAPHICS_PRESET
} from './search-filter-configs';

// Utility Functions
export {
    generateActionRoute,
    generateActionUrl, generateDynamicAction, generateEnabledQuickActions, generateQuickActionById, generateQuickActionsByCategory, generateQuickActionsByKeyword, generateQuickActionsByPriority, generateQuickActionsByTag
} from './quick-actions';

export {
    createExportConfiguration, generateFileName, getEnabledExportTemplates,
    getEnabledReportTemplates, getExportTemplateById, getExportTemplatesByFormat,
    getExportTemplatesByReportType,
    getReportTemplateById
} from './export-templates';

export {
    combineTemplates, getOptionalTemplates, getReportTemplateContentById,
    getRequiredTemplates, processTemplate, renderTemplate,
    validateTemplateVariables
} from './report-templates';

export {
    createCustomFilterPreset, createCustomSearchConfig, getDefaultFilterPresets, getDefaultSearchConfig,
    getDefaultSortConfig, getFilterPresetById, getFilterPresetsByCategory, getPopularFilterPresets, getSearchConfigById, getSortConfigById, getSortConfigsByField, optimizeSearchConfig, validateFilterConfiguration
} from './search-filter-configs';
