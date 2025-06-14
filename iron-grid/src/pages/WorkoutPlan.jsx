import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

export default function WorkoutPlan({ plan, onClose }) {
  const [exercises, setExercises] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchExercises = useCallback(async () => {
    if (!plan?.workout_plan_id) return;

    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/getPlanExercises?plan_id=${plan.workout_plan_id}`
      );
      const data = await response.json();

        console.log('Full API response:', data); // Add this line

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch exercises");
      }
console.log('Exercises data:', data.exercises); // Add this line    
      setExercises(data.exercises || []);
      
    } catch (err) {
      console.error("Failed to fetch exercises:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [plan?.workout_plan_id]);

  const handleDeleteExercise = async (exerciseId) => {
    if (!window.confirm("Are you sure you want to remove this exercise?")) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/exercises/${exerciseId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
         body: JSON.stringify({
            context: "PLAN_DELETE",
          })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete exercise");
      }

      setExercises((prev) => prev.filter((ex) => ex.exercise_id !== exerciseId));
      alert("Exercise removed successfully");
    } catch (err) {
      console.error("Delete error:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExercises();
  }, [fetchExercises]);

  const getDayName = (dayNum) => {
    const days = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];
    return days[dayNum - 1] || "";
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold">
                {plan?.plan_name || "Workout Plan"}
              </h2>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  {plan?.duration_weeks} Weeks
                </span>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                  {plan?.duration_session} Min/Session
                </span>
                <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm capitalize">
                  {plan?.difficulty_level}
                </span>
                <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm capitalize">
                  {plan?.status}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
              disabled={isLoading}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 hover:cursor-pointer"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {error && (
            <div className="bg-red-100 text-red-800 p-3 rounded mb-4 flex justify-between">
              <span>{error}</span>
              <button onClick={() => setError(null)} className="font-bold">
                ×
              </button>
            </div>
          )}

          {isLoading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-2"></div>
              <p>Loading exercises...</p>
            </div>
          ) : exercises.length > 0 ? (
            <div className="space-y-6">
              {[1, 2, 3, 4, 5, 6, 7].map((dayNum) => {
                const dayExercises = exercises.filter(
                  (exercise) => exercise.day_num === dayNum
                );

                return (
                  dayExercises.length > 0 && (
                    <div key={dayNum} className="mb-8">
                      <h3 className="text-lg font-semibold mb-3 text-gray-800">
                        {getDayName(dayNum)}
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                       {dayExercises.map((exercise) => (
  <div
    key={`${dayNum}-${exercise.exercise_id}`}
    className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
  >
    <div className="flex justify-between items-start mb-2">
      <div>
        <h4 className="font-medium text-gray-900">
          {exercise.name} {/* Fixed: was exercise.exercise_name */}
        </h4>
        <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full capitalize mt-1">
          {exercise.category} {/* Fixed: was exercise.exercise_type */}
        </span>
      </div>
      <div className="text-right">
        <p className="font-bold text-gray-800">
          {exercise.sets}x{exercise.reps}
        </p>
        <p className="text-xs text-gray-500">
          {exercise.equipment} {/* Fixed: was exercise.target_muscle */}
        </p>
      </div>
    </div>

    <div className="flex flex-wrap gap-2 my-3">
      <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs">
        {exercise.difficulty} {/* Kept same */}
      </span>
      {exercise.rest_time && (
        <span className="bg-green-50 text-green-700 px-2 py-1 rounded text-xs">
          Rest: {exercise.rest_time}s
        </span>
      )}
    </div>

    {exercise.notes && (
      <div className="mt-2 text-sm text-gray-600">
        <p className="font-medium">Notes:</p>
        <p>{exercise.notes}</p>
      </div>
    )}

    <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100">
      {exercise.video_url && (
        <a
          href={exercise.video_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
          Watch Video
        </a>
      )}
      <button
        onClick={() => handleDeleteExercise(exercise.exercise_id)}
        className="text-red-600 hover:cursor-pointer hover:text-red-800 text-sm font-medium px-3 py-1 rounded hover:bg-red-50 flex items-center"
        disabled={isLoading}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 mr-1"
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
        Remove
      </button>
    </div>
  </div>
))}
                      </div>
                    </div>
                  )
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No exercises added to this plan yet</p>
              <button
                onClick={() => {
                  onClose();
                  navigate('/ExerciseLibrary', { state: { planId: plan.workout_plan_id } });
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <div className="flex items-center justify-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Add Exercises from Library
                </div>
              </button>
            </div>
          )}

          {plan?.notes && (
            <div className="mt-6 bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-2">Plan Notes</h3>
              <p className="text-gray-700">{plan.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}