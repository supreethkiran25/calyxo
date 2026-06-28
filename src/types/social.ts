export interface PrivacySettings {
  isPrivate: boolean;
  allowFollowers: boolean;
  showWorkouts: 'public' | 'followers' | 'private';
  showNutrition: 'public' | 'followers' | 'private';
}

export interface FollowRelation {
  id?: string;
  followerId: string;
  followingId: string;
  status: 'pending' | 'accepted';
  timestamp: number;
}

export interface BlockRelation {
  id?: string;
  blockerId: string;
  blockedId: string;
  timestamp: number;
}

export interface SocialUserProfile {
  uid: string;
  email: string;
  firstName?: string;
  lastName?: string;
  nickname?: string;
  photoURL?: string;
  onboarded?: boolean;
  subscriptionPlan?: 'FREE' | 'PRO_LITE' | 'PRO' | 'PRO_PLUS';
  username?: string;
  username_lowercase?: string;
  privacy?: PrivacySettings;
}
