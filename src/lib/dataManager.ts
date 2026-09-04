import {
  CoupleUser,
  DailyStatus,
  SharedTask,
  CalendarEvent,
  BucketListItem,
  EventType,
} from './types';

const STORAGE_KEY = 'relos_couple_data';

interface StorageData {
  couples: Record<string, { users: CoupleUser[] }>;
  dailyStatus: DailyStatus[];
  sharedTasks: SharedTask[];
  calendarEvents: CalendarEvent[];
  bucketList: BucketListItem[];
}

const defaultData: StorageData = {
  couples: {},
  dailyStatus: [],
  sharedTasks: [],
  calendarEvents: [],
  bucketList: [],
};

// Initialize demo data
export const initializeDemoData = (coupleId: string) => {
  const existingData = loadData();
  
  if (!existingData.couples[coupleId]) {
    const userId1 = 'user_1_' + Date.now();
    const userId2 = 'user_2_' + Date.now();
    
    existingData.couples[coupleId] = {
      users: [
        {
          id: userId1,
          coupleId,
          name: 'Partner A',
          email: 'partnera@example.com',
          partnerId: userId2,
        },
        {
          id: userId2,
          coupleId,
          name: 'Partner B',
          email: 'partnerb@example.com',
          partnerId: userId1,
        },
      ],
    };

    const today = new Date().toISOString().split('T')[0];

    existingData.dailyStatus = [
      {
        id: 'status_1',
        coupleId,
        userId: userId1,
        date: today,
        energyLevel: 7,
        mood: '😊',
        notes: 'Guter Tag, aber müde',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'status_2',
        coupleId,
        userId: userId2,
        date: today,
        energyLevel: 6,
        mood: '😌',
        notes: 'Gedankenvoll',
        createdAt: new Date().toISOString(),
      },
    ];

    existingData.sharedTasks = [
      {
        id: 'task_1',
        coupleId,
        title: 'Groceries einkaufen',
        category: 'household',
        assignedTo: 'partner_a',
        completed: false,
        createdAt: new Date().toISOString(),
        mentalLoadTags: ['execution'],
      },
      {
        id: 'task_2',
        coupleId,
        title: 'Miete bezahlen',
        category: 'admin',
        assignedTo: 'partner_b',
        completed: false,
        createdAt: new Date().toISOString(),
        mentalLoadTags: ['planning', 'decision-making'],
      },
      {
        id: 'task_3',
        coupleId,
        title: 'Wochenendplan erstellen',
        category: 'planning',
        assignedTo: 'both',
        completed: false,
        createdAt: new Date().toISOString(),
        mentalLoadTags: ['planning'],
      },
    ];

    existingData.calendarEvents = [
      {
        id: 'event_1',
        coupleId,
        createdBy: userId1,
        title: 'Date Night - Pizza & Film',
        type: EventType.PaarZeit,
        startDate: new Date(Date.now() + 86400000 * 3).toISOString(),
        description: 'Gemütlicher Abend zu Hause',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'event_2',
        coupleId,
        createdBy: userId1,
        title: 'Yoga-Kurs',
        type: EventType.MeTime,
        startDate: new Date(Date.now() + 86400000 * 2).toISOString(),
        description: 'Persönliche Wellness-Zeit',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'event_3',
        coupleId,
        createdBy: userId2,
        title: 'Arbeit',
        type: EventType.Verpflichtung,
        startDate: new Date(Date.now() + 86400000).toISOString(),
        endDate: new Date(Date.now() + 86400000 + 28800000).toISOString(),
        createdAt: new Date().toISOString(),
      },
    ];

    existingData.bucketList = [
      {
        id: 'bucket_1',
        coupleId,
        title: 'Bali-Reise',
        category: 'vacation',
        description: 'Traumurlaub für 2 Wochen im Oktober',
        completed: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'bucket_2',
        coupleId,
        title: 'Gemeinsamen Kurs belegen',
        category: 'goal',
        completed: false,
        createdAt: new Date().toISOString(),
      },
    ];

    saveData(existingData);
  }

  return existingData;
};

export const loadData = (): StorageData => {
  if (typeof window === 'undefined') return defaultData;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : { ...defaultData };
  } catch {
    return { ...defaultData };
  }
};

export const saveData = (data: StorageData) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save data:', error);
  }
};

// Daily Status operations
export const getDailyStatus = (coupleId: string, date: string): DailyStatus[] => {
  const data = loadData();
  return data.dailyStatus.filter(
    (s) => s.coupleId === coupleId && s.date === date
  );
};

export const updateDailyStatus = (coupleId: string, userId: string, energyLevel: number) => {
  const data = loadData();
  const today = new Date().toISOString().split('T')[0];
  const existing = data.dailyStatus.find(
    (s) => s.coupleId === coupleId && s.userId === userId && s.date === today
  );

  if (existing) {
    existing.energyLevel = energyLevel;
  } else {
    data.dailyStatus.push({
      id: 'status_' + Date.now(),
      coupleId,
      userId,
      date: today,
      energyLevel,
      mood: '😊',
      createdAt: new Date().toISOString(),
    });
  }

  saveData(data);
};

// Shared Tasks operations
export const getSharedTasks = (coupleId: string): SharedTask[] => {
  const data = loadData();
  return data.sharedTasks.filter((t) => t.coupleId === coupleId);
};

export const addSharedTask = (
  coupleId: string,
  task: Omit<SharedTask, 'id' | 'createdAt' | 'coupleId'>
) => {
  const data = loadData();
  data.sharedTasks.push({
    ...task,
    coupleId,
    id: 'task_' + Date.now(),
    createdAt: new Date().toISOString(),
  });
  saveData(data);
};

export const updateSharedTask = (taskId: string, updates: Partial<SharedTask>) => {
  const data = loadData();
  const task = data.sharedTasks.find((t) => t.id === taskId);
  if (task) {
    Object.assign(task, updates);
    saveData(data);
  }
};

// Calendar Events operations
export const getCalendarEvents = (coupleId: string): CalendarEvent[] => {
  const data = loadData();
  return data.calendarEvents.filter((e) => e.coupleId === coupleId);
};

export const addCalendarEvent = (
  coupleId: string,
  event: Omit<CalendarEvent, 'id' | 'createdAt' | 'coupleId'>
) => {
  const data = loadData();
  data.calendarEvents.push({
    ...event,
    coupleId,
    id: 'event_' + Date.now(),
    createdAt: new Date().toISOString(),
  });
  saveData(data);
};

// Bucket List operations
export const getBucketList = (coupleId: string): BucketListItem[] => {
  const data = loadData();
  return data.bucketList.filter((b) => b.coupleId === coupleId);
};

export const addBucketListItem = (
  coupleId: string,
  item: Omit<BucketListItem, 'id' | 'createdAt' | 'coupleId'>
) => {
  const data = loadData();
  data.bucketList.push({
    ...item,
    coupleId,
    id: 'bucket_' + Date.now(),
    createdAt: new Date().toISOString(),
  });
  saveData(data);
};

export const updateBucketListItem = (itemId: string, updates: Partial<BucketListItem>) => {
  const data = loadData();
  const item = data.bucketList.find((b) => b.id === itemId);
  if (item) {
    Object.assign(item, updates);
    if (updates.completed && !item.completedAt) {
      item.completedAt = new Date().toISOString();
    }
    saveData(data);
  }
};

// Couple users operations
export const getCoupleUsers = (coupleId: string): CoupleUser[] => {
  const data = loadData();
  return data.couples[coupleId]?.users || [];
};
