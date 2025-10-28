// FIX: Added React import to resolve TypeScript error on React.ReactNode.
import React from 'react';

// import { User as FirebaseUser } from 'firebase/auth';

// Fix: Redefined the User interface to match the MOCK_USER object in App.tsx. This resolves a type error where the 'uid' property was not found. This change aligns the type with the mocked data used for UI development, as Firebase integration is currently disabled.
export interface User {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  providerId: string;
  accessToken: string;
  emailVerified: boolean;
  isAnonymous: boolean;
  metadata: object;
  providerData: any[];
  refreshToken: string;
  tenantId: string | null;
  delete: () => Promise<void>;
  getIdToken: () => Promise<string>;
  getIdTokenResult: () => Promise<any>;
  reload: () => Promise<void>;
  toJSON: () => object;
}

export interface Note {
  id: string;
  name: string;
  path: string[];
  content: string;
  tags: string[];
  date: string;
  title: string;
  summary?: string;
  link?: {
    url: string;
    title: string;
  };
}

export interface AIResponse {
  categories: string[];
  tags: string[];
  summary: string;
  title: string;
}

export interface FeedbackState {
  message: string | React.ReactNode;
  type: 'info' | 'success' | 'error';
}