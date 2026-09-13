export interface AuthSession { displayName: string; }
export interface AuthService { signIn(username: string, password: string): Promise<AuthSession>; signOut(): Promise<void>; }
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
export const mockAuthService: AuthService = {
  async signIn(username, password) {
    await wait(650);
    if (!username.trim() || password.length < 4 || username.toLowerCase() === "error") throw new Error("We couldn't sign you in. Check your details and try again.");
    return { displayName: username.trim().split("@")[0] || "Guest" };
  },
  async signOut() { await wait(120); },
};
export const authService: AuthService = mockAuthService;
