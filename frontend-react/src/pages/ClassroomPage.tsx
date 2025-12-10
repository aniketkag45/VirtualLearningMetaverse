

const ClassroomPage = () => {
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Welcome to the world of 3D Classroom</h1>  
            <div className="w-full h-96 bg-gray-200 flex items-center justify-center rounded-lg shadow-md">

                <p>video area</p>
                
                </div>   
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                   <div className="bg-white p-4 rounded-lg shadow-md h-64">
                     <h2 className="font-bold mb-2">Participants</h2>
                     <p className="text-gray-500">No participants yet</p>
                  </div>
                
                        <div className="bg-white p-4 rounded-lg shadow-md h-64">
                            <h2 className="font-bold mb-2">Chat</h2>
                            <p className="text-gray-500">No messages yet</p>
                        </div>
                 </div>
            </div>
    );
}
export default ClassroomPage;