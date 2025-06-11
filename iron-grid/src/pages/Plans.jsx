export default function Plans() {
  return (
    <div className="relative min-h-screen p-6">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')" }}
      ></div>
      <div className="absolute inset-0 bg-gray-800 bg-opacity-60 z-10"></div>
      
      {/* Content */}
      <div className="relative z-20">
        <h1 className="text-4xl font-extrabold mb-10 text-white">
          Training Plans
        </h1>
        
        {/* Workout Plans Card */}
        <div className="bg-white bg-opacity-90 p-6 rounded-lg shadow-lg backdrop-blur-sm bg-gradient-to-b from-gray-500 to-gray-300">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-gray-800">Workout Plans</h2>
            <img src="./work.gif" className="w-15 h-15  object-cover rounded-full "></img>
            </div>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
              Create New
            </button>
          </div>
          <p className="text-gray-800 font-semibold">List of workout and diet plans</p>
          
          {/* Sample Plan Items */}
          <div className="mt-6 space-y-4">
            <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 ">
              <h3 className="font-semibold">Beginner Full Body Routine</h3>
              <p className="text-sm text-gray-500">3 days/week • 45 mins/session</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
              <h3 className="font-semibold">Advanced Strength Program</h3>
              <p className="text-sm text-gray-500">5 days/week • 60 mins/session</p>
            </div>
          </div>
        </div>
        
        {/* Meal Plans Card */}
        <div className="bg-white bg-opacity-90 bg-gradient-to-b from-gray-500 to-gray-300 p-6 rounded-lg shadow-lg backdrop-blur-sm mt-10">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-gray-800">Meal Plans</h2>
            <img src="./diet.gif" className="w-15 h-15  object-cover rounded-full "></img>
            </div>
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors">
              Create New
            </button>
          </div>
          <p className="text-gray-800 font-semibold">List of meal and diet plans</p>
          
          {/* Sample Meal Items */}
          <div className="mt-6 space-y-4">
            <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
              <h3 className="font-semibold">Weight Loss Meal Plan</h3>
              <p className="text-sm text-gray-500">1,800 calories/day • 40% protein</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
              <h3 className="font-semibold">Muscle Gain Nutrition</h3>
              <p className="text-sm text-gray-500">3,000 calories/day • High protein</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}