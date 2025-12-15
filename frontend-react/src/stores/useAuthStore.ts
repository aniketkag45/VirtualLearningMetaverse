import {create} from 'zustand';

export interface User {
    id: string | null;
    email: string | null;
    name: string | null;
    userType: 'student' | 'teacher' | 'admin';
}

interface AuthStore {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;

    login: (userData: User) => void;
    logout: () => void;

    initializeAuth: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
    user: null,
    isAuthenticated: false,
    isLoading: true,

    login:(userData: User)=> {  
        console.log('Logging in with', userData)

        // const newUser: User = {
        //     id: '1',
        //     email: email,
        //     name: email.split('@')[0],
        //     userType: 'student',
        // };

        set({user: userData, isAuthenticated: true});

        localStorage.setItem('user', JSON.stringify(userData));
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