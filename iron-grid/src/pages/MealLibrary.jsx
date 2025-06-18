import { useEffect, useState } from "react";

const MealLibrary = () => {
  const [meals, setMeals] = useState([]);
  const [dietPlans, setDietPlans] = useState([]); // Added dietPlans state
  const [activeType, setActiveType] = useState("All");
  const [showAddForm, setShowAddForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showError, setShowError] = useState(false);
  const [showAddMealModal, setShowAddMealModal] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [selectedDay, setSelectedDay] = useState(1);

  const [newMeal, setNewMeal] = useState({
    m_name: "",
    type: "breakfast",
    preparationTime: 10,
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    servingSize: "",
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    recipeUrl: "",
  });

  const mealTypes = ["All", "breakfast", "lunch", "dinner", "snack"];

  // Fetch diet plans from backend
  const fetchDietPlans = async () => {
    try {
      const response = await fetch("/getDietPlans", {
        headers: {
          user_id: localStorage.getItem("user_id"),
        },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch diet plans");
      }

      setDietPlans(data.data || []);
    } catch (err) {
      console.error("Error fetching diet plans:", err);
      setError(err.message);
      setShowError(true);
    }
  };

  // Fetch meals from backend
  const fetchMeals = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setShowError(false);

      const response = await fetch("/getMeals");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch meals");
      }

      if (!data.data || data.data.length === 0) {
        setShowError(true);
        setError("No meals found in the library");
        setMeals([]);
        return;
      }

      const mappedMeals = data.data
        .filter((meal) => meal && meal.meal_id)
        .map((meal) => ({
          meal_id: meal.meal_id || "",
          trainer_id: meal.trainer_id || "",
          m_name: meal.meal_name || "Unnamed Meal",
          type: meal.meal_type || "other",
          preparationTime: meal.preparation_time || 0,
          isVegetarian: Boolean(meal.is_vegetarian),
          isVegan: Boolean(meal.is_vegan),
          isGlutenFree: Boolean(meal.is_gluten_free),
          servingSize: meal.serving_size || "",
          calories: meal.calories || 0,
          protein: meal.protein || 0,
          carbs: meal.carbs || 0,
          fat: meal.fat || 0,
          fiber: meal.fiber || 0,
          recipeUrl: meal.recipe_url || "",
        }));

      setMeals(mappedMeals);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.message);
      setShowError(true);
      setMeals([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMeals();
    fetchDietPlans(); // Fetch diet plans when component mounts
  }, []);

  const filteredMeals =
    activeType === "All"
      ? meals
      : meals.filter((meal) => meal?.type === activeType);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewMeal((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : type === "number"
          ? parseFloat(value) || 0
          : value,
    }));
  };

  const handleSubmitMeal = async (e) => {
    e.preventDefault();
    setError(null);
    setShowError(false);

    try {
      if (!newMeal.m_name.trim()) {
        throw new Error("Meal name is required");
      }
      if (newMeal.calories <= 0) {
        throw new Error("Calories must be greater than 0");
      }

      setIsLoading(true);

      const response = await fetch("/meals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...newMeal,
          user_id: localStorage.getItem("user_id"),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to add meal");
      }

      setMeals((prev) => [
        ...prev,
        {
          ...newMeal,
          meal_id: data.meal_id || Date.now().toString(),
        },
      ]);

      setShowAddForm(false);
      setNewMeal({
        m_name: "",
        type: "breakfast",
        preparationTime: 10,
        isVegetarian: false,
        isVegan: false,
        isGlutenFree: false,
        servingSize: "",
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0,
        recipeUrl: "",
      });

      fetchMeals();
    } catch (err) {
      console.error("Submission error:", err);
      setError(err.message);
      setShowError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteMeal = async (mealId) => {
    try {
      setIsLoading(true);
      setError(null);
      setShowError(false);

      const response = await fetch(`/meals/${mealId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete meal");
      }

      setMeals((prev) => prev.filter((meal) => meal.meal_id !== mealId));
    } catch (err) {
      console.error("Delete error:", err);
      setError(err.message);
      setShowError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMealToPlan = (meal) => {
    setSelectedMeal(meal);
    setShowAddMealModal(true);
  };

  const handleAddToPlanSubmit = async (e) => {
    e.preventDefault();

    try {
      setIsLoading(true);
      const response = await fetch("/addMealToPlan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          meal_id: selectedMeal.meal_id,
          plan_id: selectedPlanId,
          user_id: localStorage.getItem("user_id"),
          day_num: selectedDay,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to add meal to plan");
      }

      setShowAddMealModal(false);
      setSelectedMeal(null);
      setSelectedPlanId("");

      alert("Meal added to plan successfully!");

      await fetchDietPlans();
    } catch (err) {
      console.error("Error adding meal to plan:", err);
      setError(err.message);
      setShowError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const getDayName = (dayNum) => {
    const days = {
      1: "Monday",
      2: "Tuesday",
      3: "Wednesday",
      4: "Thursday",
      5: "Friday",
      6: "Saturday",
      7: "Sunday",
    };
    return days[dayNum] || "";
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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              Meal Library
            </h2>
            <p className="text-gray-300">
              Browse and manage your Meal collection
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
            disabled={isLoading}
          >
            Add New Meal
          </button>
        </div>

        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-white capitalize">
            {activeType === "All" ? "All" : activeType} Meals
          </h2>

          {/* Meal Type Filter */}
          <div className="flex space-x-2">
            {mealTypes.map((type) => (
              <button
                key={type}
                onClick={() => setActiveType(type)}
                className={`px-4 py-2 rounded-full capitalize font-semibold ${
                  activeType === type
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-200"
                }`}
                disabled={isLoading}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Add Meal Form Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-90 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-bold mb-4">Add New Meal</h3>
              <form onSubmit={handleSubmitMeal}>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Meal Name</label>
                  <input
                    type="text"
                    name="m_name"
                    value={newMeal.m_name}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Meal Type</label>
                  <select
                    name="type"
                    value={newMeal.type}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  >
                    {mealTypes
                      .filter((t) => t !== "All")
                      .map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">
                    Preparation Time (minutes)
                  </label>
                  <input
                    type="number"
                    name="preparationTime"
                    value={newMeal.preparationTime}
                    onChange={handleInputChange}
                    min="1"
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>

                <div className="mb-4 grid grid-cols-3 gap-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="isVegetarian"
                      checked={newMeal.isVegetarian}
                      onChange={handleInputChange}
                      className="h-5 w-5"
                    />
                    <span>Vegetarian</span>
                  </label>

                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="isVegan"
                      checked={newMeal.isVegan}
                      onChange={handleInputChange}
                      className="h-5 w-5"
                    />
                    <span>Vegan</span>
                  </label>

                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="isGlutenFree"
                      checked={newMeal.isGlutenFree}
                      onChange={handleInputChange}
                      className="h-5 w-5"
                    />
                    <span>Gluten Free</span>
                  </label>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">
                    Serving Size
                  </label>
                  <input
                    type="text"
                    name="servingSize"
                    value={newMeal.servingSize}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-gray-700 mb-2">Calories</label>
                    <input
                      type="number"
                      name="calories"
                      value={newMeal.calories}
                      onChange={handleInputChange}
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
                      name="protein"
                      value={newMeal.protein}
                      onChange={handleInputChange}
                      step="0.1"
                      min="0"
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2">
                      Carbs (g)
                    </label>
                    <input
                      type="number"
                      name="carbs"
                      value={newMeal.carbs}
                      onChange={handleInputChange}
                      step="0.1"
                      min="0"
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2">Fat (g)</label>
                    <input
                      type="number"
                      name="fat"
                      value={newMeal.fat}
                      onChange={handleInputChange}
                      step="0.1"
                      min="0"
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Fiber (g)</label>
                  <input
                    type="number"
                    name="fiber"
                    value={newMeal.fiber}
                    onChange={handleInputChange}
                    step="0.1"
                    min="0"
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">
                    Recipe URL (Optional)
                  </label>
                  <input
                    type="url"
                    name="recipeUrl"
                    value={newMeal.recipeUrl}
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
                    {isLoading ? "Adding..." : "Add Meal"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Meal to Plan Modal */}
        {showAddMealModal && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-90 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg w-full max-w-md">
              <h3 className="text-xl font-bold mb-4">Add Meal to Plan</h3>
              <form onSubmit={handleAddToPlanSubmit}>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">
                    Select Plan
                  </label>
                  <select
                    value={selectedPlanId}
                    onChange={(e) => setSelectedPlanId(e.target.value)}
                    className="w-full p-2 border rounded"
                    required
                  >
                    <option value="">Select a plan</option>
                    {dietPlans.map((plan) => (
                      <option key={plan.diet_plan_id} value={plan.diet_plan_id}>
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
                    {[1, 2, 3, 4, 5, 6, 7].map((dayNum) => (
                      <option key={dayNum} value={dayNum}>
                        {getDayName(dayNum)}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedMeal && (
                  <div className="mb-4 p-4 bg-gray-100 rounded">
                    <h4 className="font-semibold">Selected Meal:</h4>
                    <p>{selectedMeal.m_name}</p>
                    <p className="text-sm text-gray-600">
                      {selectedMeal.calories} calories • {selectedMeal.protein}g
                      protein
                    </p>
                  </div>
                )}

                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddMealModal(false);
                      setSelectedMeal(null);
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
                    {isLoading ? "Adding..." : "Add to Plan"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Meal Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {isLoading ? (
            <div className="col-span-full text-center text-white py-8">
              Loading meals...
            </div>
          ) : filteredMeals.length > 0 ? (
            filteredMeals.map((meal) =>
              meal && meal.meal_id ? (
                <div
                  key={meal.meal_id}
                  className="overflow-hidden bg-gradient-to-b from-gray-100 to-gray-400 rounded-lg shadow-md p-8 relative hover:shadow-lg transition-all duration-300 w-full h-96"
                >
                  <button
                    onClick={() => handleAddMealToPlan(meal)}
                    className="absolute top-4 right-4 text-blue-600 hover:text-blue-800"
                    title="Add to meal plan"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 hover:h-7 hover:w-7 hover:cursor-pointer transition-all hover:bg-white hover:rounded-xl"
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

                  {/* ... (rest of your meal card content) ... */}

                  <h3 className="text-xl font-bold mb-2 capitalize">
                    {meal.m_name || "Unnamed Meal"}
                  </h3>
                  <p className="text-gray-600 mb-1">
                    <span className="font-medium">Type:</span>{" "}
                    <span className="capitalize">{meal.type || "other"}</span>
                  </p>
                  <p className="text-gray-600 mb-1">
                    <span className="font-medium">Prep Time:</span>{" "}
                    {meal.preparationTime || 0} mins
                  </p>
                  <p className="text-gray-600 mb-1">
                    <span className="font-medium">Serving:</span>{" "}
                    {meal.servingSize || "N/A"}
                  </p>

                  <div className="my-3 p-2 bg-gray-200 rounded h-9 overflow-hidden hover:h-45 transition-all">
                    <p className="text-gray-800 font-semibold">Nutrition</p>
                    <p className="text-gray-600">
                      Calories: {meal.calories || 0}
                    </p>
                    <p className="text-gray-600">
                      Protein: {meal.protein || 0}g
                    </p>
                    <p className="text-gray-600">Carbs: {meal.carbs || 0}g</p>
                    <p className="text-gray-600">Fat: {meal.fat || 0}g</p>
                    <p className="text-gray-600">Fiber: {meal.fiber || 0}g</p>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {meal.isVegetarian && (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                        Vegetarian
                      </span>
                    )}
                    {meal.isVegan && (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                        Vegan
                      </span>
                    )}
                    {meal.isGlutenFree && (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                        Gluten Free
                      </span>
                    )}
                  </div>

                  {meal.recipeUrl && (
                    <a
                      href={meal.recipeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 font-medium inline-block mt-2"
                    >
                      View Recipe
                    </a>
                  )}

                  <div className="absolute bottom-1 right-1">
                    <button
                      onClick={() => handleDeleteMeal(meal.meal_id)}
                      className="border-2 text-white border-black rounded-lg bg-red-700 font-semibold px-1 py-1 hover:px-2 hover:py-2 transition-all hover:bg-red-500"
                      disabled={isLoading}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ) : null
            )
          ) : (
            <div className="col-span-full text-center text-white py-8 bg-gray-500 font-bold border-1 rounded-lg">
              No meals found in this category
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default MealLibrary;
