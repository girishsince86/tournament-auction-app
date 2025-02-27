import { User } from '@supabase/supabase-js'

export type UserRole = 'admin' | 'team_owner' | 'user'

export interface AuthUser extends User {
  role?: UserRole
  user_metadata: {
    role?: UserRole
    [key: string]: any
  }
}

export interface AuthSession {
  user: AuthUser
  access_token: string
  refresh_token: string
}

export interface AuthState {
  user: AuthUser | null
  isLoading: boolean
  error: Error | null
}

export interface AuthContextType extends AuthState {
  signUp: (email: string, password: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
} 