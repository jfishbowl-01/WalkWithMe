export interface LocalSessionUser {
  id: string;
  displayName: string;
  email: string;
}

export interface LocalSession {
  isAuthenticated: boolean;
  user: LocalSessionUser | null;
  signedInAt: string | null;
}

export interface LoginActionResult {
  success: boolean;
  redirectTo?: string;
  errorMessage?: string;
}

// Made with Bob
