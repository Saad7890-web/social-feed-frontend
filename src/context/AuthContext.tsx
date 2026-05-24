import type { ReactNode } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  getCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
} from "../lib/auth";
import { ensureCsrfToken } from "../lib/csrf";
import { getApiErrorMessage } from "../lib/errors";
import type { LoginPayload, RegisterPayload, User } from "../types/auth";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

type AuthContextValue = {
  user: User | null;
  status: AuthStatus;
  isAuthenticated: boolean;
  sessionError: string | null;
  signIn: (input: LoginPayload) => Promise<void>;
  signUp: (input: RegisterPayload) => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  clearSessionError: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [sessionError, setSessionError] = useState<string | null>(null);

  const loadSession = useCallback(async () => {
    setStatus("loading");
    setSessionError(null);

    try {
      await ensureCsrfToken();
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      setStatus("authenticated");
    } catch (error) {
      setUser(null);
      setStatus("unauthenticated");
      setSessionError(null);

      // Keep this silent in the UI unless we later need a session recovery banner.
      void error;
    }
  }, []);

  useEffect(() => {
    void loadSession();
  }, [loadSession]);

  const signIn = useCallback(async (input: LoginPayload) => {
    setSessionError(null);

    try {
      const currentUser = await loginUser(input);
      setUser(currentUser);
      setStatus("authenticated");
    } catch (error) {
      setUser(null);
      setStatus("unauthenticated");
      setSessionError(getApiErrorMessage(error, "Unable to sign in."));
      throw error;
    }
  }, []);

  const signUp = useCallback(async (input: RegisterPayload) => {
    setSessionError(null);

    try {
      const currentUser = await registerUser(input);
      setUser(currentUser);
      setStatus("authenticated");
    } catch (error) {
      setUser(null);
      setStatus("unauthenticated");
      setSessionError(
        getApiErrorMessage(error, "Unable to create your account."),
      );
      throw error;
    }
  }, []);

  const signOut = useCallback(async () => {
    setSessionError(null);

    try {
      await logoutUser();
    } finally {
      setUser(null);
      setStatus("unauthenticated");
    }
  }, []);

  const refreshSession = useCallback(async () => {
    await loadSession();
  }, [loadSession]);

  const clearSessionError = useCallback(() => {
    setSessionError(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      status,
      isAuthenticated: status === "authenticated" && Boolean(user),
      sessionError,
      signIn,
      signUp,
      signOut,
      refreshSession,
      clearSessionError,
    }),
    [
      user,
      status,
      sessionError,
      signIn,
      signUp,
      signOut,
      refreshSession,
      clearSessionError,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
