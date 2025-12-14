import React, { createContext, useContext, useEffect, useState } from 'react';
import { HashRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { User, AuthState, UserRole } from './types';
import { getSession, logout as apiLogout } from './services/api';
import { Dumbbell, LayoutDashboard, LogOut, User as UserIcon, Home, Menu, X } from 'lucide-react';

// Pages
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import TrainerDashboard from './pages/TrainerDashboard';
import PlanDetails from './pages/PlanDetails';
import UserFeed from './pages/UserFeed';
import TrainerProfile from './pages/TrainerProfile';

// Auth Context
interface AuthContextType extends AuthState {
  setUser: (user: User | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  setUser: () => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const sessionUser = getSession();
    setUser(sessionUser);
    setIsLoading(false);
  }, []);

  const handleLogout = async () => {
    await apiLogout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      isLoading, 
      setUser, 
      logout: handleLogout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }: { children?: React.ReactNode, allowedRoles?: UserRole[] }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-darker text-primary">Loading...</div>;
  if (!user) return <Navigate to="/auth" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// Navigation Component
const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  return (
    <nav className="bg-card border-b border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 text-primary hover:text-green-400 transition">
              <Dumbbell className="h-8 w-8" />
              <span className="font-bold text-xl tracking-tight text-white">FitPlanHub</span>
            </Link>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link to="/" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Explore</Link>
              
              {user?.role === UserRole.USER && (
                <Link to="/feed" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">My Feed</Link>
              )}
              
              {user?.role === UserRole.TRAINER && (
                <Link to="/dashboard" className="bg-primary/10 text-primary hover:bg-primary/20 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2">
                  <LayoutDashboard className="w-4 h-4" /> Dashboard
                </Link>
              )}

              {user ? (
                <div className="flex items-center gap-4 ml-4">
                  <span className="text-sm text-gray-400">Hi, {user.name}</span>
                  <button onClick={logout} className="text-gray-400 hover:text-red-400 transition p-2">
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <Link to="/auth" className="bg-primary text-white hover:bg-green-600 px-4 py-2 rounded-md text-sm font-bold transition">
                  Login / Sign Up
                </Link>
              )}
            </div>
          </div>
          
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden bg-card border-b border-gray-700">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
             <Link to="/" className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium">Explore</Link>
             {user?.role === UserRole.USER && (
                <Link to="/feed" className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium">My Feed</Link>
              )}
              {user?.role === UserRole.TRAINER && (
                <Link to="/dashboard" className="text-primary hover:text-white block px-3 py-2 rounded-md text-base font-medium">Dashboard</Link>
              )}
              {!user && (
                 <Link to="/auth" className="text-primary hover:text-white block px-3 py-2 rounded-md text-base font-medium">Login</Link>
              )}
              {user && (
                <button onClick={logout} className="text-red-400 hover:text-white block w-full text-left px-3 py-2 rounded-md text-base font-medium">
                  Logout
                </button>
              )}
          </div>
        </div>
      )}
    </nav>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <div className="min-h-screen bg-darker text-gray-100 font-sans">
          <Navbar />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/plan/:planId" element={<PlanDetails />} />
              <Route path="/trainer/:trainerId" element={<TrainerProfile />} />
              
              <Route path="/dashboard" element={
                <ProtectedRoute allowedRoles={[UserRole.TRAINER]}>
                  <TrainerDashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/feed" element={
                <ProtectedRoute allowedRoles={[UserRole.USER]}>
                  <UserFeed />
                </ProtectedRoute>
              } />
            </Routes>
          </main>
        </div>
      </HashRouter>
    </AuthProvider>
  );
};

export default App;