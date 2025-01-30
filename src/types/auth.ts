import { User } from '@supabase/supabase-js'

export interface AuthUser extends User {
  // Add any additional user properties we might need
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