// Couple identification and auth
export interface CoupleUser {
  id: string;
  coupleId: string;
  name: string;
  email: string;
  partnerId: string;
}

export interface CoupleAuth {
  coupleId: string;
  user: CoupleUser;
  partner: CoupleUser | null;
}

// Mental Load & Mood
export interface DailyStatus {
  id: string;
  coupleId: string;
  userId: string;
  date: string; // YYYY-MM-DD
  energyLevel: number; // 1-10
  mood: string; // 1-5 scale or emoji
  notes?: string;
  createdAt: string;
}

export interface SharedTask {
  id: string;
  coupleId: string;
  title: string;
  category: 'household' | 'admin' | 'planning';
  assignedTo: 'partner_a' | 'partner_b' | 'both';
  completed: boolean;
  completedBy?: string;
  completedAt?: string;
  createdAt: string;
  dueDate?: string;
  mentalLoadTags: string[]; // e.g., 'planning', 'decision-making', 'execution'
}

// Calendar & Autonomy
export enum EventType {
  PaarZeit = 'paar_zeit',
  MeTime = 'me_time',
  Verpflichtung = 'verpflichtung',
}

export interface CalendarEvent {
  id: string;
  coupleId: string;
  createdBy: string;
  title: string;
  type: EventType;
  startDate: string; // ISO 8601
  endDate?: string;
  description?: string;
  createdAt: string;
}

// AI Communication & Connection
export interface TranslationRequest {
  coupleId: string;
  userId: string;
  originalMessage: string;
}

export interface TranslationResponse {
  originalMessage: string;
  translatedMessage: string;
  insights: string;
}

export interface DateIdea {
  title: string;
  description: string;
  estimatedCost: 'gratis' | 'budget' | 'luxus';
  estimatedDuration: string;
  steps: string[];
}

export interface BucketListItem {
  id: string;
  coupleId: string;
  title: string;
  category: 'vacation' | 'goal' | 'milestone';
  description?: string;
  completed: boolean;
  createdAt: string;
  completedAt?: string;
}

export interface DailyQuestion {
  id: string;
  question: string;
  category: 'memories' | 'future' | 'connection' | 'dreams';
  createdAt: string;
}

// Database schema for Supabase (for reference)
export const SCHEMA_DEFINITIONS = {
  couples: `
    CREATE TABLE couples (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      couple_id TEXT UNIQUE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `,
  couple_users: `
    CREATE TABLE couple_users (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      couple_id TEXT REFERENCES couples(couple_id),
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      partner_id UUID REFERENCES couple_users(id),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `,
  daily_status: `
    CREATE TABLE daily_status (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      couple_id TEXT REFERENCES couples(couple_id),
      user_id UUID REFERENCES couple_users(id),
      date DATE NOT NULL,
      energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 10),
      mood TEXT,
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `,
  shared_tasks: `
    CREATE TABLE shared_tasks (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      couple_id TEXT REFERENCES couples(couple_id),
      title TEXT NOT NULL,
      category TEXT,
      assigned_to TEXT,
      completed BOOLEAN DEFAULT FALSE,
      completed_by UUID REFERENCES couple_users(id),
      completed_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      due_date DATE
    );
  `,
  calendar_events: `
    CREATE TABLE calendar_events (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      couple_id TEXT REFERENCES couples(couple_id),
      created_by UUID REFERENCES couple_users(id),
      title TEXT NOT NULL,
      type TEXT NOT NULL,
      start_date TIMESTAMP NOT NULL,
      end_date TIMESTAMP,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `,
  bucket_list: `
    CREATE TABLE bucket_list (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      couple_id TEXT REFERENCES couples(couple_id),
      title TEXT NOT NULL,
      category TEXT,
      description TEXT,
      completed BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      completed_at TIMESTAMP
    );
  `,
};
