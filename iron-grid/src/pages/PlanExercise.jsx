import { useEffect, useState } from 'react';

const PlanExercises = ({ workoutPlanId }) => {
  const [exercises, setExercises] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Map day numbers to day names
  const dayNames = {
    1: 'Monday',
    2: 'Tuesday',
    3: 'Wednesday',
    4: 'Thursday',
    5: 'Friday',
    6: 'Saturday',
    7: 'Sunday'
  };

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const response = await fetch(`/api/workout-plans/${workoutPlanId}/exercises`);
        if (response.ok) {
          const data = await response.json();
          setExercises(data);
        }
      } catch (err) {
        console.error("Error fetching exercises:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExercises();
  }, [workoutPlanId]);

  if (isLoading) {
    return <div className="text-center py-4">Loading exercises...</div>;
  }

  if (exercises.length === 0) {
    return <div className="text-gray-400 py-4">No exercises found for this plan.</div>;
  }

  // Group exercises by day
  const exercisesByDay = exercises.reduce((acc, exercise) => {
    if (!acc[exercise.day_num]) {
      acc[exercise.day_num] = [];
    }
    acc[exercise.day_num].push(exercise);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {Object.entries(exercisesByDay)
        .sort(([dayA], [dayB]) => dayA - dayB) // Sort days in order
        .map(([dayNum, dayExercises]) => (
          <div key={dayNum} className="bg-gray-800 p-4 rounded-lg">
            <h5 className="font-medium mb-3">{dayNames[dayNum] || `Day ${dayNum}`}:</h5>
            <div className="space-y-3">
              {dayExercises.map(exercise => (
                <div key={exercise.exercise_id} className="flex items-start">
                  <div className="flex-1">
                    <p className="font-medium">{exercise.ex_name}</p>
                    <p className="text-sm text-gray-300">
                      {exercise.sets} sets × {exercise.reps} reps
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {exercise.category} • {exercise.equipment_needed || 'No equipment'}
                    </p>
                    {exercise.instructions && (
                      <p className="text-xs text-gray-500 mt-1">{exercise.instructions}</p>
                    )}
                  </div>
                  {exercise.video_url && (
                    <a 
                      href={exercise.video_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 ml-2"
                      title="View exercise video"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v8a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z" />
                      </svg>
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
    </div>
  );
};

export default PlanExercises;