/**
 * Dynamic Dropdown Service
 * 
 * This service generates dropdown options dynamically from current data,
 * adds automatic updates when new data is added, and implements proper
 * sorting and categorization.
 * 
 * Features:
 * - Dynamic dropdown option generation from JSON data
 * - Automatic updates when new data is added
 * - Proper sorting and categorization
 * - Search and filtering within dropdowns
 * - Hierarchical dropdown support
 * - Performance optimization with virtualization
 */

import { EventEmitter } from 'events';
import { LoadingStates } from '../constants/enums';
import { ERROR_MESSAGES } from '../constants/messages';
import { dataLoader } from './data-loader';
import { dynamicFilterService } from './dynamic-filter-service';

export interface DropdownOption {
  value: string;
  label: string;
  description?: string;
  icon?: string;
  color?: string;
  badge?: string;
  disabled?: boolean;
  group?: string;
  metadata?: Record<string, any>;
  searchTerms?: string[];
  sortOrder?: number;
}

export interface DropdownGroup {
  id: string;
  label: string;
  description?: string;
  options: DropdownOption[];
  isCollapsed?: boolean;
  sortOrder?: number;
}

export interface DropdownConfig {
  id: string;
  name: string;
  dataSource: string;
  searchable: boolean;
  multiSelect: boolean;
  grouped: boolean;
  sortBy: 'label' | 'value' | 'sortOrder' | 'usage' | 'alphabetical';
  sortDirection: 'asc' | 'desc';
  maxOptions: number;
  enableVirtualization: boolean;
  placeholder: string;
  emptyMessage: string;
  loadingMessage: string;
  errorMessage: string;
}

export interface DropdownState {
  options: DropdownOption[];
  groups: DropdownGroup[];
  filteredOptions: DropdownOption[];
  searchQuery: string;
  selectedValues: string[];
  loadingState: LoadingStates;
  error: string | null;
  lastUpdated: Date;
}

/**
 * Dynamic Dropdown Service for automatic dropdown population
 */
export class DynamicDropdownService extends EventEmitter {
  private static instance: DynamicDropdownService;
  
  private dropdowns = new Map<string, DropdownState>();
  private configs = new Map<string, DropdownConfig>();
  private usageStats = new Map<string, Map<string, number>>();
  
  private constructor() {
    super();
    this.initializeDataSubscriptions();
    this.registerDefaultDropdowns();
  }
  
  static getInstance(): DynamicDropdownService {
    if (!DynamicDropdownService.instance) {
      DynamicDropdownService.instance = new DynamicDropdownService();
    }
    return DynamicDropdownService.instance;
  }
  
  /**
   * Initialize data subscriptions for automatic updates
   */
  private initializeDataSubscriptions(): void {
    // Subscribe to data loader events
    dataLoader.on('loadSuccess', (event) => {
      this.handleDataUpdate(event.key, event.data);
    });
    
    // Subscribe to filter service events
    dynamicFilterService.on('filtersUpdated', (event) => {
      this.handleFilterUpdate(event.affectedCategories);
    });
  }
  
  /**
   * Register default dropdown configurations
   */
  private registerDefaultDropdowns(): void {
    // Political Parties Dropdown
    this.registerDropdown({
      id: 'political-parties',
      name: 'Political Parties',
      dataSource: 'parties',
      searchable: true,
      multiSelect: true,
      grouped: false,
      sortBy: 'alphabetical',
      sortDirection: 'asc',
      maxOptions: 50,
      enableVirtualization: false,
      placeholder: 'Select political parties...',
      emptyMessage: 'No political parties available',
      loadingMessage: 'Loading political parties...',
      errorMessage: 'Failed to load political parties'
    });
    
    // States Dropdown
    this.registerDropdown({
      id: 'nigerian-states',
      name: 'Nigerian States',
      dataSource: 'states',
      searchable: true,
      multiSelect: true,
      grouped: true, // Group by region
      sortBy: 'alphabetical',
      sortDirection: 'asc',
      maxOptions: 37, // 36 states + FCT
      enableVirtualization: false,
      placeholder: 'Select states...',
      emptyMessage: 'No states available',
      loadingMessage: 'Loading states...',
      errorMessage: 'Failed to load states'
    });
    
    // Politicians Dropdown
    this.registerDropdown({
      id: 'politicians',
      name: 'Politicians',
      dataSource: 'politicians',
      searchable: true,
      multiSelect: true,
      grouped: true, // Group by party or position
      sortBy: 'alphabetical',
      sortDirection: 'asc',
      maxOptions: 1000,
      enableVirtualization: true,
      placeholder: 'Search politicians...',
      emptyMessage: 'No politicians found',
      loadingMessage: 'Loading politicians...',
      errorMessage: 'Failed to load politicians'
    });
    
    // Social Platforms Dropdown
    this.registerDropdown({
      id: 'social-platforms',
      name: 'Social Platforms',
      dataSource: 'platforms',
      searchable: false,
      multiSelect: true,
      grouped: false,
      sortBy: 'usage',
      sortDirection: 'desc',
      maxOptions: 20,
      enableVirtualization: false,
      placeholder: 'Select platforms...',
      emptyMessage: 'No platforms available',
      loadingMessage: 'Loading platforms...',
      errorMessage: 'Failed to load platforms'
    });
    
    // Topics Dropdown
    this.registerDropdown({
      id: 'policy-topics',
      name: 'Policy Topics',
      dataSource: 'topics',
      searchable: true,
      multiSelect: true,
      grouped: true, // Group by category
      sortBy: 'usage',
      sortDirection: 'desc',
      maxOptions: 200,
      enableVirtualization: true,
      placeholder: 'Search topics...',
      emptyMessage: 'No topics found',
      loadingMessage: 'Loading topics...',
      errorMessage: 'Failed to load topics'
    });
  }
  
  /**
   * Register a new dropdown configuration
   */
  registerDropdown(config: DropdownConfig): void {
    this.configs.set(config.id, config);
    
    // Initialize dropdown state
    this.dropdowns.set(config.id, {
      options: [],
      groups: [],
      filteredOptions: [],
      searchQuery: '',
      selectedValues: [],
      loadingState: LoadingStates.IDLE,
      error: null,
      lastUpdated: new Date()
    });
    
    // Initialize usage stats
    this.usageStats.set(config.id, new Map());
    
    // Load initial data
    this.loadDropdownData(config.id);
  }
  
  /**
   * Load dropdown data based on configuration
   */
  async loadDropdownData(dropdownId: string): Promise<void> {
    const config = this.configs.get(dropdownId);
    const state = this.dropdowns.get(dropdownId);
    
    if (!config || !state) return;
    
    state.loadingState = LoadingStates.LOADING;
    state.error = null;
    this.emit('dropdownLoading', { dropdownId });
    
    try {
      let options: DropdownOption[] = [];
      
      switch (config.dataSource) {
        case 'parties':
          options = await this.generatePartyDropdownOptions();
          break;
        case 'states':
          options = await this.generateStateDropdownOptions();
          break;
        case 'politicians':
          options = await this.generatePoliticianDropdownOptions();
          break;
        case 'platforms':
          options = await this.generatePlatformDropdownOptions();
          break;
        case 'topics':
          options = await this.generateTopicDropdownOptions();
          break;
        default:
          throw new Error(`Unknown data source: ${config.dataSource}`);
      }
      
      // Apply sorting
      options = this.sortOptions(options, config);
      
      // Apply max options limit
      if (options.length > config.maxOptions) {
        options = options.slice(0, config.maxOptions);
      }
      
      // Generate groups if needed
      const groups = config.grouped ? this.generateGroups(options, config) : [];
      
      // Update state
      state.options = options;
      state.groups = groups;
      state.filteredOptions = options;
      state.loadingState = LoadingStates.SUCCESS;
      state.lastUpdated = new Date();
      
      this.emit('dropdownLoaded', { dropdownId, options, groups });
      
    } catch (error) {
      state.loadingState = LoadingStates.ERROR;
      state.error = error instanceof Error ? error.message : ERROR_MESSAGES.FILTER_LOAD_OPTIONS_ERROR;
      
      this.emit('dropdownError', { dropdownId, error: state.error });
    }
  }
  
  /**
   * Generate dropdown options for political parties
   */
  private async generatePartyDropdownOptions(): Promise<DropdownOption[]> {
    const filterOptions = await dynamicFilterService.generatePartyOptions();
    
    return filterOptions.map(option => ({
      value: option.value,
      label: option.label,
      description: option.description,
      color: option.color,
      badge: option.metadata?.status === 'active' ? 'Active' : undefined,
      disabled: !option.isAvailable,
      metadata: option.metadata,
      searchTerms: [
        option.label,
        option.metadata?.abbreviation || '',
        ...(option.metadata?.ideology || [])
      ].filter(Boolean),
      sortOrder: option.count || 0
    }));
  }
  
  /**
   * Generate dropdown options for states
   */
  private async generateStateDropdownOptions(): Promise<DropdownOption[]> {
    const filterOptions = await dynamicFilterService.generateStateOptions();
    
    return filterOptions.map(option => ({
      value: option.value,
      label: option.label,
      description: option.description,
      group: option.metadata?.region || 'Other',
      metadata: option.metadata,
      searchTerms: [
        option.label,
        option.metadata?.code || '',
        option.metadata?.capital || '',
        option.metadata?.region || ''
      ].filter(Boolean),
      sortOrder: option.metadata?.population || 0
    }));
  }
  
  /**
   * Generate dropdown options for politicians
   */
  private async generatePoliticianDropdownOptions(): Promise<DropdownOption[]> {
    const filterOptions = await dynamicFilterService.generatePoliticianOptions();
    
    return filterOptions.map(option => ({
      value: option.value,
      label: option.label,
      description: option.description,
      group: option.metadata?.party || 'Independent',
      badge: option.metadata?.verificationStatus === 'verified' ? 'Verified' : undefined,
      disabled: !option.isAvailable,
      metadata: option.metadata,
      searchTerms: [
        option.label,
        option.metadata?.firstName || '',
        option.metadata?.lastName || '',
        option.metadata?.party || '',
        option.metadata?.position || ''
      ].filter(Boolean),
      sortOrder: option.count || 0
    }));
  }
  
  /**
   * Generate dropdown options for platforms
   */
  private async generatePlatformDropdownOptions(): Promise<DropdownOption[]> {
    const filterOptions = await dynamicFilterService.generatePlatformOptions();
    
    return filterOptions.map(option => ({
      value: option.value,
      label: option.label,
      description: option.description,
      color: option.color,
      icon: this.getPlatformIcon(option.value),
      metadata: option.metadata,
      searchTerms: [option.label],
      sortOrder: option.count || 0
    }));
  }
  
  /**
   * Generate dropdown options for topics
   */
  private async generateTopicDropdownOptions(): Promise<DropdownOption[]> {
    const filterOptions = await dynamicFilterService.generateTopicOptions();
    
    return filterOptions.map(option => ({
      value: option.value,
      label: option.label,
      description: option.description,
      group: option.metadata?.category || 'General',
      badge: option.metadata?.urgency === 'high' ? 'Urgent' : undefined,
      disabled: !option.isAvailable,
      metadata: option.metadata,
      searchTerms: [
        option.label,
        ...(option.metadata?.keywords || [])
      ].filter(Boolean),
      sortOrder: option.count || 0
    }));
  }
  
  /**
   * Sort dropdown options based on configuration
   */
  private sortOptions(options: DropdownOption[], config: DropdownConfig): DropdownOption[] {
    const sorted = [...options];
    
    sorted.sort((a, b) => {
      let comparison = 0;
      
      switch (config.sortBy) {
        case 'label':
        case 'alphabetical':
          comparison = a.label.localeCompare(b.label);
          break;
        case 'value':
          comparison = a.value.localeCompare(b.value);
          break;
        case 'sortOrder':
          comparison = (a.sortOrder || 0) - (b.sortOrder || 0);
          break;
        case 'usage':
          const usageA = this.getUsageCount(config.id, a.value);
          const usageB = this.getUsageCount(config.id, b.value);
          comparison = usageB - usageA; // Higher usage first
          break;
      }
      
      return config.sortDirection === 'desc' ? -comparison : comparison;
    });
    
    return sorted;
  }
  
  /**
   * Generate groups for dropdown options
   */
  private generateGroups(options: DropdownOption[], config: DropdownConfig): DropdownGroup[] {
    if (!config.grouped) return [];
    
    const groupMap = new Map<string, DropdownOption[]>();
    
    options.forEach(option => {
      const groupKey = option.group || 'Other';
      if (!groupMap.has(groupKey)) {
        groupMap.set(groupKey, []);
      }
      groupMap.get(groupKey)!.push(option);
    });
    
    const groups: DropdownGroup[] = Array.from(groupMap.entries()).map(([groupId, groupOptions]) => ({
      id: groupId,
      label: this.formatGroupLabel(groupId, config.dataSource),
      options: groupOptions,
      isCollapsed: false,
      sortOrder: this.getGroupSortOrder(groupId, config.dataSource)
    }));
    
    // Sort groups
    groups.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    
    return groups;
  }
  
  /**
   * Format group labels for better display
   */
  private formatGroupLabel(groupId: string, dataSource: string): string {
    const labelMappings: Record<string, Record<string, string>> = {
      states: {
        'north-central': 'North Central',
        'north-east': 'North East',
        'north-west': 'North West',
        'south-east': 'South East',
        'south-south': 'South South',
        'south-west': 'South West'
      }
    };
    
    return labelMappings[dataSource]?.[groupId] || groupId;
  }
  
  /**
   * Get group sort order for consistent ordering
   */
  private getGroupSortOrder(groupId: string, dataSource: string): number {
    const sortOrders: Record<string, Record<string, number>> = {
      states: {
        'north-central': 1,
        'north-east': 2,
        'north-west': 3,
        'south-east': 4,
        'south-south': 5,
        'south-west': 6
      }
    };
    
    return sortOrders[dataSource]?.[groupId] || 999;
  }
  
  /**
   * Get platform icon for display
   */
  private getPlatformIcon(platform: string): string {
    const icons: Record<string, string> = {
      'Twitter': '🐦',
      'Facebook': '📘',
      'Instagram': '📷',
      'TikTok': '🎵',
      'YouTube': '📺',
      'LinkedIn': '💼',
      'Threads': '🧵'
    };
    
    return icons[platform] || '🌐';
  }
  
  /**
   * Search dropdown options
   */
  searchDropdown(dropdownId: string, query: string): DropdownOption[] {
    const state = this.dropdowns.get(dropdownId);
    if (!state) return [];
    
    state.searchQuery = query;
    
    if (!query.trim()) {
      state.filteredOptions = state.options;
      return state.options;
    }
    
    const searchTerm = query.toLowerCase();
    const filtered = state.options.filter(option => {
      const searchableText = [
        option.label,
        option.description || '',
        ...(option.searchTerms || [])
      ].join(' ').toLowerCase();
      
      return searchableText.includes(searchTerm);
    });
    
    state.filteredOptions = filtered;
    this.emit('dropdownSearched', { dropdownId, query, results: filtered });
    
    return filtered;
  }
  
  /**
   * Select dropdown option(s)
   */
  selectOption(dropdownId: string, value: string | string[]): void {
    const config = this.configs.get(dropdownId);
    const state = this.dropdowns.get(dropdownId);
    
    if (!config || !state) return;
    
    const values = Array.isArray(value) ? value : [value];
    
    if (config.multiSelect) {
      // Add to existing selections
      const newSelections = [...new Set([...state.selectedValues, ...values])];
      state.selectedValues = newSelections;
    } else {
      // Replace selection
      state.selectedValues = values.slice(0, 1);
    }
    
    // Update usage statistics
    values.forEach(val => this.incrementUsage(dropdownId, val));
    
    this.emit('dropdownSelectionChanged', { 
      dropdownId, 
      selectedValues: state.selectedValues,
      newValues: values
    });
  }
  
  /**
   * Deselect dropdown option(s)
   */
  deselectOption(dropdownId: string, value: string | string[]): void {
    const state = this.dropdowns.get(dropdownId);
    if (!state) return;
    
    const values = Array.isArray(value) ? value : [value];
    state.selectedValues = state.selectedValues.filter(val => !values.includes(val));
    
    this.emit('dropdownSelectionChanged', { 
      dropdownId, 
      selectedValues: state.selectedValues,
      removedValues: values
    });
  }
  
  /**
   * Clear dropdown selection
   */
  clearSelection(dropdownId: string): void {
    const state = this.dropdowns.get(dropdownId);
    if (!state) return;
    
    const previousValues = [...state.selectedValues];
    state.selectedValues = [];
    
    this.emit('dropdownSelectionChanged', { 
      dropdownId, 
      selectedValues: [],
      removedValues: previousValues
    });
  }
  
  /**
   * Get dropdown state
   */
  getDropdownState(dropdownId: string): DropdownState | null {
    return this.dropdowns.get(dropdownId) || null;
  }
  
  /**
   * Get dropdown configuration
   */
  getDropdownConfig(dropdownId: string): DropdownConfig | null {
    return this.configs.get(dropdownId) || null;
  }
  
  /**
   * Handle data updates
   */
  private handleDataUpdate(dataKey: string, data: any): void {
    // Find dropdowns that use this data source
    const affectedDropdowns = Array.from(this.configs.entries())
      .filter(([_, config]) => this.isDataSourceAffected(config.dataSource, dataKey))
      .map(([id]) => id);
    
    // Reload affected dropdowns
    affectedDropdowns.forEach(dropdownId => {
      this.loadDropdownData(dropdownId);
    });
  }
  
  /**
   * Handle filter updates
   */
  private handleFilterUpdate(affectedCategories: string[]): void {
    // Map filter categories to dropdown data sources
    const categoryToSource: Record<string, string> = {
      'party': 'parties',
      'state': 'states',
      'politician': 'politicians',
      'platform': 'platforms',
      'topic': 'topics'
    };
    
    const affectedSources = affectedCategories
      .map(cat => categoryToSource[cat])
      .filter(Boolean);
    
    // Reload affected dropdowns
    Array.from(this.configs.entries())
      .filter(([_, config]) => affectedSources.includes(config.dataSource))
      .forEach(([dropdownId]) => {
        this.loadDropdownData(dropdownId);
      });
  }
  
  /**
   * Check if data source is affected by data key
   */
  private isDataSourceAffected(dataSource: string, dataKey: string): boolean {
    const mappings: Record<string, string[]> = {
      'parties': ['parties'],
      'states': ['states'],
      'politicians': ['politicians', 'parties', 'states'],
      'platforms': ['sentiment-data', 'engagement-metrics'],
      'topics': ['topic-trends']
    };
    
    return mappings[dataSource]?.includes(dataKey) || false;
  }
  
  /**
   * Usage statistics management
   */
  private incrementUsage(dropdownId: string, value: string): void {
    const stats = this.usageStats.get(dropdownId);
    if (!stats) return;
    
    const currentCount = stats.get(value) || 0;
    stats.set(value, currentCount + 1);
  }
  
  private getUsageCount(dropdownId: string, value: string): number {
    const stats = this.usageStats.get(dropdownId);
    return stats?.get(value) || 0;
  }
  
  /**
   * Get dropdown statistics
   */
  getDropdownStatistics(dropdownId: string): {
    totalOptions: number;
    filteredOptions: number;
    selectedOptions: number;
    groups: number;
    lastUpdated: Date;
    loadingState: LoadingStates;
  } | null {
    const state = this.dropdowns.get(dropdownId);
    if (!state) return null;
    
    return {
      totalOptions: state.options.length,
      filteredOptions: state.filteredOptions.length,
      selectedOptions: state.selectedValues.length,
      groups: state.groups.length,
      lastUpdated: state.lastUpdated,
      loadingState: state.loadingState
    };
  }
  
  /**
   * Refresh all dropdowns
   */
  refreshAllDropdowns(): void {
    Array.from(this.configs.keys()).forEach(dropdownId => {
      this.loadDropdownData(dropdownId);
    });
  }
  
  /**
   * Cleanup resources
   */
  destroy(): void {
    this.dropdowns.clear();
    this.configs.clear();
    this.usageStats.clear();
    this.removeAllListeners();
  }
}

// Export singleton instance
export const dynamicDropdownService = DynamicDropdownService.getInstance();
export default DynamicDropdownService;