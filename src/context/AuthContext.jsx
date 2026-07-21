import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userMode, setUserMode] = useState(() => {
    return localStorage.getItem('userMode') || 'buyer';
  });
  const [toast, setToast] = useState({ show: false, message: '' });

  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => {
      setToast({ show: false, message: '' });
    }, 3000);
  };

  const switchMode = (mode) => {
    setUserMode(mode);
    localStorage.setItem('userMode', mode);
    showToast(`You are now in ${mode} mode`);
  };

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (error) {
        console.error('Error fetching profile:', error.message);
        return null;
      }
      return data;
    } catch (err) {
      console.error('Error in fetchProfile:', err);
      return null;
    }
  };

  // Check if user has completed profile setup (name + city required)
  const isProfileComplete = (prof) => {
    return prof && prof.name && prof.name.trim() !== '' && prof.city && prof.city.trim() !== '';
  };

  // Seed Google profile picture into profiles table if not already set
  const seedGoogleProfile = async (authUser) => {
    const meta = authUser.user_metadata || {};
    const googleName  = meta.full_name || meta.name || '';
    const googleAvatar = meta.avatar_url || meta.picture || '';
    if (!googleName && !googleAvatar) return;

    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('name, avatar_url, profile_complete')
      .eq('id', authUser.id)
      .single();

    // Only update fields that are not already filled
    const updates = {};
    if (googleName  && !existingProfile?.name)       updates.name       = googleName;
    if (googleAvatar && !existingProfile?.avatar_url) updates.avatar_url = googleAvatar;

    // If we have both name & avatar from Google, mark profile complete
    const willHaveName = updates.name || existingProfile?.name;
    // Google users still need to pick a city — don't auto-complete profile
    // But do save the name + avatar
    if (Object.keys(updates).length > 0) {
      await supabase.from('profiles').update(updates).eq('id', authUser.id);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        setUser(session.user);

        // Seed Google data if this is a Google user
        const provider = session.user.app_metadata?.provider;
        if (provider === 'google') {
          await seedGoogleProfile(session.user);
        }

        let prof = await fetchProfile(session.user.id);
        const localProfStr = localStorage.getItem('seller_profile');
        if (localProfStr) {
          try {
            const localProf = JSON.parse(localProfStr);
            prof = { ...(prof || {}), ...localProf };
          } catch(e) {}
        }
        setProfile(prof);
        if (prof) localStorage.setItem('userRole', prof.role);

        // Stay-signed-in logic
        const staySignedIn = localStorage.getItem('staySignedIn');
        if (staySignedIn === 'false') {
          const sessionAlive = sessionStorage.getItem('sessionAlive');
          if (!sessionAlive) {
            await supabase.auth.signOut();
            setUser(null);
            setProfile(null);
            localStorage.removeItem('userRole');
            localStorage.removeItem('staySignedIn');
            setLoading(false);
            return;
          }
        }
      } else {
        setUser(null);
        setProfile(null);
        localStorage.removeItem('userRole');
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setLoading(true);
      if (session) {
        setUser(session.user);

        const provider = session.user.app_metadata?.provider;
        if (provider === 'google') {
          await seedGoogleProfile(session.user);
        }

        const prof = await fetchProfile(session.user.id);
        setProfile(prof);
        if (prof) localStorage.setItem('userRole', prof.role);
      } else {
        setUser(null);
        setProfile(null);
        localStorage.removeItem('userRole');
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email, password, staySignedIn = true) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    localStorage.setItem('staySignedIn', String(staySignedIn));
    sessionStorage.setItem('sessionAlive', 'true');
    return data;
  };

  const loginWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    if (error) throw error;
    return data;
  };

  const signup = async (email, password, role) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin + '/login',
        data: { role: role || 'customer' },
      },
    });
    if (error) throw error;
    return data;
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
    setProfile(null);
    localStorage.removeItem('userRole');
    localStorage.removeItem('staySignedIn');
    sessionStorage.removeItem('sessionAlive');
  };

  const updateProfile = async (updates) => {
    // Local fallback update for smooth client experience
    setProfile(prev => {
      const updated = { ...(prev || {}), ...updates };
      localStorage.setItem('seller_profile', JSON.stringify(updated));
      return updated;
    });

    if (!user) return updates;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();
      if (!error && data) {
        setProfile(data);
        return data;
      }
    } catch (err) {
      console.warn('Supabase profile update fallback used:', err.message);
    }
    return updates;
  };

  const uploadAvatar = async (file) => {
    if (!user) throw new Error('Not authenticated');
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}.${fileExt}`;
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, { upsert: true });
    if (uploadError) throw uploadError;
    const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
    return data.publicUrl;
  };

  return (
    <AuthContext.Provider value={{
      user, profile, loading,
      login, loginWithGoogle, signup, logout,
      fetchProfile, updateProfile, uploadAvatar, isProfileComplete,
      userMode, switchMode, toast, showToast
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
