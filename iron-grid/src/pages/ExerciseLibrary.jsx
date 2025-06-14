import { use } from "react";
import { useEffect, useState } from "react";

const ExerciseLibrary = () => {
  const [exercises, setExercises] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [showAddForm, setShowAddForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showError, setShowError] = useState(false);

  const [newExercise, setNewExercise] = useState({
    name: "",
    category: "Cardio",
    equipment: "None",
    difficulty: "Beginner",
    calories: 0,
    instructions: "",
    video_url: "",
  });

  const categories = ["All", "cardio", "strength", "flexibility", "balance"];
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

  // Fetch exercises from backend

  const fetchExercises = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setShowError(false);

      const response = await fetch("/getExercises");

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to fetch exercises");
      }

      const data = await response.json();

      console.log("Fetched data:", data);

      if (!data.data || data.data.length === 0) {
        setShowError(true);
        setError("No Exercises Added To Library Yet!");
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
  }, []);

  // Safe filtered exercises with null checks
  const filteredExercises = (
    activeCategory === "All"
      ? exercises
      : exercises.filter((ex) => ex?.category === activeCategory)
  ).filter((ex) => ex); // Remove any undefined/null values

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
      // Validate form
      if (!newExercise.name.trim()) {
        throw new Error("Exercise name is required");
      }
      if (newExercise.calories <= 0) {
        throw new Error("Calories must be greater than 0");
      }

      setIsLoading(true);

      const response = await fetch("/exercises", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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

      // Update local state with the new exercise
      setExercises((prev) => [...prev, data.exercise]);
      setShowAddForm(false);
      setNewExercise({
        name: "",
        category: "Cardio",
        equipment: "None",
        difficulty: "Beginner",
        calories: 0,
        instructions: "",
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
    try {
      setIsLoading(true);
      setError(null);
      setShowError(false);

      const response = await fetch(`/exercises/${exerciseId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete exercise");
      }

      setExercises((prev) =>
        prev.filter((ex) => ex.exercise_id !== exerciseId)
      );

      fetchExercises();
    } catch (err) {
      console.error("Delete error:", err);
      setError(err.message);
      setShowError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-800">
      {/* Error Display */}
      {showError && error && (
        <div className="bg-red-100 text-red-800 p-4 mb-4 rounded-lg">
          {error}
          <button
            onClick={() => {
              setError(null);
              setShowError(false);
            }}
            className="float-right font-bold"
          >
            ×
          </button>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg">
            <p>Loading...</p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <section className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-3xl font-bold text-white border-2 px-2 py-2 rounded-lg bg-gray-900">
            Exercise Library
          </h2>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
            disabled={isLoading}
          >
            Add New Exercise
          </button>
        </div>

        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-white">
            {activeCategory} Exercises
          </h2>

          {/* Category Filter */}
          <div className="flex space-x-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-full font-semibold ${
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
        </div>

        {/* Add Exercise Form Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-90 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-bold mb-4">Add New Exercise</h3>
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
                  >
                    Add Exercise
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Exercise Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ">
          {filteredExercises.length > 0 ? (
            filteredExercises.map((exercise) => (
              <div
                key={exercise.exercise_id}
                className="bg-gradient-to-b from-gray-100 to-gray-400 rounded-lg shadow-md p-8 relative transition-all duration-300 ease-in-out 
             hover:transform hover:-translate-y-1 hover:shadow-lg w-full h-96"
              >
                {/* Safe property access with fallbacks */}
                <button
                  onClick={() => handleAddExercise(exercise.name)}
                  className="absolute top-4 right-4 text-blue-600 hover:text-blue-800"
                  title="Add to workout"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 hover:h-7 hover:w-7 transition-all hover:bg-white hover: rounded-xl cursor-pointer"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                </button>
                <h3 className="text-xl font-bold mb-2">
                  {exercise?.name || "Unnamed Exercise"}
                </h3>
                <p className="text-gray-600 mb-1">
                  <span className="font-medium">Category:</span>{" "}
                  {exercise?.category || "N/A"}
                </p>
                <p className="text-gray-600 mb-1">
                  <span className="font-medium">Equipment:</span>{" "}
                  {exercise?.equipment || "N/A"}
                </p>
                <p className="text-gray-600 mb-1">
                  <span className="font-medium">Difficulty:</span>{" "}
                  {exercise?.difficulty || "N/A"}
                </p>
                <p className="text-gray-600 mb-4">
                  <span className="font-medium">Calories/min:</span>{" "}
                  {exercise?.calories || "0"}
                </p>

                {(exercise?.instructions || exercise?.video_url) && (
                  <div className="mb-3 space-y-2 bg-gray-300 font-semibold text-center border-1 rounded-lg text-gray-600 hover:border-none transition-all duration-300 ease-in-out 
             hover:transform hover:-translate-y-1 hover:shadow-lg cursor-pointer">
                   Instructions
                  </div>
                )}

                <button
                  onClick={() => handleDeleteExercise(exercise.exercise_id)}
                  className="absolute bottom-1 right-1 border-2 text-white border-black rounded-lg bg-red-700 font-semibold px-1 py-1 cursor-pointer hover:px-2 hover:py-2 transition-all hover:bg-red-500"
                  disabled={isLoading}
                >
                  Delete
                </button>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center text-white py-8 bg-gray-500 font-bold border-1 rounded-lg">
              {isLoading
                ? "Loading exercises..."
                : "No exercises found in this category"}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default ExerciseLibrary;
