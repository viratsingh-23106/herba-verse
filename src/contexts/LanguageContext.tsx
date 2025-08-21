import React, { createContext, useContext, useEffect, useState } from 'react';
import i18n from '../i18n/config';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface LanguageContextType {
  language: string;
  changeLanguage: (lang: string) => Promise<void>;
  t: (key: string, options?: any) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState(i18n.language);
  const { user } = useAuth();

  useEffect(() => {
    // Load user's preferred language from profile if logged in
    if (user) {
      loadUserLanguage();
    }
  }, [user]);

  const loadUserLanguage = async () => {
    if (!user) return;
    
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('preferred_language')
        .eq('id', user.id)
        .single();
      
      if (profile?.preferred_language) {
        await changeLanguage(profile.preferred_language);
      }
    } catch (error) {
      console.error('Error loading user language preference:', error);
    }
  };

  const changeLanguage = async (lang: string) => {
    await i18n.changeLanguage(lang);
    setLanguage(lang);
    
    // Save to user profile if logged in
    if (user) {
      try {
        await supabase
          .from('profiles')
          .update({ preferred_language: lang })
          .eq('id', user.id);
      } catch (error) {
        console.error('Error saving language preference:', error);
      }
    } else {
      // Save to localStorage for non-logged in users
      localStorage.setItem('preferredLanguage', lang);
    }
  };

  const value = {
    language,
    changeLanguage,
    t: i18n.t,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};