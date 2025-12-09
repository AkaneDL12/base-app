import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { authService } from "../services";
import { userService } from "../services/user.service";
import { router, usePathname } from "expo-router";

export interface User {
  id: string;
  name: string;
  email: string;
  isOnline?: boolean;

  bio?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: "male" | "female" | "other" | "prefer-not-to-say";
  occupation?: string;
  company?: string;
  website?: string;
  interests?: string[];

  avatar?: string;
  coverPhoto?: string;

  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
  };

  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  updateUser: (userData: Partial<User>) => void;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
  checkSession: () => Promise<boolean>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!initialized) {
      initializeUser();
    }
  }, [initialized]);

  const initializeUser = async () => {
    try {
      setInitialized(true);
      await checkSession();
    } catch (err) {
      console.error("Error initializing user:", err);
      setError("Error al cargar información del usuario");
    } finally {
      setLoading(false);
    }
  };
  
  const checkSession = useCallback(async (): Promise<boolean> => {
    try {
      setError(null);

      // Obtener token real
      const token = await authService.getToken();
      if (!token) {
        setUser(null);
        return false;
      }

      // 🔥 Obtener perfil completo desde backend
      const profile = await userService.getProfile();

      if (!profile) {
        setUser(null);
        return false;
      }

      setUser(profile);
      return true;
    } catch (err) {
      console.error("Error checking session:", err);
      setError("Error al verificar sesión");
      setUser(null);
      return false;
    }
  }, []);

  /**
   * Actualizar parcialmente los datos del usuario en la app
   */
  const updateUser = useCallback((userData: Partial<User>) => {
    setUser((currentUser) => {
      if (currentUser) {
        return { ...currentUser, ...userData };
      }
      return currentUser;
    });
  }, []);

  /**
   * Forzar recargar perfil desde backend
   */
  const refreshUser = useCallback(async () => {
    setLoading(true);
    try {
      await checkSession();
    } catch (err) {
      console.error("Error refreshing user:", err);
      setError("Error al actualizar información del usuario");
    } finally {
      setLoading(false);
    }
  }, [checkSession]);

  /**
   * Logout completo
   */
  const logout = useCallback(async () => {
    try {
      setLoading(true);
      await authService.logout();
      setUser(null);
      setError(null);
      router.replace("/");
    } catch (err) {
      console.error("Error during logout:", err);
      setError("Error al cerrar sesión");
      setUser(null);
      router.replace("/");
    } finally {
      setLoading(false);
    }
  }, []);

  const value: UserContextType = {
    user,
    loading,
    error,
    updateUser,
    refreshUser,
    logout,
    checkSession,
  };

  return (
    <UserContext.Provider value={value}>{children}</UserContext.Provider>
  );
}

export function useUser(): UserContextType {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}

/**
 * Protección de rutas
 */
export function useAuthGuard() {
  const { user, loading } = useUser();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user && pathname !== "/" && pathname !== "/register") {
      router.replace("/");
    }
  }, [user, loading, pathname]);

  return { user, loading, isAuthenticated: !!user };
}