import { User, Plan, Subscription, Follow, UserRole } from '../types';

// Keys for localStorage
const KEYS = {
  USERS: 'fph_users',
  PLANS: 'fph_plans',
  SUBS: 'fph_subs',
  FOLLOWS: 'fph_follows',
  SESSION: 'fph_session'
};

// Helper to delay execution to simulate network latency
const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

// --- Auth Services ---

export const login = async (email: string, password: string): Promise<User> => {
  await delay();
  const users: User[] = JSON.parse(localStorage.getItem(KEYS.USERS) || '[]');
  const user = users.find(u => u.email === email && u.password === password);
  
  if (!user) throw new Error('Invalid credentials');
  
  const safeUser = { ...user };
  delete safeUser.password;
  localStorage.setItem(KEYS.SESSION, JSON.stringify(safeUser));
  return safeUser;
};

export const signup = async (name: string, email: string, password: string, role: UserRole): Promise<User> => {
  await delay();
  const users: User[] = JSON.parse(localStorage.getItem(KEYS.USERS) || '[]');
  
  if (users.find(u => u.email === email)) {
    throw new Error('User already exists');
  }

  const newUser: User = {
    id: crypto.randomUUID(),
    name,
    email,
    password, // Mock storage
    role
  };

  users.push(newUser);
  localStorage.setItem(KEYS.USERS, JSON.stringify(users));
  
  const safeUser = { ...newUser };
  delete safeUser.password;
  localStorage.setItem(KEYS.SESSION, JSON.stringify(safeUser));
  return safeUser;
};

export const logout = async () => {
  localStorage.removeItem(KEYS.SESSION);
};

export const getSession = (): User | null => {
  const session = localStorage.getItem(KEYS.SESSION);
  return session ? JSON.parse(session) : null;
};

// --- Plan Services ---

export const getPlans = async (): Promise<Plan[]> => {
  await delay(300);
  return JSON.parse(localStorage.getItem(KEYS.PLANS) || '[]');
};

export const getPlanById = async (id: string): Promise<Plan | null> => {
  await delay(200);
  const plans: Plan[] = JSON.parse(localStorage.getItem(KEYS.PLANS) || '[]');
  return plans.find(p => p.id === id) || null;
};

export const createPlan = async (planData: Omit<Plan, 'id' | 'createdAt' | 'trainerName'>, trainer: User): Promise<Plan> => {
  await delay();
  const plans: Plan[] = JSON.parse(localStorage.getItem(KEYS.PLANS) || '[]');
  
  const newPlan: Plan = {
    ...planData,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
    trainerName: trainer.name
  };

  plans.unshift(newPlan); // Add to top
  localStorage.setItem(KEYS.PLANS, JSON.stringify(plans));
  return newPlan;
};

export const deletePlan = async (planId: string) => {
  await delay();
  let plans: Plan[] = JSON.parse(localStorage.getItem(KEYS.PLANS) || '[]');
  plans = plans.filter(p => p.id !== planId);
  localStorage.setItem(KEYS.PLANS, JSON.stringify(plans));
};

// --- Subscription Services ---

export const subscribeToPlan = async (userId: string, planId: string): Promise<Subscription> => {
  await delay();
  const subs: Subscription[] = JSON.parse(localStorage.getItem(KEYS.SUBS) || '[]');
  
  // Check if already subbed
  if (subs.find(s => s.userId === userId && s.planId === planId)) {
    throw new Error('Already subscribed');
  }

  const newSub: Subscription = {
    id: crypto.randomUUID(),
    userId,
    planId,
    purchasedAt: Date.now()
  };

  subs.push(newSub);
  localStorage.setItem(KEYS.SUBS, JSON.stringify(subs));
  return newSub;
};

export const checkAccess = async (userId: string, planId: string): Promise<boolean> => {
  await delay(100);
  const subs: Subscription[] = JSON.parse(localStorage.getItem(KEYS.SUBS) || '[]');
  const plan = await getPlanById(planId);
  
  // Trainers always access their own plans
  if (plan && plan.trainerId === userId) return true;

  return !!subs.find(s => s.userId === userId && s.planId === planId);
};

export const getUserSubscriptions = async (userId: string): Promise<Plan[]> => {
  await delay(200);
  const subs: Subscription[] = JSON.parse(localStorage.getItem(KEYS.SUBS) || '[]');
  const plans: Plan[] = JSON.parse(localStorage.getItem(KEYS.PLANS) || '[]');
  
  const userSubIds = new Set(subs.filter(s => s.userId === userId).map(s => s.planId));
  return plans.filter(p => userSubIds.has(p.id));
};

// --- Follow Services ---

export const followTrainer = async (followerId: string, trainerId: string) => {
  await delay();
  const follows: Follow[] = JSON.parse(localStorage.getItem(KEYS.FOLLOWS) || '[]');
  if (follows.find(f => f.followerId === followerId && f.trainerId === trainerId)) return;
  
  const newFollow: Follow = { id: crypto.randomUUID(), followerId, trainerId };
  follows.push(newFollow);
  localStorage.setItem(KEYS.FOLLOWS, JSON.stringify(follows));
};

export const unfollowTrainer = async (followerId: string, trainerId: string) => {
  await delay();
  let follows: Follow[] = JSON.parse(localStorage.getItem(KEYS.FOLLOWS) || '[]');
  follows = follows.filter(f => !(f.followerId === followerId && f.trainerId === trainerId));
  localStorage.setItem(KEYS.FOLLOWS, JSON.stringify(follows));
};

export const isFollowing = async (followerId: string, trainerId: string): Promise<boolean> => {
  // fast check, no delay
  const follows: Follow[] = JSON.parse(localStorage.getItem(KEYS.FOLLOWS) || '[]');
  return !!follows.find(f => f.followerId === followerId && f.trainerId === trainerId);
};

export const getFollowedPlans = async (userId: string): Promise<Plan[]> => {
  await delay(300);
  const follows: Follow[] = JSON.parse(localStorage.getItem(KEYS.FOLLOWS) || '[]');
  const plans: Plan[] = JSON.parse(localStorage.getItem(KEYS.PLANS) || '[]');
  
  const followedTrainerIds = new Set(follows.filter(f => f.followerId === userId).map(f => f.trainerId));
  return plans.filter(p => followedTrainerIds.has(p.trainerId));
};

// --- Initialization ---
// Initialize some mock data if empty
(function initMockData() {
  if (!localStorage.getItem(KEYS.PLANS)) {
    const mockTrainerId = 'trainer-1';
    const mockPlans: Plan[] = [
      {
        id: 'plan-1',
        trainerId: mockTrainerId,
        trainerName: 'Sarah Fit',
        title: '30-Day HIIT Shred',
        description: 'A high-intensity interval training program designed to burn fat and build lean muscle. Includes daily 20-minute routines requiring no equipment.',
        price: 29.99,
        durationDays: 30,
        createdAt: Date.now()
      },
      {
        id: 'plan-2',
        trainerId: 'trainer-2',
        trainerName: 'Mike Iron',
        title: 'Powerlifting Basics',
        description: 'Master the big three: Squat, Bench, and Deadlift. This 8-week program focuses on progressive overload for beginners.',
        price: 49.99,
        durationDays: 60,
        createdAt: Date.now() - 10000000
      }
    ];
    localStorage.setItem(KEYS.PLANS, JSON.stringify(mockPlans));
    
    const mockUsers: User[] = [
      { id: mockTrainerId, name: 'Sarah Fit', email: 'sarah@fit.com', role: UserRole.TRAINER, password: 'password' },
      { id: 'user-1', name: 'John Doe', email: 'john@user.com', role: UserRole.USER, password: 'password' }
    ];
    localStorage.setItem(KEYS.USERS, JSON.stringify(mockUsers));
  }
})();