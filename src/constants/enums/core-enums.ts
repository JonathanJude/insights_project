// Temporal Enums
export enum Months {
  JANUARY = 'January',
  FEBRUARY = 'February',
  MARCH = 'March',
  APRIL = 'April',
  MAY = 'May',
  JUNE = 'June',
  JULY = 'July',
  AUGUST = 'August',
  SEPTEMBER = 'September',
  OCTOBER = 'October',
  NOVEMBER = 'November',
  DECEMBER = 'December'
}

export enum DaysOfWeek {
  SUNDAY = 'Sunday',
  MONDAY = 'Monday',
  TUESDAY = 'Tuesday',
  WEDNESDAY = 'Wednesday',
  THURSDAY = 'Thursday',
  FRIDAY = 'Friday',
  SATURDAY = 'Saturday'
}

export enum TimeZones {
  WAT = 'West Africa Time',
  GMT = 'Greenwich Mean Time',
  UTC = 'Coordinated Universal Time'
}

export enum ElectoralPhases {
  PRE_ELECTION = 'Pre-Election',
  CAMPAIGN_PERIOD = 'Campaign Period',
  ELECTION_WEEK = 'Election Week',
  ELECTION_DAY = 'Election Day',
  POST_ELECTION = 'Post-Election',
  INTER_ELECTION = 'Inter-Election'
}

export enum Seasons {
  DRY = 'Dry',
  RAINY = 'Rainy'
}

// Geographic Enums
export enum NigerianRegions {
  NORTH_CENTRAL = 'North Central',
  NORTH_EAST = 'North East',
  NORTH_WEST = 'North West',
  SOUTH_EAST = 'South East',
  SOUTH_SOUTH = 'South South',
  SOUTH_WEST = 'South West'
}

export enum LocationTypes {
  URBAN = 'Urban',
  RURAL = 'Rural',
  SEMI_URBAN = 'Semi-Urban',
  UNDEFINED = 'Undefined'
}

// Gender and Demographics
export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  NON_BINARY = 'non-binary',
  OTHER = 'other'
}

export enum AgeGroups {
  YOUTH_18_25 = '18-25',
  YOUNG_ADULT_26_35 = '26-35',
  ADULT_36_45 = '36-45',
  MIDDLE_AGED_46_55 = '46-55',
  SENIOR_56_PLUS = '56+'
}

// Validation functions for core enums
export const CoreEnumValidators = {
  isValidMonth: (value: string): value is Months => {
    return Object.values(Months).includes(value as Months);
  },

  isValidDayOfWeek: (value: string): value is DaysOfWeek => {
    return Object.values(DaysOfWeek).includes(value as DaysOfWeek);
  },

  isValidTimeZone: (value: string): value is TimeZones => {
    return Object.values(TimeZones).includes(value as TimeZones);
  },

  isValidElectoralPhase: (value: string): value is ElectoralPhases => {
    return Object.values(ElectoralPhases).includes(value as ElectoralPhases);
  },

  isValidSeason: (value: string): value is Seasons => {
    return Object.values(Seasons).includes(value as Seasons);
  },

  isValidNigerianRegion: (value: string): value is NigerianRegions => {
    return Object.values(NigerianRegions).includes(value as NigerianRegions);
  },

  isValidLocationType: (value: string): value is LocationTypes => {
    return Object.values(LocationTypes).includes(value as LocationTypes);
  },

  isValidGender: (value: string): value is Gender => {
    return Object.values(Gender).includes(value as Gender);
  },

  isValidAgeGroup: (value: string): value is AgeGroups => {
    return Object.values(AgeGroups).includes(value as AgeGroups);
  }
};

// Helper functions for getting enum options
export const CoreEnumHelpers = {
  getMonthOptions: () => Object.values(Months).map(month => ({ value: month, label: month })),
  
  getDayOfWeekOptions: () => Object.values(DaysOfWeek).map(day => ({ value: day, label: day })),
  
  getTimeZoneOptions: () => Object.values(TimeZones).map(tz => ({ value: tz, label: tz })),
  
  getElectoralPhaseOptions: () => Object.values(ElectoralPhases).map(phase => ({ value: phase, label: phase })),
  
  getSeasonOptions: () => Object.values(Seasons).map(season => ({ value: season, label: season })),
  
  getNigerianRegionOptions: () => Object.values(NigerianRegions).map(region => ({ value: region, label: region })),
  
  getLocationTypeOptions: () => Object.values(LocationTypes).map(type => ({ value: type, label: type })),
  
  getGenderOptions: () => Object.values(Gender).map(gender => ({ 
    value: gender, 
    label: gender.charAt(0).toUpperCase() + gender.slice(1).replace('-', ' ')
  })),
  
  getAgeGroupOptions: () => Object.values(AgeGroups).map(group => ({ value: group, label: group }))
};