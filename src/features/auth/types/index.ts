export type AuthUser = {
  id: string;
  email: string;
  role: "user" | "host" | "admin";
};

export type AuthSession = {
  user: AuthUser | null;
  accessToken: string | null;
};

export type SignUpInput = {
  email: string;
  password: string;
  fullName?: string;
  preferredLanguage?: string;
};

export type SignInInput = {
  email: string;
  password: string;
};

export type MagicLinkInput = {
  email: string;
};

export const ROLES = {
  USER: "user" as const,
  HOST: "host" as const,
  ADMIN: "admin" as const,
};
