import {create} from 'zustand';

export interface EnrolledCourse {
    courseId: number;
    courseName: string;
    progress: number; // percentage of course completed
    enrolledDate: string; // ISO date string
}

interface CourseStore {
    enrolledCourses: EnrolledCourse[];

    enrollInCourse: (courseId: number, courseName: string) => void;
    unenrollFromCourse: (courseId: number) => void;
    isEnrolled: (courseId: number) => boolean;
    initializeCourses: () => void;
}

export const useCourseStore = create<CourseStore>((set, get) => ({
    enrolledCourses: [],

    enrollInCourse: (courseId, courseName) => {
        const existingCourse = get().enrolledCourses.find(c => c.courseId === courseId);
        if (!existingCourse) {  
            const newCourse: EnrolledCourse = {
                courseId,
                courseName,
                progress: 0,
                enrolledDate: new Date().toISOString(),
            };
            set((state) => ({
                enrolledCourses: [...state.enrolledCourses, newCourse]
            }));
            const current = get().enrolledCourses;
            localStorage.setItem('enrolledCourses', JSON.stringify(current));
        }
    },
    unenrollFromCourse: (courseId) => {
        set((state) => ({
            enrolledCourses: state.enrolledCourses.filter(c => c.courseId !== courseId)
        }));
        const current = get().enrolledCourses;
        localStorage.setItem('enrolledCourses', JSON.stringify(current));
    },
    isEnrolled: (courseId) => {
        return get().enrolledCourses.some(c => c.courseId === courseId);
    },
    
    // Load enrolled courses from localStorage on init
    initializeCourses: () => {
        const saved = localStorage.getItem('enrolledCourses');
        if (saved) {
            set({ enrolledCourses: JSON.parse(saved) });
        }
    }
}));
