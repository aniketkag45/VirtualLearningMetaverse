import {create} from 'zustand';

export interface User {
    id: string | null;
    email: string | null;
    name: string | null;
    role: 'student' | 'instructor' | 'admin';
}

interface AuthStore {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;

    login: (email: string) => void;
    logout: () => void;

    initializeAuth: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
    user: null,
    isAuthenticated: false,
    isLoading: true,

    login:(email)=> {  
        console.log('Logging in with', email)

        const newUser: User = {
            id: '1',
            email: email,
            name: email.split('@')[0],
            role: 'student',
        };

        set({user: newUser, isAuthenticated: true});

        localStorage.setItem('user', JSON.stringify(newUser));
    },
    logout: () => {
        set({user: null, isAuthenticated: false});
        localStorage.removeItem('user');
    },

    initializeAuth: () => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            set({user: JSON.parse(savedUser), isAuthenticated: true, isLoading: false});
        } else {
            set({isLoading: false});
        }
    }   
})  
);