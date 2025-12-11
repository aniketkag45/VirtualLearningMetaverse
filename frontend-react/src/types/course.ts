export interface Lesson{
    id: string;
    title: string;
    videoUrl: string;
    duration: number; // in minutes
    description?: string;
    isCompleted: boolean;   

}

export interface Module{
    id: string;
    title: string;
    lessons: Lesson[];
}

export interface Course{
    id: string;
    title: string;
    description: string;
    instructor: string;
    duration: string; // e.g., "6 weeks"
    level: 'Beginner' | 'Intermediate' | 'Advanced';
    category: string;
    image: string;
    rating: number; // average rating
    students: number; // number of enrolled students
    modules: Module[];
}