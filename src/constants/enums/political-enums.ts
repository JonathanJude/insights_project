// Political System Enums
export enum PoliticalLevels {
  FEDERAL = 'federal',
  STATE = 'state',
  LOCAL = 'local'
}

export enum PositionCategories {
  EXECUTIVE = 'executive',
  LEGISLATIVE = 'legislative',
  JUDICIAL = 'judicial',
  PARTY = 'party',
  ASPIRANT = 'aspirant'
}

export enum VerificationStatus {
  VERIFIED = 'verified',
  UNVERIFIED = 'unverified',
  PENDING = 'pending',
  REJECTED = 'rejected'
}

export enum PartyStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  DEREGISTERED = 'deregistered'
}

export enum ElectionTypes {
  PRESIDENTIAL = 'presidential',
  GUBERNATORIAL = 'gubernatorial',
  SENATORIAL = 'senatorial',
  HOUSE_OF_REPS = 'house_of_representatives',
  STATE_ASSEMBLY = 'state_assembly',
  LOCAL_GOVERNMENT = 'local_government'
}

export enum CampaignPhases {
  PRE_CAMPAIGN = 'pre-campaign',
  CAMPAIGN_LAUNCH = 'campaign_launch',
  ACTIVE_CAMPAIGN = 'active_campaign',
  FINAL_PUSH = 'final_push',
  ELECTION_DAY = 'election_day',
  POST_ELECTION = 'post_election'
}

// Validation functions for political enums
export const PoliticalEnumValidators = {
  isValidPoliticalLevel: (value: string): value is PoliticalLevels => {
    return Object.values(PoliticalLevels).includes(value as PoliticalLevels);
  },

  isValidPositionCategory: (value: string): value is PositionCategories => {
    return Object.values(PositionCategories).includes(value as PositionCategories);
  },

  isValidVerificationStatus: (value: string): value is VerificationStatus => {
    return Object.values(VerificationStatus).includes(value as VerificationStatus);
  },

  isValidPartyStatus: (value: string): value is PartyStatus => {
    return Object.values(PartyStatus).includes(value as PartyStatus);
  },

  isValidElectionType: (value: string): value is ElectionTypes => {
    return Object.values(ElectionTypes).includes(value as ElectionTypes);
  },

  isValidCampaignPhase: (value: string): value is CampaignPhases => {
    return Object.values(CampaignPhases).includes(value as CampaignPhases);
  }
};

// Helper functions for getting political enum options
export const PoliticalEnumHelpers = {
  getPoliticalLevelOptions: () => Object.values(PoliticalLevels).map(level => ({ 
    value: level, 
    label: level.charAt(0).toUpperCase() + level.slice(1)
  })),
  
  getPositionCategoryOptions: () => Object.values(PositionCategories).map(category => ({ 
    value: category, 
    label: category.charAt(0).toUpperCase() + category.slice(1)
  })),
  
  getVerificationStatusOptions: () => Object.values(VerificationStatus).map(status => ({ 
    value: status, 
    label: status.charAt(0).toUpperCase() + status.slice(1)
  })),
  
  getPartyStatusOptions: () => Object.values(PartyStatus).map(status => ({ 
    value: status, 
    label: status.charAt(0).toUpperCase() + status.slice(1)
  })),
  
  getElectionTypeOptions: () => Object.values(ElectionTypes).map(type => ({ 
    value: type, 
    label: type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  })),
  
  getCampaignPhaseOptions: () => Object.values(CampaignPhases).map(phase => ({ 
    value: phase, 
    label: phase.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  }))
};