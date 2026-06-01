import {create} from 'zustand';

export interface User {
    id: string | null;
    email: string | null;
    name: string | null;
    userType: 'student' | 'teacher' | 'admin';
}

interface AuthStore {
    user: User | null;
    accessToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;

    login: (userData: User, accessToken?: string | null) => void;
    logout: () => void;

    initializeAuth: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
    user: null,
    accessToken: null,
    isAuthenticated: false,
    isLoading: true,

    login:(userData: User, accessToken: string | null = null)=> {  
        console.log('Logging in with', userData)

        // const newUser: User = {
        //     id: '1',
        //     email: email,
        //     name: email.split('@')[0],
        //     userType: 'student',
        // };

        set({user: userData, accessToken, isAuthenticated: true});

        localStorage.setItem('user', JSON.stringify(userData));
        if (accessToken) {
            localStorage.setItem('accessToken', accessToken);
        } else {
            localStorage.removeItem('accessToken');
        }
    },
    logout: () => {
        set({user: null, accessToken: null, isAuthenticated: false});
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
    },

    initializeAuth: () => {
        const savedUser = localStorage.getItem('user');
        const savedToken = localStorage.getItem('accessToken');
        if (savedUser) {
            set({user: JSON.parse(savedUser), accessToken: savedToken, isAuthenticated: true, isLoading: false});
        } else {
            set({isLoading: false});
        }
    }   
})  
);