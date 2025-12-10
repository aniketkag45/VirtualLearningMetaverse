import {useState} from 'react';
import { useNavigate } from 'react-router-dom';
import { coursesData } from '../data/coursesData';

const CoursesPage = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedLevel, setSelectedLevel] = useState('All');
    const navigate = useNavigate();
    


    

    const filteredCourses = coursesData.filter(course => {
        const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase())  ||
            course.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesLevel = selectedLevel === 'All' || course.level === selectedLevel;
        return matchesSearch && matchesLevel;
    });




    return (
        <div>
           
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-6 text-gray-800">Available Courses</h1>
                <input type="text"
                    value={searchQuery}
                    onChange={(e)=>setSearchQuery(e.target.value)}
                    placeholder="Search courses..."
                    className="w-full mb-4 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"

                />
                <div className="flex gap-2 mb-6">
  {['All', 'Beginner', 'Intermediate', 'Advanced'].map(level => (
    <button 
      key={level}
      onClick={() => setSelectedLevel(level)}
     className={`px-4 py-2 rounded-md hover:bg-blue-400 hover:text-white transition-colors ${selectedLevel === level ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}
    >
      {level}
    </button>
  ))}
</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {filteredCourses.map((course) => (
                        <div key={course.id} 
                        className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer"
                        onClick={() => navigate(`/courses/${course.id}`)}
                        >
                            <img src={course.image} alt={course.title} className="w-full h-40 object-cover"/>
                            <div className="p-6">
                                <h2 className="text-xl font-bold mb-2 text-gray-900">{course.title}</h2>   
                                <p className="text-gray-700 mb-4">{course.description}</p>
                                <div className="text-sm text-gray-600 mb-2"><span className="font-semibold">Instructor:</span> {course.instructor}</div>
                                <div className="text-sm text-gray-600 mb-2"><span className="font-semibold">Duration:</span> {course.duration}</div> 
                                <div className="text-sm text-gray-600"><span className="font-semibold">Level:</span> {course.level}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CoursesPage;