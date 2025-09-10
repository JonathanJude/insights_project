
export interface ReportTemplateContent {
  id: string;
  name: string;
  description: string;
  template: string;
  variables: string[];
  formatting: ReportFormatting;
  isRequired: boolean;
}

export interface ReportFormatting {
  fontSize: number;
  fontFamily: string;
  lineHeight: number;
  marginTop: number;
  marginBottom: number;
  alignment: 'left' | 'center' | 'right' | 'justify';
  includePageBreak: boolean;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
}

// Executive Summary Template
export const EXECUTIVE_SUMMARY_TEMPLATE: ReportTemplateContent = {
  id: 'executive-summary-template',
  name: 'Executive Summary Template',
  description: 'High-level overview template for dashboard reports',
  template: `
# Executive Summary

## Report Overview
This comprehensive political sentiment analysis report covers the period from {startDate} to {endDate}, analyzing {totalPoliticians} politicians across {totalParties} political parties in Nigeria.

## Key Findings

### Overall Sentiment Distribution
- **Positive Sentiment**: {positivePercentage}% ({positiveMentions} mentions)
- **Neutral Sentiment**: {neutralPercentage}% ({neutralMentions} mentions)  
- **Negative Sentiment**: {negativePercentage}% ({negativeMentions} mentions)

### Top Performing Politicians
{topPoliticians}

### Most Discussed Topics
{topTopics}

### Geographic Highlights
{geographicHighlights}

### Trending Insights
{trendingInsights}

## Summary
{summaryText}

---
*Report generated on {reportDate} at {reportTime}*
  `,
  variables: [
    'startDate', 'endDate', 'totalPoliticians', 'totalParties',
    'positivePercentage', 'positiveMentions', 'neutralPercentage', 'neutralMentions',
    'negativePercentage', 'negativeMentions', 'topPoliticians', 'topTopics',
    'geographicHighlights', 'trendingInsights', 'summaryText', 'reportDate', 'reportTime'
  ],
  formatting: {
    fontSize: 12,
    fontFamily: 'Arial',
    lineHeight: 1.5,
    marginTop: 0,
    marginBottom: 20,
    alignment: 'left',
    includePageBreak: true
  },
  isRequired: true
};

// Sentiment Overview Template
export const SENTIMENT_OVERVIEW_TEMPLATE: ReportTemplateContent = {
  id: 'sentiment-overview-template',
  name: 'Sentiment Overview Template',
  description: 'Detailed sentiment analysis template',
  template: `
# Sentiment Analysis Overview

## Methodology
Our sentiment analysis employs advanced natural language processing techniques to analyze social media mentions, news articles, and public discourse about Nigerian politicians. Each mention is classified into positive, neutral, or negative sentiment categories with confidence scores.

## Overall Sentiment Metrics

### Aggregate Statistics
- **Total Mentions Analyzed**: {totalMentions:,}
- **Average Sentiment Score**: {averageSentiment}
- **Sentiment Confidence**: {sentimentConfidence}%
- **Data Sources**: {dataSources}

### Sentiment Distribution
| Sentiment | Count | Percentage | Change from Previous Period |
|-----------|-------|------------|----------------------------|
| Very Positive | {veryPositiveCount:,} | {veryPositivePercentage}% | {veryPositiveChange} |
| Positive | {positiveCount:,} | {positivePercentage}% | {positiveChange} |
| Neutral | {neutralCount:,} | {neutralPercentage}% | {neutralChange} |
| Negative | {negativeCount:,} | {negativePercentage}% | {negativeChange} |
| Very Negative | {veryNegativeCount:,} | {veryNegativePercentage}% | {veryNegativeChange} |

## Platform Breakdown
{platformBreakdown}

## Temporal Trends
{temporalTrends}

## Key Insights
{keyInsights}
  `,
  variables: [
    'totalMentions', 'averageSentiment', 'sentimentConfidence', 'dataSources',
    'veryPositiveCount', 'veryPositivePercentage', 'veryPositiveChange',
    'positiveCount', 'positivePercentage', 'positiveChange',
    'neutralCount', 'neutralPercentage', 'neutralChange',
    'negativeCount', 'negativePercentage', 'negativeChange',
    'veryNegativeCount', 'veryNegativePercentage', 'veryNegativeChange',
    'platformBreakdown', 'temporalTrends', 'keyInsights'
  ],
  formatting: {
    fontSize: 11,
    fontFamily: 'Arial',
    lineHeight: 1.4,
    marginTop: 10,
    marginBottom: 15,
    alignment: 'left',
    includePageBreak: false
  },
  isRequired: true
};

// Party Comparison Template
export const PARTY_COMPARISON_TEMPLATE: ReportTemplateContent = {
  id: 'party-comparison-template',
  name: 'Party Comparison Template',
  description: 'Comparative analysis template for political parties',
  template: `
# Political Party Analysis

## Party Performance Overview

### Top Performing Parties
{topPartiesTable}

### Sentiment Comparison
| Party | Avg Sentiment | Positive % | Neutral % | Negative % | Total Mentions |
|-------|---------------|------------|-----------|------------|----------------|
{partySentimentTable}

## Detailed Party Analysis

{partyDetailedAnalysis}

## Key Observations

### Strengths and Opportunities
{strengthsOpportunities}

### Challenges and Risks
{challengesRisks}

## Competitive Landscape
{competitiveLandscape}

## Recommendations
{recommendations}
  `,
  variables: [
    'topPartiesTable', 'partySentimentTable', 'partyDetailedAnalysis',
    'strengthsOpportunities', 'challengesRisks', 'competitiveLandscape', 'recommendations'
  ],
  formatting: {
    fontSize: 11,
    fontFamily: 'Arial',
    lineHeight: 1.4,
    marginTop: 10,
    marginBottom: 15,
    alignment: 'left',
    includePageBreak: false
  },
  isRequired: true
};

// Geographic Analysis Template
export const GEOGRAPHIC_ANALYSIS_TEMPLATE: ReportTemplateContent = {
  id: 'geographic-analysis-template',
  name: 'Geographic Analysis Template',
  description: 'State and regional analysis template',
  template: `
# Geographic Sentiment Analysis

## Regional Overview

### Sentiment by Geopolitical Zone
{regionalSentimentTable}

### Top States by Engagement
| State | Total Mentions | Avg Sentiment | Dominant Party | Key Issues |
|-------|----------------|---------------|----------------|------------|
{topStatesTable}

## State-by-State Analysis

{stateAnalysis}

## Regional Insights

### North Central
{northCentralInsights}

### North East  
{northEastInsights}

### North West
{northWestInsights}

### South East
{southEastInsights}

### South South
{southSouthInsights}

### South West
{southWestInsights}

## Geographic Trends
{geographicTrends}

## Implications
{geographicImplications}
  `,
  variables: [
    'regionalSentimentTable', 'topStatesTable', 'stateAnalysis',
    'northCentralInsights', 'northEastInsights', 'northWestInsights',
    'southEastInsights', 'southSouthInsights', 'southWestInsights',
    'geographicTrends', 'geographicImplications'
  ],
  formatting: {
    fontSize: 11,
    fontFamily: 'Arial',
    lineHeight: 1.4,
    marginTop: 10,
    marginBottom: 15,
    alignment: 'left',
    includePageBreak: false
  },
  isRequired: false
};

// Trending Topics Template
export const TRENDING_TOPICS_TEMPLATE: ReportTemplateContent = {
  id: 'trending-topics-template',
  name: 'Trending Topics Template',
  description: 'Current trending topics and issues template',
  template: `
# Trending Topics Analysis

## Current Trending Topics

### Top 10 Trending Topics
| Rank | Topic | Mentions | Sentiment | Trend | Key Politicians |
|------|-------|----------|-----------|-------|-----------------|
{trendingTopicsTable}

## Topic Categories

### Economic Issues
{economicTopics}

### Security Concerns
{securityTopics}

### Social Issues
{socialTopics}

### Political Developments
{politicalTopics}

## Emerging Trends
{emergingTrends}

## Topic Sentiment Analysis
{topicSentimentAnalysis}

## Viral Content Analysis
{viralContentAnalysis}

## Implications for Political Landscape
{topicImplications}
  `,
  variables: [
    'trendingTopicsTable', 'economicTopics', 'securityTopics', 'socialTopics',
    'politicalTopics', 'emergingTrends', 'topicSentimentAnalysis',
    'viralContentAnalysis', 'topicImplications'
  ],
  formatting: {
    fontSize: 11,
    fontFamily: 'Arial',
    lineHeight: 1.4,
    marginTop: 10,
    marginBottom: 15,
    alignment: 'left',
    includePageBreak: false
  },
  isRequired: false
};

// Methodology Template
export const METHODOLOGY_TEMPLATE: ReportTemplateContent = {
  id: 'methodology-template',
  name: 'Methodology Template',
  description: 'Data collection and analysis methodology template',
  template: `
# Methodology

## Data Collection

### Data Sources
- **Social Media Platforms**: {socialPlatforms}
- **News Sources**: {newsSources}
- **Public Forums**: {publicForums}
- **Official Statements**: {officialSources}

### Collection Period
- **Start Date**: {collectionStartDate}
- **End Date**: {collectionEndDate}
- **Total Duration**: {collectionDuration}

### Data Volume
- **Total Posts Collected**: {totalPosts:,}
- **Unique Authors**: {uniqueAuthors:,}
- **Languages**: {languages}

## Analysis Framework

### Sentiment Analysis
{sentimentMethodology}

### Topic Modeling
{topicMethodology}

### Geographic Attribution
{geographicMethodology}

### Demographic Analysis
{demographicMethodology}

## Quality Assurance

### Data Validation
{dataValidation}

### Bias Mitigation
{biasMitigation}

### Confidence Scoring
{confidenceScoring}

## Limitations

### Known Limitations
{knownLimitations}

### Data Gaps
{dataGaps}

### Methodological Constraints
{methodologicalConstraints}

## Technical Infrastructure
{technicalInfrastructure}

---
*For questions about methodology, contact: {contactEmail}*
  `,
  variables: [
    'socialPlatforms', 'newsSources', 'publicForums', 'officialSources',
    'collectionStartDate', 'collectionEndDate', 'collectionDuration',
    'totalPosts', 'uniqueAuthors', 'languages',
    'sentimentMethodology', 'topicMethodology', 'geographicMethodology', 'demographicMethodology',
    'dataValidation', 'biasMitigation', 'confidenceScoring',
    'knownLimitations', 'dataGaps', 'methodologicalConstraints',
    'technicalInfrastructure', 'contactEmail'
  ],
  formatting: {
    fontSize: 10,
    fontFamily: 'Arial',
    lineHeight: 1.3,
    marginTop: 10,
    marginBottom: 0,
    alignment: 'left',
    includePageBreak: false
  },
  isRequired: true
};

// Politician Profile Templates
export const POLITICIAN_OVERVIEW_TEMPLATE: ReportTemplateContent = {
  id: 'politician-overview-template',
  name: 'Politician Overview Template',
  description: 'Individual politician profile template',
  template: `
# {politicianName} - Profile Analysis

## Basic Information
- **Full Name**: {fullName}
- **Party Affiliation**: {partyName}
- **Current Position**: {currentPosition}
- **State of Origin**: {stateOfOrigin}
- **Age**: {age}
- **Years in Politics**: {yearsInPolitics}

## Political Background
{politicalBackground}

## Current Status
- **Verification Status**: {verificationStatus}
- **Activity Level**: {activityLevel}
- **Last Major Statement**: {lastMajorStatement}

## Social Media Presence
- **Twitter**: {twitterHandle} ({twitterFollowers} followers)
- **Facebook**: {facebookPage} ({facebookFollowers} followers)
- **Instagram**: {instagramHandle} ({instagramFollowers} followers)

## Key Achievements
{keyAchievements}

## Notable Controversies
{notableControversies}
  `,
  variables: [
    'politicianName', 'fullName', 'partyName', 'currentPosition', 'stateOfOrigin',
    'age', 'yearsInPolitics', 'politicalBackground', 'verificationStatus',
    'activityLevel', 'lastMajorStatement', 'twitterHandle', 'twitterFollowers',
    'facebookPage', 'facebookFollowers', 'instagramHandle', 'instagramFollowers',
    'keyAchievements', 'notableControversies'
  ],
  formatting: {
    fontSize: 12,
    fontFamily: 'Arial',
    lineHeight: 1.5,
    marginTop: 0,
    marginBottom: 15,
    alignment: 'left',
    includePageBreak: false
  },
  isRequired: true
};

export const SENTIMENT_ANALYSIS_TEMPLATE: ReportTemplateContent = {
  id: 'sentiment-analysis-template',
  name: 'Sentiment Analysis Template',
  description: 'Detailed sentiment analysis for individual politician',
  template: `
# Sentiment Analysis - {politicianName}

## Overall Sentiment Score: {overallSentiment}

### Sentiment Distribution
- **Very Positive**: {veryPositivePercentage}% ({veryPositiveCount} mentions)
- **Positive**: {positivePercentage}% ({positiveCount} mentions)
- **Neutral**: {neutralPercentage}% ({neutralCount} mentions)
- **Negative**: {negativePercentage}% ({negativeCount} mentions)
- **Very Negative**: {veryNegativePercentage}% ({veryNegativeCount} mentions)

## Platform-Specific Sentiment
{platformSentiment}

## Sentiment Trends Over Time
{sentimentTrends}

## Top Positive Mentions
{topPositiveMentions}

## Top Negative Mentions
{topNegativeMentions}

## Sentiment Drivers
### Positive Drivers
{positiveDrivers}

### Negative Drivers
{negativeDrivers}

## Comparative Analysis
{comparativeAnalysis}
  `,
  variables: [
    'politicianName', 'overallSentiment',
    'veryPositivePercentage', 'veryPositiveCount',
    'positivePercentage', 'positiveCount',
    'neutralPercentage', 'neutralCount',
    'negativePercentage', 'negativeCount',
    'veryNegativePercentage', 'veryNegativeCount',
    'platformSentiment', 'sentimentTrends',
    'topPositiveMentions', 'topNegativeMentions',
    'positiveDrivers', 'negativeDrivers', 'comparativeAnalysis'
  ],
  formatting: {
    fontSize: 11,
    fontFamily: 'Arial',
    lineHeight: 1.4,
    marginTop: 10,
    marginBottom: 15,
    alignment: 'left',
    includePageBreak: false
  },
  isRequired: true
};

// All Report Templates
export const ALL_REPORT_TEMPLATE_CONTENTS: ReportTemplateContent[] = [
  EXECUTIVE_SUMMARY_TEMPLATE,
  SENTIMENT_OVERVIEW_TEMPLATE,
  PARTY_COMPARISON_TEMPLATE,
  GEOGRAPHIC_ANALYSIS_TEMPLATE,
  TRENDING_TOPICS_TEMPLATE,
  METHODOLOGY_TEMPLATE,
  POLITICIAN_OVERVIEW_TEMPLATE,
  SENTIMENT_ANALYSIS_TEMPLATE
];

// Template Utility Functions
export const getReportTemplateContentById = (id: string): ReportTemplateContent | undefined => {
  return ALL_REPORT_TEMPLATE_CONTENTS.find(template => template.id === id);
};

export const getRequiredTemplates = (): ReportTemplateContent[] => {
  return ALL_REPORT_TEMPLATE_CONTENTS.filter(template => template.isRequired);
};

export const getOptionalTemplates = (): ReportTemplateContent[] => {
  return ALL_REPORT_TEMPLATE_CONTENTS.filter(template => !template.isRequired);
};

export const renderTemplate = (
  templateId: string,
  variables: Record<string, any>
): string => {
  const template = getReportTemplateContentById(templateId);
  if (!template) {
    throw new Error(`Template not found: ${templateId}`);
  }

  let renderedContent = template.template;

  // Replace all variables in the template
  template.variables.forEach(variable => {
    const value = variables[variable] || `[${variable}]`;
    const regex = new RegExp(`{${variable}(?::[^}]*)?}`, 'g');
    renderedContent = renderedContent.replace(regex, String(value));
  });

  return renderedContent;
};

export const validateTemplateVariables = (
  templateId: string,
  variables: Record<string, any>
): { isValid: boolean; missingVariables: string[] } => {
  const template = getReportTemplateContentById(templateId);
  if (!template) {
    return { isValid: false, missingVariables: [] };
  }

  const missingVariables = template.variables.filter(
    variable => !(variable in variables) || variables[variable] === undefined
  );

  return {
    isValid: missingVariables.length === 0,
    missingVariables
  };
};

// Template Processing Functions
export const processTemplate = (
  template: ReportTemplateContent,
  variables: Record<string, any>,
  options: {
    includeFormatting?: boolean;
    validateVariables?: boolean;
  } = {}
): { content: string; formatting?: ReportFormatting; warnings?: string[] } => {
  const warnings: string[] = [];

  // Validate variables if requested
  if (options.validateVariables) {
    const validation = validateTemplateVariables(template.id, variables);
    if (!validation.isValid) {
      validation.missingVariables.forEach(variable => {
        warnings.push(`Missing variable: ${variable}`);
      });
    }
  }

  // Render the template content
  const content = renderTemplate(template.id, variables);

  const result: { content: string; formatting?: ReportFormatting; warnings?: string[] } = {
    content
  };

  if (options.includeFormatting) {
    result.formatting = template.formatting;
  }

  if (warnings.length > 0) {
    result.warnings = warnings;
  }

  return result;
};

export const combineTemplates = (
  templates: Array<{
    template: ReportTemplateContent;
    variables: Record<string, any>;
  }>,
  separator: string = '\n\n'
): string => {
  return templates
    .map(({ template, variables }) => renderTemplate(template.id, variables))
    .join(separator);
};