import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ExerciseLibrary from "./ExerciseLibrary";
import MealLibrary from "./MealLibrary";
import Plans from "./Plans";

export default function TrainerDash() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const navigate = useNavigate();

  // Sample trainer data
  const trainerData = {
    name: "Coach Smith",
    certification: "NASM Certified",
    clients: 24,
    activePlans: 18,
    specialization: "Strength Training"
  };

  return (
    <div className="p-6 flex bg-gray-900 min-h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-gradient-to-b from-gray-500 to-gray-700 text-black p-4 border-1 rounded-lg">
        <div className="flex items-center space-x-2 p-4 mb-8 border-2 rounded-lg bg-gradient-to-b from-gray-400 to-gray-300">
          <div className="w-10 h-10 flex items-center justify-center">
            <img src="./dumbell.png" alt="Iron Grid Logo" />
          </div>
          <span className="text-xl font-extrabold px-2 text-shadow-gray-400">Iron Grid</span>
        </div>
        
        <nav>
          {[
            { id: 'dashboard', icon: 'menu.png', label: 'Dashboard' },
            { id: 'exercises', icon: 'exercise.png', label: 'Exercises' },
            { id: 'meals', icon: 'iftar.png', label: 'Meals' },
            { id: 'plans', icon: 'task.png', label: 'Plans' },
            { id: 'clients', icon: 'customers.png', label: 'Clients' },
            { id: 'schedule', icon: 'calendar.png', label: 'Schedule' },
            { id: 'notifications', icon: 'notification.png', label: 'Notifications' },
            { id: 'profile', icon: 'user.png', label: 'Profile' }
          ].map((tab) => (
            <button  
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex font-semibold items-center space-x-2 w-full p-3 rounded-lg mb-1 text-left transition-colors ${
                activeTab === tab.id ? 'bg-gray-700' : 'hover:bg-gray-400'
              }`}
            >
              <img src={tab.icon} alt="" className="w-8 h-8"/>
              <span className="text-white">{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-auto border-2 rounded-lg mx-4 border-gray-400 bg-gray-800">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div>
            <h1 className="text-3xl font-extrabold mb-10 text-white">Trainer Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {/* Stats Cards */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-gray-500 text-sm font-medium">Total Clients</h3>
                <p className="text-2xl font-bold">{trainerData.clients}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-gray-500 text-sm font-medium">Active Plans</h3>
                <p className="text-2xl font-bold">{trainerData.activePlans}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-gray-500 text-sm font-medium">Certification</h3>
                <p className="text-2xl font-bold">{trainerData.certification}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-bold mb-4">Specialization</h2>
                <p className="text-lg">{trainerData.specialization}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
                <p className="text-gray-600">No recent notifications</p>
              </div>
            </div>
          </div>
        )}

        {/* Exercises Tab */}
        {activeTab === 'exercises' && (
        //   <div>
        //     <h1 className="text-3xl font-extrabold mb-10 text-white">Exercise Library</h1>
        //     <div className="bg-white p-6 rounded-lg shadow">
        //       <div className="flex justify-between items-center mb-4">
        //         <h2 className="text-xl font-bold">Your Exercises</h2>
        //         <button className="bg-blue-500 text-white px-4 py-2 rounded">
        //           + Add Exercise
        //         </button>
        //       </div>
        //       <p>List of exercises would appear here</p>
        //     </div>
        //   </div>

        <ExerciseLibrary/>
        )}

        {/* Meals Tab */}
        {activeTab === 'meals' && (
        //   <div>
        //     <h1 className="text-3xl font-extrabold mb-10 text-white">Meal Library</h1>
        //     <div className="bg-white p-6 rounded-lg shadow">
        //       <div className="flex justify-between items-center mb-4">
        //         <h2 className="text-xl font-bold">Your Meals</h2>
        //         <button className="bg-blue-500 text-white px-4 py-2 rounded">
        //           + Add Meal
        //         </button>
        //       </div>
        //       <p>List of meals would appear here</p>
        //     </div>
        //   </div>

        <MealLibrary/>
        )}

        {/* Plans Tab */}
        {activeTab === 'plans' && (
        //   <div>
        //     <h1 className="text-3xl font-extrabold mb-10 text-white">Training Plans</h1>
        //     <div className="bg-white p-6 rounded-lg shadow">
        //       <div className="flex justify-between items-center mb-4">
        //         <h2 className="text-xl font-bold">Client Plans</h2>
        //         <button className="bg-blue-500 text-white px-4 py-2 rounded">
        //           + Create Plan
        //         </button>
        //       </div>
        //       <p>List of workout and diet plans would appear here</p>
        //     </div>
        //   </div>
        <Plans/>
        )}

        {/* Clients Tab */}
        {activeTab === 'clients' && (
          <div>
            <h1 className="text-3xl font-extrabold mb-10 text-white">Client Management</h1>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Your Clients</h2>
                <button className="bg-blue-500 text-white px-4 py-2 rounded">
                  + Add Client
                </button>
              </div>
              <p>Client list and management tools would appear here</p>
            </div>
          </div>
        )}

        {/* Other tabs would be implemented similarly */}
        {!['dashboard', 'exercises', 'meals', 'plans', 'clients','profile'].includes(activeTab) && (
          <div>
            <h1 className="text-3xl font-extrabold mb-10 text-white">
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </h1>
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="font-bold  ">This Feature is under Development</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}