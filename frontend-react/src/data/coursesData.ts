export const coursesData = [
        { id: '1', title: 'Introduction to React', description: 'Learn the basics of React.js and build dynamic web applications.',instructor: 'Jane Doe', duration: '6 weeks',level: 'Beginner', image: 'https://via.placeholder.com/150',rating: 4.5, students: 1200,category: 'Web Development',
            modules: [
                {
                    id: 'mod-1',
                    title: 'Module 1: React Basics',
                    lessons: [
                        {
                            id: 'les-1-1',
                            title: 'Lesson 1: Introduction to React',
                            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                            duration: 30,
                            description: 'Overview of React and its core concepts.',
                            isCompleted: false,
                        },
                        {
                            id: 'les-1-2',
                            title: 'Lesson 2: JSX and Components',
                            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                            duration: 45,
                            description: 'Understanding JSX syntax and creating React components.',
                            isCompleted: false,
                        },
                    ],
                },
                {
                    id: 'mod-2',
                    title: 'Module 2: State and Props',
                    lessons: [
                        {
                            id: 'les-2-1',
                            title: 'Lesson 1: Managing State',
                            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                            duration: 40,
                            description: 'Learn how to manage state in React components.',
                            isCompleted: false,
                        },
                        {
                            id: 'les-2-2',
                            title: 'Lesson 2: Using Props',

                            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                            duration: 35,
                            description: 'Passing data between components using props.',
                            isCompleted: false,
                        },
                    ],
                },
            ],


         },
        { id: '2', title: 'Advanced JavaScript', description: 'Deep dive into advanced concepts of JavaScript programming.', instructor: 'John Smith', duration: '8 weeks', level: 'Advanced', image: 'https://via.placeholder.com/150',category: 'Programming',
            modules: [
    {
        id: 'mod-2-1',
        title: 'Module 1: Async Programming',
        lessons: [
            {
                id: 'les-2-1-1',
                title: 'Promises and Async/Await',
                videoUrl: 'https://www.youtube.com/embed/V_Kr9OSfDeU',
                duration: 25,
                description: 'Master asynchronous JavaScript with promises and async/await.',
                isCompleted: false,
            },
            {
                id: 'les-2-1-2',
                title: 'Fetch API and AJAX',
                videoUrl: 'https://www.youtube.com/embed/tc8DU14qX6I',
                duration: 30,
                description: 'Learn how to make HTTP requests in JavaScript.',
                isCompleted: false,
            },
        ],
    },
    {
        id: 'mod-2-2',
        title: 'Module 2: Advanced Concepts',
        lessons: [
            {
                id: 'les-2-2-1',
                title: 'Closures and Scope',
                videoUrl: 'https://www.youtube.com/embed/qikxEIxsXco',
                duration: 20,
                description: 'Deep dive into JavaScript closures and lexical scope.',
                isCompleted: false,
            },
            {
                id: 'les-2-2-2',
                title: 'Prototypes and Inheritance',
                videoUrl: 'https://www.youtube.com/embed/wstwjQ1yqWQ',
                duration: 28,
                description: 'Understanding JavaScript prototypal inheritance.',
                isCompleted: false,
            },
        ],
    },
], rating: 4.7, students: 950 },

        { id: '3', title: 'UI/UX Design Fundamentals', description: 'Understand the principles of user interface and user experience design.', instructor: 'Emily Johnson', duration: '5 weeks', level: 'Intermediate', image: 'https://via.placeholder.com/150',category: 'Design',
            modules:[], rating: 4.3, students: 800 },
        { id: '4', title: 'Data Structures and Algorithms', description: 'Learn essential data structures and algorithms for efficient coding.', instructor: 'Michael Brown', duration: '10 weeks', level: 'Advanced', image: 'https://via.placeholder.com/150',category: 'Computer Science',
             modules:[], rating: 4.8, students: 1100 },
        { id: '5', title: 'Web Development with Node.js', description: 'Build scalable backend applications using Node.js and Express.', instructor: 'Sarah Wilson', duration: '7 weeks', level: 'Intermediate', image: 'https://via.placeholder.com/150',category: 'Web Development',
             modules:[], rating: 4.6, students: 900 },
        { id: '6', title: 'Python for Data Science', description: 'Explore data science concepts and techniques using Python.', instructor: 'David Lee', duration: '9 weeks', level: 'Beginner', image: 'https://via.placeholder.com/150', modules: [
    {
        id: 'mod-6-1',
        title: 'Module 1: Python Basics for Data Science',
        lessons: [
            {
                id: 'les-6-1-1',
                title: 'NumPy Fundamentals',
                videoUrl: 'https://www.youtube.com/embed/QUT1VHiLmmI',
                duration: 22,
                description: 'Learn NumPy arrays and operations for data manipulation.',
                isCompleted: false,
            },
            {
                id: 'les-6-1-2',
                title: 'Pandas DataFrames',
                videoUrl: 'https://www.youtube.com/embed/vmEHCJofslg',
                duration: 28,
                description: 'Master pandas for data analysis and manipulation.',
                isCompleted: false,
            },
            {
                id: 'les-6-1-3',
                title: 'Data Visualization with Matplotlib',
                videoUrl: 'https://www.youtube.com/embed/DAQNHzOcO5A',
                duration: 25,
                description: 'Create stunning visualizations with matplotlib.',
                isCompleted: false,
            },
        ],
    },
    {
        id: 'mod-6-2',
        title: 'Module 2: Data Analysis Projects',
        lessons: [
            {
                id: 'les-6-2-1',
                title: 'Exploratory Data Analysis',
                videoUrl: 'https://www.youtube.com/embed/xi0vhXFPegw',
                duration: 30,
                description: 'Learn EDA techniques for understanding datasets.',
                isCompleted: false,
            },
            {
                id: 'les-6-2-2',
                title: 'Statistical Analysis with Python',
                videoUrl: 'https://www.youtube.com/embed/Iq9DzN6mvYA',
                duration: 27,
                description: 'Apply statistical methods to real-world data.',
                isCompleted: false,
            },
        ],
    },
], rating: 4.4, students: 1000, category: 'Data Science' },
        { id: '7', title: 'Machine Learning Basics', description: 'Get started with machine learning algorithms and applications.', instructor: 'Laura Martinez', duration: '8 weeks', level: 'Intermediate', image: 'https://via.placeholder.com/150', modules:[], rating: 4.5, students: 850, category: 'Artificial Intelligence' },
    ]; 
