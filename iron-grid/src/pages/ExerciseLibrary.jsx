import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const ExerciseLibrary = () => {
  const [exercises, setExercises] = useState([]);
  const [workoutPlans, setWorkoutPlans] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [showAddForm, setShowAddForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showError, setShowError] = useState(false);
  const [showAddExerciseModal, setShowAddExerciseModal] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [selectedDay, setSelectedDay] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const [newExercise, setNewExercise] = useState({
    name: "",
    category: "Cardio",
    equipment: "None",
    difficulty: "Beginner",
    calories: 0,
    instructions: "",
    video_url: "",
  });

  const categories = ["All", "Cardio", "Strength", "Flexibility", "Balance"];
  const equipmentOptions = [
    "None",
    "Mat",
    "Bar",
    "Barbell",
    "Dumbbells",
    "Kettlebells",
    "Resistance Bands",
    "Bosu Ball",
    "Medicine Ball",
  ];
  const difficultyOptions = ["Beginner", "Intermediate", "Advanced"];

  // Fetch workout plans from backend
  const fetchWorkoutPlans = async () => {
    try {
      const response = await fetch('/getWorkoutPlans', {
        headers: {
          'user_id': localStorage.getItem("user_id"),
          'Authorization': `Bearer ${localStorage.getItem("token")}`
        }
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch workout plans");
      }

      setWorkoutPlans(data.data || []);
    } catch (err) {
      console.error("Error fetching workout plans:", err);
      setError(err.message);
      setShowError(true);
    }
  };

  // Fetch exercises from backend
  const fetchExercises = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setShowError(false);

      const response = await fetch("/getExercises", {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem("token")}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to fetch exercises");
      }

      const data = await response.json();

      if (!data.data || data.data.length === 0) {
        setShowError(true);
        setError("No exercises found in the library");
        setExercises([]);
      } else {
        const mappedExercises = data.data.map((ex) => ({
          exercise_id: ex.exercise_id,
          trainer_id: ex.trainer_id,
          name: ex.ex_name,
          category: ex.category,
          equipment: ex.equipment_needed,
          difficulty: ex.difficulty,
          calories: ex.calories_burned_per_min,
          instructions: ex.instructions,
          video_url: ex.video_url,
        }));

        setExercises(mappedExercises);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.message);
      setShowError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExercises();
    fetchWorkoutPlans();
  }, []);

  const filteredExercises = exercises.filter((exercise) => {
    if (!exercise) return false;
    
    const matchesCategory = 
      activeCategory === "All" || 
      (exercise.category && exercise.category.toLowerCase() === activeCategory.toLowerCase());
    const matchesSearch = 
      (exercise.name && exercise.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (exercise.category && exercise.category.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewExercise((prev) => ({
      ...prev,
      [name]: name === "calories" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmitExercise = async (e) => {
    e.preventDefault();
    setError(null);
    setShowError(false);

    try {
     
      if (newExercise.calories <= 0) {
        throw new Error("Calories must be greater than 0");
      }

      setIsLoading(true);

      const response = await fetch("/exercises", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          ...newExercise,
          user_id: localStorage.getItem("user_id"),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to add exercise");
      }

      setExercises((prev) => [...prev, data.exercise]);
      setShowAddForm(false);
      setNewExercise({
        name: "",
        category: "Cardio",
        equipment: "None",
        difficulty: "Beginner",
        calories: 0,
        instructions: "",
        video_url: "",
      });

      fetchExercises();
    } catch (err) {
      console.error("Submission error:", err);
      setError(err.message);
      setShowError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteExercise = async (exerciseId) => {
    if (!window.confirm("Are you sure you want to delete this exercise?")) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setShowError(false);

      const response = await fetch(`/exercises/${exerciseId}`, {
        method: "DELETE",
        headers: {
          'Authorization': `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          context: 'DIRECT_DELETE'
        })
      });

      if (!response.ok) {
        throw new Error("Failed to delete exercise");
      }

      setExercises((prev) =>
        prev.filter((ex) => ex.exercise_id !== exerciseId)
      );
    } catch (err) {
      console.error("Delete error:", err);
      setError(err.message);
      setShowError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddExerciseToPlan = (exercise) => {
    setSelectedExercise(exercise);
    setShowAddExerciseModal(true);
  };

  const handleAddToPlanSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      const response = await fetch('/addExerciseToPlan', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          exercise_id: selectedExercise.exercise_id,
          workout_plan_id: selectedPlanId,
          user_id: localStorage.getItem("user_id"),
          day_num: selectedDay,
          sets: 3, // Default values
          reps: 10  // Default values
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to add exercise to plan");
      }

      setShowAddExerciseModal(false);
      setSelectedExercise(null);
      setSelectedPlanId('');
      
      alert('Exercise added to plan successfully!');
      
      await fetchWorkoutPlans();
    } catch (err) {
      console.error("Error adding exercise to plan:", err);
      setError(err.message);
      setShowError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const getDayName = (dayNum) => {
    const days = {
      1: 'Monday',
      2: 'Tuesday',
      3: 'Wednesday',
      4: 'Thursday',
      5: 'Friday',
      6: 'Saturday',
      7: 'Sunday'
    };
    return days[dayNum] || '';
  };

  const handleExerciseClick = (exercise) => {
    navigate(`/exercise-details/${exercise.exercise_id}`, {
      state: { exercise },
    });
  };

  return (
    <div className="min-h-screen bg-gray-800">
      {/* Error Display */}
      {showError && error && (
        <div className="fixed top-4 right-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg shadow-lg z-50 max-w-md">
          <div className="flex justify-between items-center">
            <p>{error}</p>
            <button
              onClick={() => setShowError(false)}
              className="ml-4 text-red-900 font-bold"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl flex items-center space-x-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span>Loading...</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <section className="container mx-auto p-4 md:p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              Exercise Library
            </h2>
            <p className="text-gray-300">
              Browse and manage your Exercise collection
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <input
              type="text"
              placeholder="Search exercises..."
              className="px-4 py-2 border rounded-lg text-gray-300 focus:outline-none focus:ring-2 focus:ring-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold whitespace-nowrap"
              disabled={isLoading}
            >
              Add New Exercise
            </button>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 rounded-full font-medium transition-colors ${
                activeCategory === category
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-200"
              }`}
              disabled={isLoading}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Add Exercise Form Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-90 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Add New Exercise</h3>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <form onSubmit={handleSubmitExercise}>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">
                    Exercise Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={newExercise.name}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Category</label>
                  <select
                    name="category"
                    value={newExercise.category}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  >
                    {categories
                      .filter((c) => c !== "All")
                      .map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">
                    Equipment Needed
                  </label>
                  <select
                    name="equipment"
                    value={newExercise.equipment}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  >
                    {equipmentOptions.map((equipment) => (
                      <option key={equipment} value={equipment}>
                        {equipment}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Difficulty</label>
                  <select
                    name="difficulty"
                    value={newExercise.difficulty}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  >
                    {difficultyOptions.map((difficulty) => (
                      <option key={difficulty} value={difficulty}>
                        {difficulty}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">
                    Calories per Minute
                  </label>
                  <input
                    type="number"
                    name="calories"
                    value={newExercise.calories}
                    onChange={handleInputChange}
                    step="0.1"
                    min="0"
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">
                    Instructions (Optional)
                  </label>
                  <textarea
                    name="instructions"
                    value={newExercise.instructions}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    rows="3"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Video URL</label>
                  <input
                    placeholder="Optional"
                    type="text"
                    name="video_url"
                    value={newExercise.video_url}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Adding...' : 'Add Exercise'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Exercise to Plan Modal */}
        {showAddExerciseModal && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-90 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Add Exercise to Plan</h3>
                <button
                  onClick={() => {
                    setShowAddExerciseModal(false);
                    setSelectedExercise(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <form onSubmit={handleAddToPlanSubmit}>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Select Plan</label>
                  <select
                    value={selectedPlanId}
                    onChange={(e) => setSelectedPlanId(e.target.value)}
                    className="w-full p-2 border rounded"
                    required
                  >
                    <option value="">Select a plan</option>
                    {workoutPlans.map(plan => (
                      <option key={plan.workout_plan_id} value={plan.workout_plan_id}>
                        {plan.plan_name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Select Day</label>
                  <select
                    value={selectedDay}
                    onChange={(e) => setSelectedDay(parseInt(e.target.value))}
                    className="w-full p-2 border rounded"
                    required
                  >
                    {[1, 2, 3, 4, 5, 6, 7].map(dayNum => (
                      <option key={dayNum} value={dayNum}>
                        {getDayName(dayNum)}
                      </option>
                    ))}
                  </select>
                </div>
                
                {selectedExercise && (
                  <div className="mb-4 p-4 bg-gray-100 rounded">
                    <h4 className="font-semibold">Selected Exercise:</h4>
                    <p>{selectedExercise.name}</p>
                    <p className="text-sm text-gray-600">
                      {selectedExercise.calories} calories/min • {selectedExercise.difficulty}
                    </p>
                  </div>
                )}
                
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddExerciseModal(false);
                      setSelectedExercise(null);
                    }}
                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Adding...' : 'Add to Plan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Exercise Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {isLoading ? (
            <div className="col-span-full text-center text-white py-8">
              Loading exercises...
            </div>
          ) : filteredExercises.length > 0 ? (
            filteredExercises.map((exercise) => (
              exercise && exercise.exercise_id ? (
                <div 
                  key={exercise.exercise_id}
                  className="overflow-hidden bg-gradient-to-b from-gray-100 to-gray-400 rounded-lg shadow-md p-6 relative hover:shadow-lg transition-all duration-300 w-full h-96 flex flex-col"
                >
                  <button 
                    onClick={() => handleAddExerciseToPlan(exercise)}
                    className="absolute top-4 right-4 text-blue-600 hover:text-blue-800"
                    title="Add to workout plan"
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-6 w-6 hover:h-7 hover:w-7 hover:cursor-pointer transition-all hover:bg-white hover:rounded-xl" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </button>
                  
                  <h3 
                    className="text-xl font-bold mb-2 cursor-pointer hover:text-blue-600"
                    onClick={() => handleExerciseClick(exercise)}
                  >
                    {exercise.name || 'Unnamed Exercise'}
                  </h3>
                  
                  <div className="flex flex-wrap gap-2 mb-2">
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded capitalize">
                      {exercise.category || 'N/A'}
                    </span>
                    <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded capitalize">
                      {exercise.difficulty || 'N/A'}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-1">
                    <span className="font-medium">Equipment:</span> {exercise.equipment || 'N/A'}
                  </p>
                  
                  <p className="text-gray-600 mb-3">
                    <span className="font-medium">Calories/min:</span> {exercise.calories || '0'}
                  </p>
                  
                  <div className="my-3 p-2 bg-gray-200 rounded h-9 overflow-hidden hover:h-45 transition-all">
                    <p className="text-gray-800 font-semibold">Instructions</p>
                    <p className="text-gray-600 text-sm mt-1">
                      {exercise.instructions || 'No instructions provided'}
                    </p>
                     {exercise.video_url && (
                    <a 
                      href={exercise.video_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 font-medium inline-block mt-2 text-sm"
                    >
                      View Video
                    </a>
                  )}
                  </div>
                  
                 
                  
                  <div className='absolute bottom-2 right-2'>
                    <button 
                      onClick={() => handleDeleteExercise(exercise.exercise_id)}
                      className='border-2 text-white border-black rounded-lg bg-red-700 font-semibold px-2 py-1 hover:bg-red-500 transition-all'
                      disabled={isLoading}
                    >
                      Delete
                    </button>
                  </div>
                </div>                
              ) : null
            ))
          ) : (
            <div className="col-span-full text-center text-white py-8 bg-gray-600 font-bold rounded-lg">
              No exercises found matching your criteria
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default ExerciseLibrary;