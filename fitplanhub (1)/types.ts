export enum UserRole {
  USER = 'user',
  TRAINER = 'trainer',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  password?: string; // In a real app, never store plain text
}

export interface Plan {
  id: string;
  trainerId: string;
  trainerName: string;
  title: string;
  description: string;
  price: number;
  durationDays: number;
  createdAt: number;
  tags?: string[];
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  purchasedAt: number;
}

export interface Follow {
  id: string;
  followerId: string;
  trainerId: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}