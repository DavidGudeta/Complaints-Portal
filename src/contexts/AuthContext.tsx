import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          // Fetch additional user data from our public.users table using uid
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*, tax_centers(name)')
            .eq('uid', session.user.id)
            .single();

          if (userData) {
            setUser({
              id: userData.id.toString(),
              uid: session.user.id,
              email: session.user.email || '',
              name: userData.name,
              username: userData.username,
              role: userData.role as UserRole,
              tax_center_id: userData.tax_center_id?.toString(),
              tax_center_name: userData.tax_centers?.name,
              createdAt: userData.created_at || new Date().toISOString()
            });
          } else {
            // Try lookup by email if uid lookup failed (for legacy users)
            const { data: legacyData } = await supabase
              .from('users')
              .select('*, tax_centers(name)')
              .eq('email', session.user.email)
              .single();

            if (legacyData) {
              // Update the user with the uid for future lookups
              await supabase
                .from('users')
                .update({ uid: session.user.id })
                .eq('id', legacyData.id);

              setUser({
                id: legacyData.id.toString(),
                uid: session.user.id,
                email: session.user.email || '',
                name: legacyData.name,
                username: legacyData.username,
                role: legacyData.role as UserRole,
                tax_center_id: legacyData.tax_center_id?.toString(),
                tax_center_name: legacyData.tax_centers?.name,
                createdAt: legacyData.created_at || new Date().toISOString()
              });
            } else {
              // Fallback if user is in auth but not in public.users
              setUser({
                uid: session.user.id,
                email: session.user.email || '',
                role: UserRole.OFFICER, // Default role
                createdAt: new Date().toISOString()
              });
            }
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error checking auth session:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkUser();

    // Listen for changes on auth state (logged in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const { data: userData } = await supabase
          .from('users')
          .select('*, tax_centers(name)')
          .eq('uid', session.user.id)
          .single();

        if (userData) {
          setUser({
            id: userData.id.toString(),
            uid: session.user.id,
            email: session.user.email || '',
            name: userData.name,
            username: userData.username,
            role: userData.role as UserRole,
            tax_center_id: userData.tax_center_id?.toString(),
            tax_center_name: userData.tax_centers?.name,
            createdAt: userData.created_at || new Date().toISOString()
          });
        } else {
          // Try lookup by email for legacy users
          const { data: legacyData } = await supabase
            .from('users')
            .select('*, tax_centers(name)')
            .eq('email', session.user.email)
            .single();

          if (legacyData) {
            setUser({
              id: legacyData.id.toString(),
              uid: session.user.id,
              email: session.user.email || '',
              name: legacyData.name,
              username: legacyData.username,
              role: legacyData.role as UserRole,
              tax_center_id: legacyData.tax_center_id?.toString(),
              tax_center_name: legacyData.tax_centers?.name,
              createdAt: legacyData.created_at || new Date().toISOString()
            });
          }
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (identifier: string, password: string) => {
    let email = identifier;

    // If identifier doesn't look like an email, assume it's a username and look up the email
    if (!identifier.includes('@')) {
      const { data: userData, error: lookupError } = await supabase
        .from('users')
        .select('email')
        .eq('username', identifier)
        .single();

      if (lookupError || !userData) {
        throw new Error('User not found with that username');
      }
      email = userData.email;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Supabase Auth Error:', error.message, 'for email:', email);
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error('Login failed: No user returned');
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
