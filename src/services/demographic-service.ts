import { dataLoader } from './data-loader';

// Types for demographic data
export interface DemographicClassification {
  education: {
    level: 'Secondary' | 'Tertiary' | 'Postgraduate' | 'Primary' | 'Undefined';
    confidence: number;
    details?: string;
  };
  occupation: {
    sector: 'Public Sector' | 'Private Sector' | 'Student' | 'Unemployed' | 
            'Self-Employed' | 'Professional Services' | 'Technology' | 'Agriculture' | 'Undefined';
    confidence: number;
    details?: string;
  };
  ageGroup: {
    range: '18-25' | '26-35' | '36-45' | '46-55' | '56-65' | '65+' | 'Undefined';
    confidence: number;
  };
  gender: {
    classification: 'Male' | 'Female' | 'Non-Binary' | 'Undefined';
    confidence: number;
  };
}

export interface DemographicSentimentData {
  ageGroups: Record<string, number>;
  education: Record<string, number>;
  occupation: Record<string, number>;
  gender: Record<string, number>;
}

interface DemographicDistributions {
  demographicDistributions: {
    education: Record<string, number>;
    occupation: Record<string, number>;
    ageGroups: Record<string, number>;
    gender: Record<string, number>;
  };
}

interface DemographicSentimentPatterns {
  demographicSentimentPatterns: {
    education: Record<string, { baseScore: number; variance: number }>;
    occupation: Record<string, { baseScore: number; [key: string]: number }>;
    ageGroups: Record<string, { baseScore: number; variance: number; [key: string]: number }>;
    gender: Record<string, { baseScore: number; variance: number }>;
  };
}

interface DemographicDetails {
  demographicDetails: {
    education: Record<string, string[]>;
    occupation: Record<string, string[]>;
  };
}

class DemographicService {
  private instance: DemographicService | null = null;
  private cache: Map<string, any> = new Map();

  static getInstance(): DemographicService {
    if (!DemographicService.prototype.instance) {
      DemographicService.prototype.instance = new DemographicService();
    }
    return DemographicService.prototype.instance;
  }

  async getDemographicDistributions(): Promise<DemographicDistributions> {
    const cacheKey = 'demographic-distributions';
    
    return await dataLoader.loadData<DemographicDistributions>(
      cacheKey,
      async () => {
        const response = await fetch('/data/core/demographic-distributions.json');
        if (!response.ok) {
          throw new Error('Failed to load demographic distributions');
        }
        return response.json();
      }
    );
  }

  async getDemographicSentimentPatterns(): Promise<DemographicSentimentPatterns> {
    const cacheKey = 'demographic-sentiment-patterns';
    
    return await dataLoader.loadData<DemographicSentimentPatterns>(
      cacheKey,
      async () => {
        const response = await fetch('/data/core/demographic-sentiment-patterns.json');
        if (!response.ok) {
          throw new Error('Failed to load demographic sentiment patterns');
        }
        return response.json();
      }
    );
  }

  async getDemographicDetails(): Promise<DemographicDetails> {
    const cacheKey = 'demographic-details';
    
    return await dataLoader.loadData<DemographicDetails>(
      cacheKey,
      async () => {
        const response = await fetch('/data/core/demographic-details.json');
        if (!response.ok) {
          throw new Error('Failed to load demographic details');
        }
        return response.json();
      }
    );
  }

  async generateDemographicClassification(politicianId: string): Promise<DemographicClassification> {
    const politicianIndex = parseInt(politicianId.split('_')[1] || '1');
    const hasFullData = Math.random() > 0.22; // 78% have demographic data
    
    if (!hasFullData) {
      return {
        education: { level: 'Undefined', confidence: 0.0 },
        occupation: { sector: 'Undefined', confidence: 0.0 },
        ageGroup: { range: 'Undefined', confidence: 0.0 },
        gender: { classification: 'Undefined', confidence: 0.0 }
      };
    }
    
    const [distributions, details] = await Promise.all([
      this.getDemographicDistributions(),
      this.getDemographicDetails()
    ]);

    // Generate realistic demographic data based on distributions
    const educationRand = (politicianIndex * 0.123) % 1;
    const occupationRand = (politicianIndex * 0.456) % 1;
    const ageRand = (politicianIndex * 0.789) % 1;
    const genderRand = (politicianIndex * 0.321) % 1;
    
    // Determine education level
    const educationLevel = this.selectFromDistribution(
      educationRand, 
      distributions.demographicDistributions.education
    ) as DemographicClassification['education']['level'];
    
    // Determine occupation
    const occupationSector = this.selectFromDistribution(
      occupationRand, 
      distributions.demographicDistributions.occupation
    ) as DemographicClassification['occupation']['sector'];
    
    // Determine age group
    const ageRange = this.selectFromDistribution(
      ageRand, 
      distributions.demographicDistributions.ageGroups
    ) as DemographicClassification['ageGroup']['range'];
    
    // Determine gender
    const genderClassification = this.selectFromDistribution(
      genderRand, 
      distributions.demographicDistributions.gender
    ) as DemographicClassification['gender']['classification'];
    
    return {
      education: {
        level: educationLevel,
        confidence: 0.70 + Math.random() * 0.25,
        details: this.getEducationDetails(educationLevel, details.demographicDetails.education)
      },
      occupation: {
        sector: occupationSector,
        confidence: 0.65 + Math.random() * 0.25,
        details: this.getOccupationDetails(occupationSector, details.demographicDetails.occupation)
      },
      ageGroup: {
        range: ageRange,
        confidence: 0.75 + Math.random() * 0.20
      },
      gender: {
        classification: genderClassification,
        confidence: 0.80 + Math.random() * 0.15
      }
    };
  }

  async generateDemographicBreakdown(politicianId: string): Promise<DemographicSentimentData> {
    const classification = await this.generateDemographicClassification(politicianId);
    const sentimentPatterns = await this.getDemographicSentimentPatterns();
    
    // Generate sentiment scores for each demographic dimension
    const ageGroupSentiment = await this.generateAgeGroupSentiment(politicianId, classification, sentimentPatterns);
    const educationSentiment = await this.generateEducationSentiment(politicianId, classification, sentimentPatterns);
    const occupationSentiment = await this.generateOccupationSentiment(politicianId, classification, sentimentPatterns);
    const genderSentiment = await this.generateGenderSentiment(politicianId, classification, sentimentPatterns);
    
    return {
      ageGroups: ageGroupSentiment,
      education: educationSentiment,
      occupation: occupationSentiment,
      gender: genderSentiment
    };
  }

  private selectFromDistribution(randomValue: number, distribution: Record<string, number>): string {
    let cumulative = 0;
    for (const [key, probability] of Object.entries(distribution)) {
      cumulative += probability;
      if (randomValue <= cumulative) {
        return key;
      }
    }
    return Object.keys(distribution)[0]; // fallback
  }

  private getEducationDetails(level: string, educationDetails: Record<string, string[]>): string {
    const options = educationDetails[level] || educationDetails['Undefined'];
    return options[Math.floor(Math.random() * options.length)];
  }

  private getOccupationDetails(sector: string, occupationDetails: Record<string, string[]>): string {
    const options = occupationDetails[sector] || occupationDetails['Undefined'];
    return options[Math.floor(Math.random() * options.length)];
  }

  private async generateAgeGroupSentiment(
    politicianId: string, 
    classification: DemographicClassification,
    sentimentPatterns: DemographicSentimentPatterns
  ): Promise<Record<string, number>> {
    const basePattern = sentimentPatterns.demographicSentimentPatterns.ageGroups[classification.ageGroup.range];
    const baseScore = basePattern?.baseScore || 0.50;
    const variance = basePattern?.variance || 0.15;
    
    const sentiment: Record<string, number> = {};
    
    // Generate sentiment for each age group with realistic variations
    Object.keys(sentimentPatterns.demographicSentimentPatterns.ageGroups).forEach(ageGroup => {
      if (ageGroup === 'Undefined') return;
      
      const pattern = sentimentPatterns.demographicSentimentPatterns.ageGroups[ageGroup];
      let score = pattern.baseScore;
      
      // Adjust based on politician's actual age group
      if (ageGroup === classification.ageGroup.range) {
        score = baseScore + (Math.random() - 0.5) * variance;
      } else {
        // Cross-demographic appeal calculation
        const ageDifference = Math.abs(
          this.getAgeGroupIndex(ageGroup) - this.getAgeGroupIndex(classification.ageGroup.range)
        );
        const appealFactor = Math.max(0.3, 1 - (ageDifference * 0.15));
        score = baseScore * appealFactor + (Math.random() - 0.5) * 0.1;
      }
      
      sentiment[ageGroup] = Math.max(0, Math.min(1, score));
    });
    
    return sentiment;
  }

  private async generateEducationSentiment(
    politicianId: string,
    classification: DemographicClassification,
    sentimentPatterns: DemographicSentimentPatterns
  ): Promise<Record<string, number>> {
    const basePattern = sentimentPatterns.demographicSentimentPatterns.education[classification.education.level];
    const baseScore = basePattern?.baseScore || 0.50;
    const variance = basePattern?.variance || 0.15;
    
    const sentiment: Record<string, number> = {};
    
    Object.keys(sentimentPatterns.demographicSentimentPatterns.education).forEach(educationLevel => {
      if (educationLevel === 'Undefined') return;
      
      const pattern = sentimentPatterns.demographicSentimentPatterns.education[educationLevel];
      let score = pattern.baseScore;
      
      if (educationLevel === classification.education.level) {
        score = baseScore + (Math.random() - 0.5) * variance;
      } else {
        // Education level appeal calculation
        const levelDifference = Math.abs(
          this.getEducationLevelIndex(educationLevel) - this.getEducationLevelIndex(classification.education.level)
        );
        const appealFactor = Math.max(0.4, 1 - (levelDifference * 0.12));
        score = baseScore * appealFactor + (Math.random() - 0.5) * 0.08;
      }
      
      sentiment[educationLevel] = Math.max(0, Math.min(1, score));
    });
    
    return sentiment;
  }

  private async generateOccupationSentiment(
    politicianId: string,
    classification: DemographicClassification,
    sentimentPatterns: DemographicSentimentPatterns
  ): Promise<Record<string, number>> {
    const basePattern = sentimentPatterns.demographicSentimentPatterns.occupation[classification.occupation.sector];
    const baseScore = basePattern?.baseScore || 0.50;
    
    const sentiment: Record<string, number> = {};
    
    Object.keys(sentimentPatterns.demographicSentimentPatterns.occupation).forEach(occupationSector => {
      if (occupationSector === 'Undefined') return;
      
      const pattern = sentimentPatterns.demographicSentimentPatterns.occupation[occupationSector];
      let score = pattern.baseScore;
      
      if (occupationSector === classification.occupation.sector) {
        score = baseScore + (Math.random() - 0.5) * 0.12;
      } else {
        // Occupation sector appeal calculation
        const sectorAffinity = this.getOccupationAffinity(
          classification.occupation.sector, 
          occupationSector
        );
        score = baseScore * sectorAffinity + (Math.random() - 0.5) * 0.08;
      }
      
      sentiment[occupationSector] = Math.max(0, Math.min(1, score));
    });
    
    return sentiment;
  }

  private async generateGenderSentiment(
    politicianId: string,
    classification: DemographicClassification,
    sentimentPatterns: DemographicSentimentPatterns
  ): Promise<Record<string, number>> {
    const basePattern = sentimentPatterns.demographicSentimentPatterns.gender[classification.gender.classification];
    const baseScore = basePattern?.baseScore || 0.50;
    const variance = basePattern?.variance || 0.15;
    
    const sentiment: Record<string, number> = {};
    
    Object.keys(sentimentPatterns.demographicSentimentPatterns.gender).forEach(gender => {
      if (gender === 'Undefined') return;
      
      const pattern = sentimentPatterns.demographicSentimentPatterns.gender[gender];
      let score = pattern.baseScore;
      
      if (gender === classification.gender.classification) {
        score = baseScore + (Math.random() - 0.5) * variance;
      } else {
        // Cross-gender appeal
        score = baseScore * 0.92 + (Math.random() - 0.5) * 0.1;
      }
      
      sentiment[gender] = Math.max(0, Math.min(1, score));
    });
    
    return sentiment;
  }

  private getAgeGroupIndex(ageGroup: string): number {
    const ageGroups = ['18-25', '26-35', '36-45', '46-55', '56-65', '65+'];
    return ageGroups.indexOf(ageGroup);
  }

  private getEducationLevelIndex(level: string): number {
    const levels = ['Primary', 'Secondary', 'Tertiary', 'Postgraduate'];
    return levels.indexOf(level);
  }

  private getOccupationAffinity(sector1: string, sector2: string): number {
    // Define occupation sector affinities
    const affinities: Record<string, Record<string, number>> = {
      'Public Sector': {
        'Professional Services': 0.8,
        'Private Sector': 0.7,
        'Technology': 0.6,
        'Student': 0.5,
        'Self-Employed': 0.4,
        'Agriculture': 0.3,
        'Unemployed': 0.2
      },
      'Technology': {
        'Professional Services': 0.9,
        'Private Sector': 0.8,
        'Student': 0.7,
        'Public Sector': 0.6,
        'Self-Employed': 0.5,
        'Agriculture': 0.2,
        'Unemployed': 0.3
      },
      'Student': {
        'Technology': 0.8,
        'Professional Services': 0.7,
        'Private Sector': 0.6,
        'Public Sector': 0.5,
        'Self-Employed': 0.4,
        'Agriculture': 0.3,
        'Unemployed': 0.6
      }
    };
    
    return affinities[sector1]?.[sector2] || 0.5;
  }
}

export const demographicService = DemographicService.getInstance();