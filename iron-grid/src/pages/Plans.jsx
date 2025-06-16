import { useState, useEffect } from "react";
import DietPlan from "./DietPlan";
import WorkoutPlan from "./WorkoutPlan";

export default function Plans() {
  // Workout Plan States
  const [showWorkoutForm, setShowWorkoutForm] = useState(false);
  const [workoutEye, setWorkoutEye] = useState(false);
  const [selectedWorkoutPlan, setSelectedWorkoutPlan] = useState(null);
  const [newWorkoutPlan, setNewWorkoutPlan] = useState({
    plan_name: "",
    duration_weeks: 4,
    duration_session: "30",
    difficulty_level: "beginner",
    status: "draft",
    notes: "",
  });
  const [workoutPlans, setWorkoutPlans] = useState([]);
  const [isLoadingWorkout, setIsLoadingWorkout] = useState(false);

  // Diet Plan States (unchanged)
  const [showDietForm, setShowDietForm] = useState(false);
  const [dietEye, setDietEye] = useState(false);
  const [selectedDietPlan, setSelectedDietPlan] = useState(null);
  const [newDietPlan, setNewDietPlan] = useState({
    plan_name: "",
    daily_calories: 2000,
    protein_grams: 150,
    carbs_grams: 200,
    fat_grams: 65,
    dietary_restrictions: "",
    cuisine_preferences: "",
    status: "draft",
  });
  const [dietPlans, setDietPlans] = useState([]);

  // Fetch workout plans
  const fetchWorkoutPlans = async () => {
    setIsLoadingWorkout(true);
    try {
      const response = await fetch("/getWorkoutPlans", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch workout plans");
      }

      setWorkoutPlans(
        data.data?.map((plan) => ({
          workout_plan_id: plan.workout_plan_id,
          plan_name: plan.plan_name || "Unnamed Workout Plan",
          duration_weeks: plan.duration_weeks || 4,
          duration_session: plan.duration_session || 30,
          difficulty_level: plan.difficulty_level || "beginner",
          status: plan.status || "draft",
          notes: plan.notes || "",
        })) || []
      );
    } catch (err) {
      console.error("Error fetching workout plans:", err);
    } finally {
      setIsLoadingWorkout(false);
    }
  };

  // Fetch diet plans (unchanged)
  const fetchDietPlans = async () => {
    try {
      const response = await fetch("/getDietPlans", {
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch diet plans");
      }

      if (data.data && Array.isArray(data.data)) {
        setDietPlans(
          data.data.map((plan) => ({
            diet_plan_id: plan.diet_plan_id,
            plan_name: plan.plan_name || "Unnamed Diet Plan",
            daily_calories: plan.daily_calories || 2000,
            protein_grams: plan.protein_grams || 150,
            carbs_grams: plan.carbs_grams || 200,
            fat_grams: plan.fat_grams || 65,
            dietary_restrictions: plan.dietary_restrictions || "",
            cuisine_preferences: plan.cuisine_preferences || "",
            status: plan.status || "draft",
          }))
        );
      } else {
        setDietPlans([]);
      }
    } catch (err) {
      console.error("Error fetching diet plans:", err);
    }
  };

  useEffect(() => {
    fetchWorkoutPlans();
    fetchDietPlans();
  }, []);

  // Workout plan handlers
  const handleWorkoutInputChange = (e) => {
    const { name, value, type } = e.target;
    setNewWorkoutPlan((prev) => ({
      ...prev,
      [name]: type === "number" ? parseInt(value) || 0 : value,
    }));
  };
const handleDeleteWorkoutPlan = async (planId) => {
    if (!window.confirm("Are you sure you want to delete this workout plan?")) {
      return;
    }
  try {
    // First attempt to delete normally
    let response = await fetch(`/deleteWorkoutPlans/${planId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    let result = await response.json();

    if (!response.ok && result.requiresConfirmation) {
      // Show confirmation dialog if plan has active members
      const confirmed = window.confirm(
        `This plan has ${result.memberCount} active member(s). Are you sure you want to delete it? This will remove all member assignments.`
      );

      if (confirmed) {
        // Retry with force delete
        response = await fetch(`/deleteWorkoutPlans/${planId}?forceDelete=true`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        result = await response.json();

        if (!response.ok) throw new Error(result.error || 'Failed to delete workout plan');
      } else {
        return; // User cancelled
      }
    } else if (!response.ok) {
      throw new Error(result.error || 'Failed to delete workout plan');
    }

    // Refresh the plans list
    const workoutResponse = await fetch('/api/workout-plans/available', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (workoutResponse.ok) {
      const workoutPlans = await workoutResponse.json();
      
    }

    
    

    fetchWorkoutPlans();
    alert('Plan Deleted successfully ')

  } catch (err) {
    console.error('Error deleting workout plan:', err);
    
  }
};
  const handleSubmitWorkoutPlan = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/workoutPlan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...newWorkoutPlan,
          user_id: localStorage.getItem("user_id"),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create workout plan");
      }

      setShowWorkoutForm(false);
      setNewWorkoutPlan({
        plan_name: "",
        duration_weeks: 4,
        duration_session: "30",
        difficulty_level: "beginner",
        status: "draft",
        notes: "",
      });
      fetchWorkoutPlans();
    } catch (err) {
      console.error("Error creating workout plan:", err);
      alert(err.message || "Failed to create workout plan");
    }
  };

  // Diet plan handlers (unchanged)
const handleDietInputChange = (e) => {
  const { name, value, type } = e.target;
  setNewDietPlan((prev) => ({
    ...prev,
    [name]:
      type === "number" || name.includes("_grams") || name === "daily_calories"
        ? parseInt(value) || 0
        : value,
  }));
};const handleDeleteDietPlan = async (planId) => {
  if (!window.confirm("Are you sure you want to delete this diet plan?")) {
    return;
  }

  try {
    // First attempt to delete normally
    let response = await fetch(`/deleteDietPlans/${planId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    let result = await response.json();

    if (!response.ok && result.requiresConfirmation) {
      // Show confirmation dialog if plan has active members
      const confirmed = window.confirm(
        `This plan has ${result.memberCount} active member(s). Are you sure you want to delete it? This will remove all member assignments.`
      );

      if (confirmed) {
        // Retry with force delete
        response = await fetch(`/deleteDietPlans/${planId}?forceDelete=true`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        result = await response.json();

        if (!response.ok) throw new Error(result.error || 'Failed to delete diet plan');
      } else {
        return; // User cancelled
      }
    } else if (!response.ok) {
      throw new Error(result.error || 'Failed to delete diet plan');
    }

    // Refresh the plans list
    fetchDietPlans();
    alert('Diet plan deleted successfully');

  } catch (err) {
    console.error('Error deleting diet plan:', err);
    alert(err.message || 'Failed to delete diet plan');
  }
};
  const handleSubmitDietPlan = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/mealPlan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...newDietPlan,
          user_id: localStorage.getItem("user_id"),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to add diet plan");
      }

      await fetchDietPlans();
      setShowDietForm(false);
      setNewDietPlan({
        plan_name: "",
        daily_calories: 2000,
        protein_grams: 150,
        carbs_grams: 200,
        fat_grams: 65,
        dietary_restrictions: "",
        cuisine_preferences: "",
        status: "draft",
      });
    } catch (err) {
      console.error("Submission error:", err);
    }
  };

  return (
    <div className="relative min-h-screen p-6">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0"></div>
      <div className="absolute inset-0 bg-gray-800 bg-opacity-60 z-10"></div>

      {/* Content */}
      <div className="relative z-20">
        <h1 className="text-4xl font-extrabold mb-10 text-white">
          Training & Nutrition Plans
        </h1>

        {/* Workout Plans Card */}
        <div className="bg-white bg-opacity-90 p-6 rounded-lg shadow-lg backdrop-blur-sm bg-gradient-to-b from-gray-100 to-gray-300">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2 border-2 border-white rounded-lg px-2 bg-gradient-to-l from-gray-200 to-gray-500">
              <h2 className="text-2xl font-bold text-gray-800">Workout Plans</h2>
              <img
                src="./work.gif"
                alt="Workout animation"
                className="w-12 h-12 object-cover rounded-full"
              />
            </div>
            <button
              onClick={() => setShowWorkoutForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Create New
            </button>
          </div>
          <p className="text-gray-800 font-semibold mb-4">
            List of workout plans
          </p>

          <div className="mt-6 space-y-4">
            {isLoadingWorkout ? (
              <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                <p className="text-gray-500">Loading workout plans...</p>
              </div>
            ) : workoutPlans.length > 0 ? (
              workoutPlans.map((plan) => (
                <div
                  key={plan.workout_plan_id}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 bg-white flex justify-between items-center"
                >
                  <div>
                    <h3 className="font-semibold">
                      {plan.plan_name || "New Workout Plan"}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {plan.duration_weeks} weeks • {plan.duration_session} mins/session • {plan.difficulty_level}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDeleteWorkoutPlan(plan.workout_plan_id)}
                      className="p-1 text-red-600 hover:text-white hover:bg-red-600 rounded-full transition-colors"
                      title="Delete Plan"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                    <img
                      onClick={() => {
                        setSelectedWorkoutPlan(plan);
                        setWorkoutEye(true);
                      }}
                      className="w-7 h-7 hover:h-8 hover:w-8 hover:bg-white rounded-4xl hover:transition-all hover:cursor-pointer"
                      src="./eye.png"
                      alt="preview"
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                <p className="text-gray-500">No workout plans created yet</p>
              </div>
            )}
          </div>
        </div>

     
        {/* Diet Plans Card */}
<div className="bg-white bg-opacity-90 bg-gradient-to-b from-gray-100 to-gray-300 p-6 rounded-lg shadow-lg backdrop-blur-sm mt-10">
  <div className="flex justify-between items-center mb-4">
    <div className="flex items-center gap-2 border-2 border-white rounded-lg px-2 bg-gradient-to-l from-gray-200 to-gray-500">
      <h2 className="text-2xl font-bold text-gray-800">Meal Plans</h2>
      <img
        src="./diet.gif"
        alt="Diet animation"
        className="w-12 h-12 object-cover rounded-full"
      />
    </div>
    <button
      onClick={() => setShowDietForm(true)}
      className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
    >
      Create New
    </button>
  </div>
  <p className="text-gray-800 font-semibold mb-4">
    List of meal and diet plans
  </p>

  <div className="mt-6 space-y-4">
    {dietPlans.length > 0 ? (
      dietPlans.map((plan, index) => (
        <div
          key={index}
          className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 bg-white flex justify-between items-center"
        >
          <div>
            <h3 className="font-semibold">
              {plan.plan_name || "New Diet Plan"}
            </h3>
            <p className="text-sm text-gray-500">
              {plan.daily_calories} Calories • Protein:{" "}
              {plan.protein_grams}g • Carbs: {plan.carbs_grams}g •
              Fat: {plan.fat_grams}g
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleDeleteDietPlan(plan.diet_plan_id)}
              className="p-1 text-red-600 hover:text-white hover:bg-red-600 rounded-full transition-colors"
              title="Delete Plan"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
            <img
              onClick={() => {
                setSelectedDietPlan(plan);
                setDietEye(true);
              }}
              className="w-7 h-7 hover:h-8 hover:w-8 hover:bg-white rounded-4xl hover:transition-all hover:cursor-pointer"
              src="./eye.png"
              alt="preview"
            />
          </div>
        </div>
      ))
    ) : (
      <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
        <p className="text-gray-500">No diet plans created yet</p>
      </div>
    )}
  </div>
</div>
      </div>

      {/* Workout Plan Form Modal */}
      {showWorkoutForm && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-90 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Create New Workout Plan</h3>
            <form onSubmit={handleSubmitWorkoutPlan}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Plan Name</label>
                <input
                  type="text"
                  name="plan_name"
                  value={newWorkoutPlan.plan_name}
                  onChange={handleWorkoutInputChange}
                  className="w-full p-2 border rounded"
                  required
                  maxLength="100"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Duration (weeks)</label>
                <input
                  type="number"
                  name="duration_weeks"
                  value={newWorkoutPlan.duration_weeks}
                  onChange={handleWorkoutInputChange}
                  min="1"
                  max="52"
                  className="w-full p-2 border rounded"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Session Duration (mins)</label>
                <input
                  type="number"
                  name="duration_session"
                  value={newWorkoutPlan.duration_session}
                  onChange={handleWorkoutInputChange}
                  min="1"
                  max="180"
                  className="w-full p-2 border rounded"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Difficulty Level</label>
                <select
                  name="difficulty_level"
                  value={newWorkoutPlan.difficulty_level}
                  onChange={handleWorkoutInputChange}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Status</label>
                <select
                  name="status"
                  value={newWorkoutPlan.status}
                  onChange={handleWorkoutInputChange}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Notes (Optional)</label>
                <textarea
                  name="notes"
                  value={newWorkoutPlan.notes}
                  onChange={handleWorkoutInputChange}
                  className="w-full p-2 border rounded"
                  rows="3"
                  maxLength="255"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowWorkoutForm(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Create Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Diet Plan Form Modal (unchanged) */}
     {showDietForm && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-90 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Create New Diet Plan</h3>
            <form onSubmit={handleSubmitDietPlan}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Plan Name</label>
                <input
                  type="text"
                  name="plan_name"
                  value={newDietPlan.plan_name}
                  onChange={handleDietInputChange}
                  className="w-full p-2 border rounded"
                  required
                  maxLength="100"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 mb-2">
                    Daily Calories
                  </label>
                  <input
                    type="number"
                    name="daily_calories"
                    value={newDietPlan.daily_calories}
                    onChange={handleDietInputChange}
                    min="0"
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">
                    Protein (g)
                  </label>
                  <input
                    type="number"
                    name="protein_grams"
                    value={newDietPlan.protein_grams}
                    onChange={handleDietInputChange}
                    min="0"
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Carbs (g)</label>
                  <input
                    type="number"
                    name="carbs_grams"
                    value={newDietPlan.carbs_grams}
                    onChange={handleDietInputChange}
                    min="0"
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Fat (g)</label>
                  <input
                    type="number"
                    name="fat_grams"
                    value={newDietPlan.fat_grams}
                    onChange={handleDietInputChange}
                    min="0"
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-2">
                  Dietary Restrictions
                </label>
                <input
                  type="text"
                  name="dietary_restrictions"
                  value={newDietPlan.dietary_restrictions}
                  onChange={handleDietInputChange}
                  className="w-full p-2 border rounded"
                  placeholder="e.g., gluten-free, dairy-free"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-2">
                  Cuisine Preferences
                </label>
                <input
                  type="text"
                  name="cuisine_preferences"
                  value={newDietPlan.cuisine_preferences}
                  onChange={handleDietInputChange}
                  className="w-full p-2 border rounded"
                  placeholder="e.g., Mediterranean, Asian"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Status</label>
                <select
                  name="status"
                  value={newDietPlan.status}
                  onChange={handleDietInputChange}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              {/*               
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Member ID</label>
                <input
                  type="text"
                  name="member_id"
                  value={newDietPlan.member_id}
                  onChange={(e) => handleInputChange(e, setNewDietPlan)}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
               */}

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowDietForm(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Create Diet Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {workoutEye && selectedWorkoutPlan && (
        <WorkoutPlan 
          plan={selectedWorkoutPlan} 
          onClose={() => {
            setWorkoutEye(false);
            setSelectedWorkoutPlan(null);
          }} 
        />
      )}

      {dietEye && selectedDietPlan && (
        <DietPlan 
          plan={selectedDietPlan} 
          onClose={() => {
            setDietEye(false);
            setSelectedDietPlan(null);
          }} 
        />
      )}
    </div>
  );
}