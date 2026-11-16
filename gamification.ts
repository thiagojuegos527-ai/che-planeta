import { EcoAnalysisResult } from './chePlaneta';

export type EvolutionStage = 'seed' | 'sprout' | 'bloom' | 'guardian';

export type PetMood = 'happy' | 'excited' | 'sleepy' | 'proud' | 'curious' | 'hungry_eco';

export interface PetColorPalette {
  id: string;
  name: string;
  ocean: string;
  continent: string;
  atmosphere: string;
  unlockedAtLevel: number;
}

export interface Accessory {
  id: string;
  name: string;
  type: 'head' | 'face' | 'body' | 'hand' | 'ambient';
  icon: string;
  description: string;
  unlockedAtLevel: number;
  costEcoPoints: number;
}

export interface PlanetBiomeItem {
  id: string;
  name: string;
  type: 'flora' | 'fauna' | 'decor' | 'sky';
  icon: string;
  description: string;
  unlockedAtLevel: number;
  costEcoPoints: number;
}

export interface PetState {
  name: string;
  stage: EvolutionStage;
  level: number;
  xp: number;
  xpToNextLevel: number;
  happiness: number; // 0 - 100
  cleanliness: number; // 0 - 100
  colorPaletteId: string;
  equippedAccessories: {
    head?: string;
    face?: string;
    body?: string;
    hand?: string;
    ambient?: string;
  };
  placedBiomeItems: string[];
  unlockedAccessories: string[];
  unlockedPalettes: string[];
  unlockedBiomeItems: string[];
}

export interface EcoStreak {
  currentDays: number;
  longestDays: number;
  lastActiveDate: string; // YYYY-MM-DD
  isPaused: boolean;
  shieldsAvailable: number; // Can absorb 1 missed day without breaking streak!
  historyDates: string[]; // YYYY-MM-DD
}

export interface EcoMission {
  id: string;
  title: string;
  description: string;
  category: 'scan' | 'diy' | 'disposal' | 'learn' | 'community';
  frequency: 'daily' | 'weekly';
  xpReward: number;
  pointsReward: number;
  targetCount: number;
  currentCount: number;
  completed: boolean;
  rewardClaimed: boolean;
  icon: string;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  category: 'explorer' | 'recycler' | 'maker' | 'guardian';
}

export interface UserProfile {
  id: string;
  username: string;
  title: string; // e.g. "Guardián de Semillas", "Eco Alquimista", "Héroe del Reciclaje"
  avatarEmoji: string;
  avatarBgColor: string;
  ecoPoints: number;
  totalScans: number;
  completedMissionsCount: number;
  co2SavedKg: number;
  plasticDivertedItems: number;
  joinedDate: string;
}

export type MainNavTab = 'home' | 'scan' | 'my-planet' | 'missions' | 'profile';
