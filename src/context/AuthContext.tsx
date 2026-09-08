import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole, LanguageCode, FarmerProfile, OfficialProfile, BuyerProfile, Notification } from '../shared/types';
import { TRANSLATIONS, TranslationDictionary } from '../i18n/translations';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  farmerProfile: FarmerProfile | null;
  officialProfile: OfficialProfile | null;
  buyerProfile: BuyerProfile | null;
  language: LanguageCode;
  lowLiteracyMode: boolean;
  t: TranslationDictionary;
  notifications: Notification[];
  unreadCount: number;
  demoAccounts: any[];
  loading: boolean;
  login: (identifier: string) => Promise<void>;
  registerUser: (data: any) => Promise<void>;
  switchDemoUser: (userId: string) => Promise<void>;
  logout: () => void;
  changeLanguage: (lang: LanguageCode) => Promise<void>;
  toggleLowLiteracyMode: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [farmerProfile, setFarmerProfile] = useState<FarmerProfile | null>(null);
  const [officialProfile, setOfficialProfile] = useState<OfficialProfile | null>(null);
  const [buyerProfile, setBuyerProfile] = useState<BuyerProfile | null>(null);
  const [language, setLanguage] = useState<LanguageCode>('en');
  const [lowLiteracyMode, setLowLiteracyMode] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [demoAccounts, setDemoAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Load demo accounts and initial session
  useEffect(() => {
    async function init() {
      try {
        const demoRes = await api.getDemoAccounts();
        if (demoRes.accounts) {
          setDemoAccounts(demoRes.accounts);
        }

        const token = api.getToken();
        if (token) {
          try {
            const meRes = await api.getMe();
            if (meRes.user) {
              setUser(meRes.user);
              setFarmerProfile(meRes.farmerProfile || null);
              setOfficialProfile(meRes.officialProfile || null);
              setBuyerProfile(meRes.buyerProfile || null);
              setLanguage(meRes.user.preferredLanguage || 'en');
              setLowLiteracyMode(Boolean(meRes.user.lowLiteracyMode));
            } else {
              // Token invalid or user not found, reset token and load demo farmer
              api.setToken(null);
              await loadDefaultDemo();
            }
          } catch {
            // Token expired or invalid, switch to default demo farmer
            api.setToken(null);
            await loadDefaultDemo();
          }
        } else {
          // Default to first demo farmer for immediate exploration
          await loadDefaultDemo();
        }
      } catch (err) {
        console.error('Initialization error:', err);
      } finally {
        setLoading(false);
      }
    }

    init();
  }, []);

  // Poll notifications periodically when user is logged in
  useEffect(() => {
    if (!user) return;
    refreshNotifications();
    const interval = setInterval(refreshNotifications, 12000);
    return () => clearInterval(interval);
  }, [user?.id]);

  const loadDefaultDemo = async () => {
    try {
      const res = await api.switchDemo('user_farmer_1');
      setUser(res.user);
      setFarmerProfile(res.farmerProfile || null);
      setLanguage(res.user.preferredLanguage || 'te');
      setLowLiteracyMode(Boolean(res.user.lowLiteracyMode));
    } catch (e) {
      console.warn('Could not auto-login default demo:', e);
    }
  };

  const refreshNotifications = async () => {
    if (!user) return;
    try {
      const res = await api.getNotifications();
      setNotifications(res.notifications);
      setUnreadCount(res.unreadCount);
    } catch {
      // Ignore background notification fetch errors
    }
  };

  const refreshUser = async () => {
    try {
      const res = await api.getMe();
      if (res.user) {
        setUser(res.user);
        setFarmerProfile(res.farmerProfile || null);
        setOfficialProfile(res.officialProfile || null);
        setBuyerProfile(res.buyerProfile || null);
      }
    } catch (err) {
      console.error('Failed to refresh user:', err);
    }
  };

  const login = async (identifier: string) => {
    setLoading(true);
    try {
      const res = await api.login(identifier);
      setUser(res.user);
      setFarmerProfile(res.farmerProfile || null);
      setOfficialProfile(res.officialProfile || null);
      setBuyerProfile(res.buyerProfile || null);
      setLanguage(res.user.preferredLanguage || 'en');
      setLowLiteracyMode(Boolean(res.user.lowLiteracyMode));
      await refreshNotifications();
    } finally {
      setLoading(false);
    }
  };

  const registerUser = async (data: any) => {
    setLoading(true);
    try {
      const res = await api.register(data);
      setUser(res.user);
      setFarmerProfile(res.farmerProfile || null);
      setOfficialProfile(res.officialProfile || null);
      setBuyerProfile(res.buyerProfile || null);
      setLanguage(res.user.preferredLanguage || 'en');
      setLowLiteracyMode(Boolean(res.user.lowLiteracyMode));
      await refreshNotifications();
    } finally {
      setLoading(false);
    }
  };

  const switchDemoUser = async (userId: string) => {
    setLoading(true);
    try {
      const res = await api.switchDemo(userId);
      setUser(res.user);
      setFarmerProfile(res.farmerProfile || null);
      setOfficialProfile(res.officialProfile || null);
      setBuyerProfile(res.buyerProfile || null);
      setLanguage(res.user.preferredLanguage || 'en');
      setLowLiteracyMode(Boolean(res.user.lowLiteracyMode));
      await refreshNotifications();
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    api.setToken(null);
    setUser(null);
    setFarmerProfile(null);
    setOfficialProfile(null);
    setBuyerProfile(null);
    setNotifications([]);
    setUnreadCount(0);
  };

  const changeLanguage = async (newLang: LanguageCode) => {
    setLanguage(newLang);
    if (user) {
      try {
        const res = await api.updateSettings({ preferredLanguage: newLang });
        setUser(res.user);
      } catch (err) {
        console.error('Failed to save language setting:', err);
      }
    }
  };

  const toggleLowLiteracyMode = async () => {
    const nextMode = !lowLiteracyMode;
    setLowLiteracyMode(nextMode);
    if (user) {
      try {
        const res = await api.updateSettings({ lowLiteracyMode: nextMode });
        setUser(res.user);
      } catch (err) {
        console.error('Failed to save low literacy setting:', err);
      }
    }
  };

  const markNotificationRead = async (id: string) => {
    await api.markNotificationRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  const markAllNotificationsRead = async () => {
    await api.markAllNotificationsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const currentTranslation = TRANSLATIONS[language] || TRANSLATIONS['en'];

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        farmerProfile,
        officialProfile,
        buyerProfile,
        language,
        lowLiteracyMode,
        t: currentTranslation,
        notifications,
        unreadCount,
        demoAccounts,
        loading,
        login,
        registerUser,
        switchDemoUser,
        logout,
        changeLanguage,
        toggleLowLiteracyMode,
        refreshNotifications,
        markNotificationRead,
        markAllNotificationsRead,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
