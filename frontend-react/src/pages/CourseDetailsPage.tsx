import {useParams} from 'react-router-dom';
import { coursesData } from '../data/coursesData';
import { useCourseStore } from '../stores/useCourseStore';
import toast from 'react-hot-toast';

const CourseDetailsPage = () => {
    const { courseId } = useParams();
    const { enrollInCourse, isEnrolled } = useCourseStore();

    const courses = coursesData;

    const course =courses.find(c => c.id.toString() === courseId);
    const enrolled = isEnrolled(Number(courseId));

    if (!course) {
        return <div className="p-8">Course not found.</div>;
    }   
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-4 text-gray-800">{course.title}</h1>
            <img src={course.image} alt={course.title} className="w-full h-64 object-cover mb-6 rounded-lg shadow-md"/>
            <p className="text-gray-700 mb-4">{course.description}</p>
            <p className="text-gray-600 mb-2"><span className="font-semibold">Instructor:</span> {course.instructor}</p>
            <p className="text-gray-600 mb-2"><span className="font-semibold">Duration:</span> {course.duration}</p>
            <p className="text-gray-600"><span className="font-semibold">Level:</span> {course.level}</p>
            <button className={`mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors
            ${
    enrolled 
      ? 'bg-green-500 text-white cursor-not-allowed' 
      : 'bg-blue-500 text-white hover:bg-blue-600'
  }`}
            onClick={() => {
                if (!enrolled) {
                    enrollInCourse(course.id, course.title);
                    toast.success(`Enrolled in ${course.title} successfully!`);
                }
            }}
            disabled={enrolled}
            >
                {enrolled ? 'Enrolled' : 'Enroll Now'}
            </button>
        </div>
    );
}
export default CourseDetailsPage;