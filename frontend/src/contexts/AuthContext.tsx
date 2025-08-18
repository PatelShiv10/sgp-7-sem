
import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  firstName: string;
  lastName: string;
  email: string;
  role: 'user' | 'lawyer' | 'admin';
  id: string;
}

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    const token = localStorage.getItem('token');
    
    console.log('🔐 AuthContext: Checking localStorage...');
    console.log('🔐 AuthContext: storedUser:', storedUser);
    console.log('🔐 AuthContext: token:', token ? 'exists' : 'missing');
    
    if (storedUser && token) {
      try {
        const parsedUser = JSON.parse(storedUser);
        console.log('🔐 AuthContext: Parsed user data:', parsedUser);
        console.log('🔐 AuthContext: User has role field?', 'role' in parsedUser);
        console.log('🔐 AuthContext: User has userType field?', 'userType' in parsedUser);
        
        // Handle legacy userType field
        if (parsedUser.userType && !parsedUser.role) {
          console.log('🔐 AuthContext: Converting userType to role');
          parsedUser.role = parsedUser.userType;
          delete parsedUser.userType;
          localStorage.setItem('currentUser', JSON.stringify(parsedUser));
        }
        
        setUser(parsedUser);
      } catch (error) {
        console.error('🔐 AuthContext: Error parsing stored user:', error);
        localStorage.removeItem('currentUser');
        localStorage.removeItem('token');
      }
    } else {
      console.log('🔐 AuthContext: No stored user or token found');
    }
  }, []);

  const login = (userData: User) => {
    console.log('🔐 AuthContext: Logging in user:', userData);
    setUser(userData);
    localStorage.setItem('currentUser', JSON.stringify(userData));
  };

  const logout = () => {
    console.log('🔐 AuthContext: Logging out user');
    setUser(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    localStorage.removeItem('lawyerProfileImage');
    // Redirect to home page after logout
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
