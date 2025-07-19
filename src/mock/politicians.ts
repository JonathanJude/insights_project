import type { Politician } from '../types';
import { PoliticalParty, NigerianState, Gender, AgeGroup, PoliticalLevel, SentimentLabel, PoliticalPosition } from '../types';

export const mockPoliticians: Politician[] = [
  {
    id: 'pol_001',
    name: 'Peter Obi',
    firstName: 'Peter',
    lastName: 'Obi',
    imageUrl: undefined,
    party: PoliticalParty.LP,
    position: PoliticalPosition.ASPIRANT,
    state: NigerianState.ANAMBRA,
    politicalLevel: PoliticalLevel.FEDERAL,
    gender: Gender.MALE,
    ageGroup: AgeGroup.SENIOR,
    isActive: true,
    socialMediaHandles: {
      twitter: '@PeterObi',
      facebook: 'PeterObiOfficial',
      instagram: 'peterobi'
    },
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2024-01-15T09:00:00Z',
    recentSentiment: {
      score: 0.72,
      label: SentimentLabel.POSITIVE,
      mentionCount: 2450,
      trend: 'up',
      changePercentage: 15.3
    }
  },
  {
    id: 'pol_002',
    name: 'Bola Ahmed Tinubu',
    firstName: 'Bola',
    lastName: 'Tinubu',
    imageUrl: undefined,
    party: PoliticalParty.APC,
    position: PoliticalPosition.PRESIDENT,
    state: NigerianState.LAGOS,
    politicalLevel: PoliticalLevel.FEDERAL,
    gender: Gender.MALE,
    ageGroup: AgeGroup.SENIOR,
    isActive: true,
    socialMediaHandles: {
      twitter: '@officialABAT',
      facebook: 'TinubuOfficial'
    },
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2024-01-15T09:00:00Z',
    recentSentiment: {
      score: 0.45,
      label: SentimentLabel.NEUTRAL,
      mentionCount: 3200,
      trend: 'down',
      changePercentage: -8.7
    }
  },
  {
    id: 'pol_003',
    name: 'Atiku Abubakar',
    firstName: 'Atiku',
    lastName: 'Abubakar',
    imageUrl: undefined,
    party: PoliticalParty.PDP,
    position: PoliticalPosition.OTHER,
    state: NigerianState.ADAMAWA,
    politicalLevel: PoliticalLevel.FEDERAL,
    gender: Gender.MALE,
    ageGroup: AgeGroup.SENIOR,
    isActive: true,
    socialMediaHandles: {
      twitter: '@atiku',
      facebook: 'AtikuAbubakar'
    },
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2024-01-15T09:00:00Z',
    recentSentiment: {
      score: 0.58,
      label: SentimentLabel.POSITIVE,
      mentionCount: 1890,
      trend: 'stable',
      changePercentage: 2.1
    }
  },
  {
    id: 'pol_004',
    name: 'Nyesom Wike',
    firstName: 'Nyesom',
    lastName: 'Wike',
    imageUrl: undefined,
    party: PoliticalParty.PDP,
    position: PoliticalPosition.MINISTER,
    state: NigerianState.RIVERS,
    politicalLevel: PoliticalLevel.FEDERAL,
    gender: Gender.MALE,
    ageGroup: AgeGroup.MATURE,
    isActive: true,
    socialMediaHandles: {
      twitter: '@GovWike',
      facebook: 'NyesomWike'
    },
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2024-01-15T09:00:00Z',
    recentSentiment: {
      score: 0.35,
      label: SentimentLabel.NEGATIVE,
      mentionCount: 1650,
      trend: 'down',
      changePercentage: -12.4
    }
  },
  {
    id: 'pol_005',
    name: 'Babajide Sanwo-Olu',
    firstName: 'Babajide',
    lastName: 'Sanwo-Olu',
    imageUrl: undefined,
    party: PoliticalParty.APC,
    position: PoliticalPosition.GOVERNOR,
    state: NigerianState.LAGOS,
    politicalLevel: PoliticalLevel.STATE,
    gender: Gender.MALE,
    ageGroup: AgeGroup.MATURE,
    isActive: true,
    socialMediaHandles: {
      twitter: '@jidesanwoolu',
      facebook: 'BabajideSanwoOlu',
      instagram: 'jidesanwoolu'
    },
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2024-01-15T09:00:00Z',
    recentSentiment: {
      score: 0.68,
      label: SentimentLabel.POSITIVE,
      mentionCount: 980,
      trend: 'up',
      changePercentage: 9.2
    }
  },
  {
    id: 'pol_006',
    name: 'Aisha Yesufu',
    firstName: 'Aisha',
    lastName: 'Yesufu',
    imageUrl: undefined,
    party: PoliticalParty.OTHER,
    position: PoliticalPosition.OTHER,
    state: NigerianState.KADUNA,
    politicalLevel: PoliticalLevel.FEDERAL,
    gender: Gender.FEMALE,
    ageGroup: AgeGroup.MATURE,
    isActive: true,
    socialMediaHandles: {
      twitter: '@AishaYesufu',
      facebook: 'AishaYesufu',
      instagram: 'aishayesufu'
    },
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2024-01-15T09:00:00Z',
    recentSentiment: {
      score: 0.78,
      label: SentimentLabel.POSITIVE,
      mentionCount: 1420,
      trend: 'up',
      changePercentage: 18.6
    }
  },
  {
    id: 'pol_007',
    name: 'Godwin Obaseki',
    firstName: 'Godwin',
    lastName: 'Obaseki',
    imageUrl: undefined,
    party: PoliticalParty.PDP,
    position: PoliticalPosition.GOVERNOR,
    state: NigerianState.EDO,
    politicalLevel: PoliticalLevel.STATE,
    gender: Gender.MALE,
    ageGroup: AgeGroup.SENIOR,
    isActive: true,
    socialMediaHandles: {
      twitter: '@GovernorObaseki',
      facebook: 'GodwinObaseki'
    },
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2024-01-15T09:00:00Z',
    recentSentiment: {
      score: 0.52,
      label: SentimentLabel.POSITIVE,
      mentionCount: 750,
      trend: 'stable',
      changePercentage: 1.8
    }
  },
  {
    id: 'pol_008',
    name: 'Rabiu Kwankwaso',
    firstName: 'Rabiu',
    lastName: 'Kwankwaso',
    imageUrl: undefined,
    party: PoliticalParty.NNPP,
    position: PoliticalPosition.ASPIRANT,
    state: NigerianState.KANO,
    politicalLevel: PoliticalLevel.FEDERAL,
    gender: Gender.MALE,
    ageGroup: AgeGroup.SENIOR,
    isActive: true,
    socialMediaHandles: {
      twitter: '@KwankwasoRM',
      facebook: 'RabiuKwankwaso'
    },
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2024-01-15T09:00:00Z',
    recentSentiment: {
      score: 0.61,
      label: SentimentLabel.POSITIVE,
      mentionCount: 1120,
      trend: 'up',
      changePercentage: 7.3
    }
  },
  {
    id: 'pol_009',
    name: 'Funmilayo Ransome-Kuti',
    firstName: 'Funmilayo',
    lastName: 'Ransome-Kuti',
    imageUrl: undefined,
    party: PoliticalParty.LP,
    position: PoliticalPosition.HOUSE_REP,
    state: NigerianState.OGUN,
    politicalLevel: PoliticalLevel.FEDERAL,
    gender: Gender.FEMALE,
    ageGroup: AgeGroup.MIDDLE,
    isActive: true,
    socialMediaHandles: {
      twitter: '@FunmiRK',
      instagram: 'funmiransome'
    },
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2024-01-15T09:00:00Z',
    recentSentiment: {
      score: 0.69,
      label: SentimentLabel.POSITIVE,
      mentionCount: 680,
      trend: 'up',
      changePercentage: 11.4
    }
  },
  {
    id: 'pol_010',
    name: 'Seyi Makinde',
    firstName: 'Seyi',
    lastName: 'Makinde',
    imageUrl: undefined,
    party: PoliticalParty.PDP,
    position: PoliticalPosition.GOVERNOR,
    state: NigerianState.OYO,
    politicalLevel: PoliticalLevel.STATE,
    gender: Gender.MALE,
    ageGroup: AgeGroup.MATURE,
    isActive: true,
    socialMediaHandles: {
      twitter: '@seyiamakinde',
      facebook: 'SeyiMakinde',
      instagram: 'seyimakinde'
    },
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2024-01-15T09:00:00Z',
    recentSentiment: {
      score: 0.74,
      label: SentimentLabel.POSITIVE,
      mentionCount: 890,
      trend: 'up',
      changePercentage: 13.7
    }
  },
  {
    id: 'pol_011',
    name: 'Chioma Okoli',
    firstName: 'Chioma',
    lastName: 'Okoli',
    imageUrl: undefined,
    party: PoliticalParty.APGA,
    position: PoliticalPosition.SENATOR,
    state: NigerianState.ANAMBRA,
    politicalLevel: PoliticalLevel.FEDERAL,
    gender: Gender.FEMALE,
    ageGroup: AgeGroup.MIDDLE,
    isActive: true,
    socialMediaHandles: {
      twitter: '@ChiomaOkoli',
      facebook: 'ChiomaOkoli'
    },
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2024-01-15T09:00:00Z',
    recentSentiment: {
      score: 0.56,
      label: SentimentLabel.POSITIVE,
      mentionCount: 420,
      trend: 'stable',
      changePercentage: 3.2
    }
  },
  {
    id: 'pol_012',
    name: 'Abdullahi Ganduje',
    firstName: 'Abdullahi',
    lastName: 'Ganduje',
    imageUrl: undefined,
    party: PoliticalParty.APC,
    position: PoliticalPosition.OTHER,
    state: NigerianState.KANO,
    politicalLevel: PoliticalLevel.STATE,
    gender: Gender.MALE,
    ageGroup: AgeGroup.SENIOR,
    isActive: true,
    socialMediaHandles: {
      twitter: '@GovGanduje'
    },
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2024-01-15T09:00:00Z',
    recentSentiment: {
      score: 0.28,
      label: SentimentLabel.NEGATIVE,
      mentionCount: 950,
      trend: 'down',
      changePercentage: -15.8
    }
  }
];

// Helper function to get politicians by party
export const getPoliticiansByParty = (party: PoliticalParty): Politician[] => {
  return mockPoliticians.filter(politician => politician.party === party);
};

// Helper function to get politicians by state
export const getPoliticiansByState = (state: NigerianState): Politician[] => {
  return mockPoliticians.filter(politician => politician.state === state);
};

// Helper function to get politicians by gender
export const getPoliticiansByGender = (gender: Gender): Politician[] => {
  return mockPoliticians.filter(politician => politician.gender === gender);
};

// Helper function to get trending politicians
export const getTrendingPoliticians = (limit: number = 5): Politician[] => {
  return mockPoliticians
    .filter(politician => politician.recentSentiment)
    .sort((a, b) => {
      const aChange = a.recentSentiment?.changePercentage || 0;
      const bChange = b.recentSentiment?.changePercentage || 0;
      return bChange - aChange;
    })
    .slice(0, limit);
};

// Helper function to search politicians
export const searchPoliticians = (query: string): Politician[] => {
  if (!query.trim()) return mockPoliticians;
  
  const searchTerm = query.toLowerCase();
  return mockPoliticians.filter(politician => 
    politician.name.toLowerCase().includes(searchTerm) ||
    politician.position.toLowerCase().includes(searchTerm) ||
    politician.party.toLowerCase().includes(searchTerm) ||
    politician.state.toLowerCase().includes(searchTerm)
  );
};