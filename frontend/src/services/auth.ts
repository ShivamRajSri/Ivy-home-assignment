const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_KEY = import.meta.env.VITE_API_KEY;

const STORAGE_KEY = "ivy_auth_session";

interface ApiUser {
  name?: string;
  display_name?: string;
  email?: string;
  username?: string;
}

interface LoginResponse {
  access_token: string;
  refresh_token?: string;
  token_type?: string;
  expires_in?: number;
  refresh_url?: string;
  user?: ApiUser;
}

interface StoredSession {
  displayName: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
  refreshUrl?: string;
}

export interface AuthSession {
  displayName: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
}

export interface AuthService {
  signIn(username: string, password: string): Promise<AuthSession>;
  signOut(): Promise<void>;
  restoreSession(): Promise<AuthSession | null>;
  refreshSession(): Promise<AuthSession | null>;
}

function getDisplayName(user?: ApiUser, fallback?: string) {
  return (
    user?.name ||
    user?.display_name ||
    user?.username ||
    user?.email?.split("@")[0] ||
    fallback?.split("@")[0] ||
    "Guest"
  );
}

function saveSession(session: AuthSession, refreshUrl?: string) {
  const stored: StoredSession = {
    ...session,
    refreshUrl,
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
}

function readStoredSession(): StoredSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return null;
    }

    return JSON.parse(raw) as StoredSession;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

function clearStoredSession() {
  localStorage.removeItem(STORAGE_KEY);
}

export const authService: AuthService = {
  async signIn(username, password) {
    if (!username.trim() || !password) {
      throw new Error("Please enter your username and password.");
    }

    if (!API_BASE_URL || !API_KEY) {
      throw new Error(
        "API configuration is missing. Check your environment variables."
      );
    }

    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": API_KEY,
      },
      body: JSON.stringify({
        email: username.trim(),
        password,
      }),
    });

    let data: LoginResponse | { detail?: string; message?: string };

    try {
      data = await response.json();
    } catch {
      throw new Error("The server returned an invalid response.");
    }

    if (!response.ok || !("access_token" in data)) {
      const message =
        "detail" in data
          ? data.detail
          : "message" in data
            ? data.message
            : undefined;

      throw new Error(message || "Unable to sign in. Check your credentials.");
    }

    const expiresIn = data.expires_in ?? 900;

    const session: AuthSession = {
      displayName: getDisplayName(data.user, username.trim()),
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: Date.now() + expiresIn * 1000,
    };

    saveSession(session, data.refresh_url);

    return session;
  },

  async restoreSession() {
    const stored = readStoredSession();

    if (!stored) {
      return null;
    }

    const session: AuthSession = {
      displayName: stored.displayName,
      accessToken: stored.accessToken,
      refreshToken: stored.refreshToken,
      expiresAt: stored.expiresAt,
    };

    // Access token still has more than one minute remaining.
    if (session.expiresAt > Date.now() + 60_000) {
      return session;
    }

    // Token is expired or about to expire.
    if (!session.refreshToken) {
      clearStoredSession();
      return null;
    }

    return this.refreshSession();
  },

  async refreshSession() {
    const stored = readStoredSession();

    if (!stored?.refreshToken) {
      clearStoredSession();
      return null;
    }

    const refreshUrl =
      stored.refreshUrl || `${API_BASE_URL}/auth/refresh`;

    const response = await fetch(
      refreshUrl.startsWith("http")
        ? refreshUrl
        : `${API_BASE_URL}${refreshUrl}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": API_KEY,
        },
        body: JSON.stringify({
          refresh_token: stored.refreshToken,
        }),
      }
    );

    if (!response.ok) {
      clearStoredSession();
      return null;
    }

    const data = (await response.json()) as LoginResponse;

    if (!data.access_token) {
      clearStoredSession();
      return null;
    }

    const expiresIn = data.expires_in ?? 900;

    const session: AuthSession = {
      displayName: stored.displayName,
      accessToken: data.access_token,
      refreshToken: data.refresh_token ?? stored.refreshToken,
      expiresAt: Date.now() + expiresIn * 1000,
    };

    saveSession(session, data.refresh_url ?? stored.refreshUrl);

    return session;
  },

  async signOut() {
    clearStoredSession();
  },
};