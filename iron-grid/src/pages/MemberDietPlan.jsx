import { useEffect, useState } from "react";

const MemberDietPlan = ({ memberId }) => {
  const [dietPlan, setDietPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDietPlan = async () => {
      try {
        const response = await fetch(`/api/member/${memberId}/diet-plan`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch diet plan");
        }

        const data = await response.json();
        if (data.success && data.dietPlan) {
          setDietPlan(data.dietPlan);
        } else {
          throw new Error(data.message || "No diet plan data received");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDietPlan();
  }, [memberId]);

  const getDayName = (dayNum) => {
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    return days[dayNum] || `Day ${dayNum}`;
  };

  if (loading)
    return (
      <div className="text-white text-center py-8">Loading diet plan...</div>
    );
  if (error)
    return <div className="text-red-500 text-center py-8">Error: {error}</div>;
  if (!dietPlan)
    return (
      <div className="text-white text-center py-8">No diet plan assigned</div>
    );

  return (
    <div className="bg-gray-800 rounded-lg shadow-md p-6 text-white">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{dietPlan.plan_name}</h2>
        <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm">
          {dietPlan.difficulty_level}
        </span>
      </div>

      <div className="mb-4">
        <p className="text-gray-300">
          Daily Calories: {dietPlan.daily_calories} kcal • Cuisine:{" "}
          {dietPlan.cuisine_preferences}
        </p>
        {dietPlan.notes && (
          <p className="text-gray-400 mt-2">{dietPlan.notes}</p>
        )}
      </div>

      <div className="space-y-6">
        {[1, 2, 3, 4, 5, 6, 7].map((dayNum) => {
          const dayMeals =
            dietPlan.meals?.filter((meal) => meal.day_num === dayNum) || [];
          if (dayMeals.length === 0) return null;

          return (
            <div
              key={dayNum}
              className="bg-gray-700 rounded-lg overflow-hidden"
            >
              <div className="bg-gray-600 px-4 py-3">
                <h3 className="font-semibold text-lg">{getDayName(dayNum)}</h3>
              </div>
              <div className="divide-y divide-gray-600">
                {dayMeals.map((meal) => (
                  <div key={meal.meal_id} className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{meal.meal_name}</h4>
                        <p className="text-sm text-gray-300">
                          {meal.meal_type} • {meal.preparation_time} mins prep
                        </p>
                        <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-gray-400">Calories:</span>{" "}
                            {meal.calories}
                          </div>
                          <div>
                            <span className="text-gray-400">Protein:</span>{" "}
                            {meal.protein}g
                          </div>
                          <div>
                            <span className="text-gray-400">Carbs:</span>{" "}
                            {meal.carbs}g
                          </div>
                          <div>
                            <span className="text-gray-400">Fat:</span>{" "}
                            {meal.fat}g
                          </div>
                        </div>
                      </div>
                    </div>
                    {meal.recipe_url && (
                      <a
                        href={meal.recipe_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center text-blue-400 hover:text-blue-300 text-sm"
                      >
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                          <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                        </svg>
                        View Recipe
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MemberDietPlan;
