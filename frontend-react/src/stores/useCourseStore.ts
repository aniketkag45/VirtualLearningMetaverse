import {create} from 'zustand';
import { coursesData } from '../data/coursesData';

export interface EnrolledCourse {
    courseId: number;
    courseName: string;
    progress: number; // percentage of course completed
    enrolledDate: string; // ISO date string
}

interface CourseStore {
    enrolledCourses: EnrolledCourse[];
    completedLessons: Record<string, boolean>; // Track completed lessons: 'courseId-lessonId': true/false

    enrollInCourse: (courseId: number, courseName: string) => void;
    unenrollFromCourse: (courseId: number) => void;
    isEnrolled: (courseId: number) => boolean;
    initializeCourses: () => void;

    markLessonComplete: (courseId: string, lessonId: string) => void;
    isLessonCompleted: (courseId: string, lessonId: string) => boolean;
    getCourseProgress: (courseId: string) => number;
}

export const useCourseStore = create<CourseStore>((set, get) => ({
    enrolledCourses: [],
    completedLessons: {},

    markLessonComplete: (courseId, lessonId) => {
        const key = `${courseId}-${lessonId}`;
        set((state) => ({
            completedLessons: {
                ...state.completedLessons,
                [key]: true
            }
        }));
        // Save to localStorage after updating state
        localStorage.setItem('completedLessons', JSON.stringify(get().completedLessons));
    },

    isLessonCompleted: (courseId, lessonId) => {
        const key = `${courseId}-${lessonId}`;
        return get().completedLessons[key] === true;
    },

    getCourseProgress: (courseId) => {
        const course = coursesData.find(c => c.id === courseId);
        if(!course) return 0;

        let totalLessons = 0;
        course.modules.forEach(module => {
            totalLessons += module.lessons.length;
        });
        
        if (totalLessons === 0) return 0;

        const completedCount = Object.keys(get().completedLessons).filter(key => {
            return key.startsWith(`${courseId}-`) && get().completedLessons[key] === true;
        }).length;

        return Math.round((completedCount / totalLessons) * 100);
    },

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
    
    // Load enrolled courses and completed lessons from localStorage on init
    initializeCourses: () => {
        const savedCourses = localStorage.getItem('enrolledCourses');
        const savedLessons = localStorage.getItem('completedLessons');
        
        if (savedCourses) {
            set({ enrolledCourses: JSON.parse(savedCourses) });
        }
        if (savedLessons) {
            set({ completedLessons: JSON.parse(savedLessons) });
        }
    }
}));
