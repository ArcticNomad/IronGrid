// Dashboard.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Popup from "./Popup";

export default function MemberDash() {
  const [showPopup, setShowPopup] = useState(false);
  let [mess,setmess]=useState('')
  const[showButton, SetShowButton]=useState(true);
  const [userInfo, setUserInfo] = useState({ user_id: "", accountType: "" });
  const navigate = useNavigate();


    const [activeTab, setActiveTab] = useState('dashboard');
  
  // Sample member data - replace with your actual data
  const memberData = {
    name: "Alex Johnson",
    currentWeight: 75,
    targetWeight: 70,
    fitnessLevel: 7,
    activeWorkoutPlan: "Beginner Strength",
    activeDietPlan: "Muscle Gain Diet"}

//   useEffect(() => {
//       const user_id = localStorage.getItem("user_id");
//       const accountType = localStorage.getItem("account_type");
  
//       if (!user_id) {
//         setShowPopup(true); // Show popup
//         SetShowButton(false);
//         setmess('Please Log in First')
//         setTimeout(() => {
//           navigate("/login");
//         }, 2000); // navigate after 1.5s
//       } else {
//         setUserInfo({ user_id, accountType });
//         setmess('Please fill out the member registration form before continuing.');
//         SetShowButton(true);
//       }
//     }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="p-6 flex  bg-gray-900">
         {/* {showPopup && (
                <Popup
                  onClose={() => setShowPopup(false)}
                  mes={mess}
                  SetShowButton
                />
              )} */}
      {/* Sidebar */}
      <div className="w-64  bg-gradient-to-b from-gray-500 to-gray-700 text-black p-4 border-1 rounded-lg">
        <div className="flex items-center space-x-2 p-4 mb-8 border-2 rounded-lg bg-gradient-to-b from-gray-400 to-gray-300">
          <div className="w-10 h-10  flex items-center  justify-center ">
            <img src="./dumbell.png" alt="" />
          </div>
          <span className="text-xl font-extrabold px-2">Iron Grid</span>
        </div>
        
        <nav>
          {[
            { id: 'dashboard', icon: 'menu.png', label: 'Dashboard' },
            { id: 'workout', icon: 'report.png', label: 'Workout Plan' },
            { id: 'diet', icon: 'diet.png', label: 'Diet Plan' },
            { id: 'progress', icon: 'roadmap.png', label: 'Progress' },
            { id: 'sessions', icon: 'person.png', label: 'Workout Sessions' },
            { id: 'library', icon: 'book.png', label: 'Library' },
            { id: 'trainer', icon: 'whistle.png', label: 'My Trainer' },
            { id: 'notifications', icon: 'notification.png', label: 'Notifications' },
            { id: 'profile', icon: 'user.png', label: 'Profile' },
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
      <div className="flex-1 p-8 overflow-auto border-2 rounded-lg mx-4 border-gray-400">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div>
            <h1 className="text-3xl font-extrabold mb-10 text-white">Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Stats Cards */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-gray-500 text-sm font-medium">Current Weight</h3>
                <p className="text-2xl font-bold">{memberData.currentWeight} kg</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-gray-500 text-sm font-medium">Target Weight</h3>
                <p className="text-2xl font-bold">{memberData.targetWeight} kg</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-gray-500 text-sm font-medium">Fitness Level</h3>
                <p className="text-2xl font-bold">{memberData.fitnessLevel}/10</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-gray-500 text-sm font-medium">Progress</h3>
                <p className="text-2xl font-bold">
                  {Math.round((memberData.currentWeight - memberData.targetWeight) * 10)/10} kg to go
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-bold mb-4">Active Workout Plan</h2>
                <p className="text-lg">{memberData.activeWorkoutPlan}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-bold mb-4">Active Diet Plan</h2>
                <p className="text-lg">{memberData.activeDietPlan}</p>
              </div>
            </div>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div>
            <h1 className="text-3xl font-extrabold mb-10 text-white">Profile</h1>
            <div className="bg-white p-6 rounded-lg shadow">
              {/* Profile form would go here */}
              <p>Profile information and settings</p>
            </div>
          </div>
        )}

        {/* Other tabs would be implemented similarly */}
        {activeTab !== 'dashboard' && activeTab !== 'profile' && (
          <div>
            <h1 className="text-3xl font-extrabold mb-10 text-white">
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace(/([A-Z])/g, ' $1')}
            </h1>
            <div className="bg-white p-6 rounded-lg shadow">
              <p>Content for {activeTab} tab would go here</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


