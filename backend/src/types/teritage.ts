export type ActivityType =
  | "PLAN_CREATED"
  | "PLAN_UPDATED"
  | "CHECK_IN"
  | "CLAIM_TRIGGERED";

export interface UserProfile {
  name: string;
  email: string;
  phone?: string;
  notes?: string;
}

export interface InheritorProfile {
  address: string;
  sharePercentage: number;
  name?: string;
  email?: string;
  phone?: string;
  notes?: string;
  secretQuestion?: string;
  secretAnswerHash?: string;
  shareSecretQuestion?: boolean;
}

export interface TeritageActivity {
  id: string;
  type: ActivityType;
  timestamp: string;
  description: string;
  metadata?: Record<string, unknown>;
}

export interface TeritageCheckIn {
  id: string;
  timestamp: string;
  secondsSinceLast: number;
  timelinessPercent: number;
  triggeredBy?: string;
  note?: string;
}

export type TeritageTokenType = "ERC20" | "HTS" | "HBAR";

export interface TeritageTokenConfig {
  address: string;
  type: TeritageTokenType;
}

export interface TeritagePlanRecord {
  ownerAddress: string;
  user: UserProfile;
  inheritors: InheritorProfile[];
  tokens: TeritageTokenConfig[];
  checkInIntervalSeconds: number;
  lastCheckInAt: string;
  createdAt: string;
  updatedAt: string;
  activities: TeritageActivity[];
  checkIns: TeritageCheckIn[];
  isClaimInitiated: boolean;
  socialLinks: string[];
  notifyBeneficiary: boolean;
}

export interface TeritageDatabaseSchema {
  teritages: TeritagePlanRecord[];
}
