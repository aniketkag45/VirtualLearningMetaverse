import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// User type definition
export interface User {
  id: string
  email: string
  name: string
  userType: 'student' | 'teacher' | 'admin'
  avatar?: string
  enrollmentNumber?: string
  phone?: string
}

// Authentication state interface
interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  
  // Actions
  login: (userData: User) => void
  logout: () => void
  updateUser: (userData: Partial<User>) => void
  clearError: () => void
  initializeAuth: () => void
}

// Create the authentication store with persistence
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Login action
      login: (userData: User) => {
        try {
          set({
            user: userData,
            isAuthenticated: true,
            isLoading: false,
            error: null
          })
          
          // Store in session storage as well for compatibility
          sessionStorage.setItem('userType', userData.userType)
          sessionStorage.setItem('userEmail', userData.email)
          sessionStorage.setItem('isLoggedIn', 'true')
          
        } catch (error) {
          set({
            error: 'Login failed. Please try again.',
            isLoading: false
          })
        }
      },

      // Logout action
      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null
        })
        
        // Clear session storage
        sessionStorage.removeItem('userType')
        sessionStorage.removeItem('userEmail')
        sessionStorage.removeItem('isLoggedIn')
        
        // Clear local storage (handled by zustand persist middleware)
        localStorage.removeItem('auth-storage')
      },

      // Update user information
      updateUser: (userData: Partial<User>) => {
        const currentUser = get().user
        if (currentUser) {
          const updatedUser = { ...currentUser, ...userData }
          set({
            user: updatedUser
          })
        }
      },

      // Clear any errors
      clearError: () => {
        set({ error: null })
      },

      // Initialize authentication state (check if user was previously logged in)
      initializeAuth: () => {
        set({ isLoading: true })
        
        try {
          // Check session storage for backwards compatibility
          const isLoggedIn = sessionStorage.getItem('isLoggedIn')
          const userType = sessionStorage.getItem('userType')
          const userEmail = sessionStorage.getItem('userEmail')
          
          // If we have session data but no persisted user, create one
          const currentUser = get().user
          if (isLoggedIn === 'true' && userType && userEmail && !currentUser) {
            const restoredUser: User = {
              id: `restored_${userType}_${Date.now()}`,
              email: userEmail,
              name: userType === 'student' ? 'Demo Student' : 
                    userType === 'teacher' ? 'Demo Teacher' : 'Demo Admin',
              userType: userType as 'student' | 'teacher' | 'admin'
            }
            
            set({
              user: restoredUser,
              isAuthenticated: true,
              isLoading: false
            })
          } else {
            set({ isLoading: false })
          }
          
        } catch (error) {
          console.error('Failed to initialize auth:', error)
          set({
            isLoading: false,
            error: 'Failed to restore session'
          })
        }
      }
    }),
    {
      name: 'auth-storage', // unique name for localStorage key
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }), // only persist user and authentication status
    }
  )
)

// Utility functions for auth store
export const getAuthState = () => useAuthStore.getState()

export const isUserLoggedIn = () => {
  const { isAuthenticated, user } = getAuthState()
  return isAuthenticated && user !== null
}

export const getCurrentUser = () => {
  const { user } = getAuthState()
  return user
}

export const getUserType = () => {
  const { user } = getAuthState()
  return user?.userType || null
}

export const isStudent = () => getUserType() === 'student'
export const isTeacher = () => getUserType() === 'teacher'
export const isAdmin = () => getUserType() === 'admin'

// Auth guard hook for components
export const useAuth = () => {
  const { user, isAuthenticated, isLoading, error } = useAuthStore()
  
  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    isStudent: user?.userType === 'student',
    isTeacher: user?.userType === 'teacher',
    isAdmin: user?.userType === 'admin'
  }
}